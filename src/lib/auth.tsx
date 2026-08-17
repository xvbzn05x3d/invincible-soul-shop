import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type Profile = { id: string; username: string; avatar_url: string | null };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signUpWithPhone: (phone: string, password: string, username: string) => Promise<void>;
  signInWithPhone: (phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) return "7" + digits.slice(1);
  return digits;
}

function phoneToEmail(phone: string) {
  return `p${normalizePhone(phone)}@invincible-soul.app`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        setTimeout(() => void loadProfile(nextSession.user.id), 0);
      } else {
        setProfile(null);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) void loadProfile(data.session.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    refreshProfile: async () => {
      if (session?.user) await loadProfile(session.user.id);
    },
    signUpWithPhone: async (phone, password, username) => {
      const normalized = normalizePhone(phone);
      if (normalized.length < 11) throw new Error("Введите номер телефона в формате +7 XXX XXX-XX-XX");
      const { data, error } = await supabase.auth.signUp({
        email: phoneToEmail(phone),
        password,
        options: { emailRedirectTo: window.location.origin, data: { username } },
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert({ id: userId, username });
        await supabase.from("profile_contacts").upsert({ user_id: userId, phone: "+" + normalized });
        await loadProfile(userId);
      }
    },
    signInWithPhone: async (phone, password) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: phoneToEmail(phone),
        password,
      });
      if (error) throw error;
    },
    signOut: async () => {
      await supabase.auth.signOut();
      setProfile(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}