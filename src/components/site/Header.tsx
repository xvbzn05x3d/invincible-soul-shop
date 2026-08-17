import { Link } from "@tanstack/react-router";
import { ShoppingBag, User } from "lucide-react";

import logo from "@/assets/logo.png.asset.json";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export function Header() {
  const { count } = useCart();
  const { user, profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo.url} alt="Логотип INVINCIBLE SOUL" className="h-9 w-9 object-contain" />
          <span className="font-[var(--font-display)] text-base font-extrabold tracking-tight text-foreground sm:text-lg">
            INVINCIBLE <span className="text-primary">SOUL</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/" hash="catalog" className="transition-colors hover:text-primary">
            Каталог
          </Link>
          <Link to="/" hash="advantages" className="transition-colors hover:text-primary">
            Преимущества
          </Link>
          <Link to="/" hash="contacts" className="transition-colors hover:text-primary">
            Контакты
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            to="/cart"
            className="relative inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Корзина</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <Link
              to="/profile"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span className="hidden max-w-24 truncate sm:inline">
                {profile?.username ?? "Профиль"}
              </span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Войти</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}