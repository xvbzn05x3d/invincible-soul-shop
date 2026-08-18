import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/shop";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Профиль покупателя — INVINCIBLE SOUL" },
      {
        name: "description",
        content:
          "Профиль INVINCIBLE SOUL: имя пользователя, аватарка и история заказов. Телефон виден только вам.",
      },
      { property: "og:title", content: "Профиль — INVINCIBLE SOUL" },
      { property: "og:description", content: "Имя пользователя, аватар и история заказов." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profile_contacts")
      .select("phone")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setPhone((data?.phone as string) ?? ""));
  }, [user]);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total, status, city, pickup_point")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!user) return <div className="p-10 text-center text-muted-foreground">Загрузка…</div>;

  const saveUsername = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.from("profiles").upsert({ id: user.id, username });
      if (error) throw error;
      await refreshProfile();
      toast.success("Профиль обновлён");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось сохранить");
    } finally {
      setBusy(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    setBusy(true);
    try {
      const path = `${user.id}/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file);
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: username || "Покупатель",
          avatar_url: signed?.signedUrl ?? null,
        });
      if (error) throw error;
      await refreshProfile();
      toast.success("Аватар обновлён");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось загрузить фото");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Мой профиль</h1>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center gap-5">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Аватар"
                className="h-20 w-20 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                {(profile?.username ?? "П").slice(0, 1).toUpperCase()}
              </div>
            )}
            <label className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary">
              Загрузить аватарку
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadAvatar(file);
                }}
              />
            </label>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-muted-foreground">Имя пользователя</label>
              <input
                className="mt-1 h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none focus:border-primary"
                value={username}
                maxLength={40}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">
                Телефон (виден только вам и магазину)
              </label>
              <input
                className="mt-1 h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-muted-foreground"
                value={phone}
                readOnly
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveUsername}
              disabled={busy}
              className="h-11 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                await navigate({ to: "/" });
              }}
              className="h-11 rounded-xl border border-border px-6 font-semibold transition-colors hover:border-destructive hover:text-destructive"
            >
              Выйти
            </button>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-tight">Мои заказы</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-muted-foreground">
              Заказов пока нет.{" "}
              <Link to="/" hash="catalog" className="font-semibold text-primary">
                Выбрать товар
              </Link>
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id as string}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-semibold">
                      Заказ от {new Date(o.created_at as string).toLocaleDateString("ru-RU")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {o.city as string} · {o.pickup_point as string}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold">{money(Number(o.total))}</p>
                    <p className="text-xs uppercase text-muted-foreground">{o.status as string}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}