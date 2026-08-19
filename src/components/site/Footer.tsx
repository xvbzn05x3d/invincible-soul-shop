import { Mail, Phone } from "lucide-react";

import logo from "@/assets/logo.png.asset.json";
import { SHOP } from "@/lib/shop";
import { TelegramIcon, VkIcon } from "./Icons";

export function ContactLinks({ compact = false }: { compact?: boolean }) {
  const base =
    "inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-all hover:border-primary hover:shadow-[var(--shadow-hover)]";
  return (
    <div className={compact ? "flex flex-wrap gap-3" : "grid gap-3 sm:grid-cols-2"}>
      <a href={SHOP.telegram} target="_blank" rel="noreferrer" className={base}>
        <TelegramIcon />
        Telegram-канал магазина
      </a>
      <a href={SHOP.vk} target="_blank" rel="noreferrer" className={base}>
        <VkIcon />
        Сообщество ВКонтакте
      </a>
      <a href={`mailto:${SHOP.email}`} className={base}>
        <Mail className="h-5 w-5 text-primary" />
        {SHOP.email}
      </a>
      <a href={`tel:${SHOP.phone}`} className={base}>
        <Phone className="h-5 w-5 text-primary" />
        {SHOP.phoneLabel}
      </a>
    </div>
  );
}

export function Footer() {
  return (
    <footer id="contacts" className="border-t border-border bg-secondary/60 animate-in fade-in duration-700">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo.url} alt="Логотип INVINCIBLE SOUL" className="h-12 w-12 object-contain" />
            <span className="font-[var(--font-display)] text-xl font-extrabold tracking-tight">
              INVINCIBLE <span className="text-primary">SOUL</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Спортивная одежда и экипировка для мужчин и женщин любого возраста. Доступные цены и
            гарантированное качество — доставка по всей России через СДЭК и Ozon.
          </p>
        </div>
        <div>
          <h3 className="font-[var(--font-display)] text-lg font-bold">Обратная связь</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Напишите нам удобным способом — ответим в течение дня.
          </p>
          <div className="mt-4">
            <ContactLinks />
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} INVINCIBLE SOUL
      </div>
    </footer>
  );
}