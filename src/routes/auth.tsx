import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/logo.png.asset.json";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход и регистрация — INVINCIBLE SOUL" },
      {
        name: "description",
        content:
          "Регистрация по номеру телефона в магазине спортивной одежды INVINCIBLE SOUL: заказы, отзывы и профиль с аватаркой.",
      },
      { property: "og:title", content: "Вход и регистрация — INVINCIBLE SOUL" },
      { property: "og:description", content: "Регистрация по номеру телефона за минуту." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { signInWithPhone, signUpWithPhone, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: "/profile" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "register") {
        await signUpWithPhone(phone, password, username.trim() || "Покупатель");
        toast.success("Регистрация завершена");
      } else {
        await signInWithPhone(phone, password);
        toast.success("Вы вошли в аккаунт");
      }
      await navigate({ to: "/profile" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось выполнить вход");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none transition-colors focus:border-primary";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[image:var(--gradient-soft)] px-4 py-12">
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Вернуться в магазин
      </Link>

      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <img src={logo.url} alt="Логотип INVINCIBLE SOUL" className="h-10 w-10 object-contain" />
          <span className="font-bold tracking-tight">
            INVINCIBLE <span className="text-primary">SOUL</span>
          </span>
        </Link>

        <h1 className="mt-6 text-2xl font-extrabold">
          {mode === "register" ? "Регистрация по телефону" : "Вход в аккаунт"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Номер телефона виден только вам и магазину — другие покупатели его не увидят.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            className={field}
            type="tel"
            required
            placeholder="+7 900 000-00-00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {mode === "register" && (
            <input
              className={field}
              type="text"
              placeholder="Имя пользователя"
              maxLength={40}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <input
            className={field}
            type="password"
            required
            minLength={6}
            placeholder="Пароль (от 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Подождите…" : mode === "register" ? "Зарегистрироваться" : "Войти"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "register" ? "login" : "register")}
          className="mt-4 w-full text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          {mode === "register" ? "У меня уже есть аккаунт" : "Создать новый аккаунт"}
        </button>
      </div>
    </div>
  );
}