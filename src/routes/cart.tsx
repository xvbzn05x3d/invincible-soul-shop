import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { fetchPickupPoints, imageForSlug, money, SHOP } from "@/lib/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Корзина и оформление заказа — INVINCIBLE SOUL" },
      {
        name: "description",
        content:
          "Корзина INVINCIBLE SOUL: выберите регион и пункт выдачи СДЭК или Ozon и оформите онлайн-заказ за минуту.",
      },
      { property: "og:title", content: "Корзина — INVINCIBLE SOUL" },
      { property: "og:description", content: "Оформите онлайн-заказ с доставкой СДЭК и Ozon." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: points = [] } = useQuery({ queryKey: ["pickup-points"], queryFn: fetchPickupPoints });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [pointId, setPointId] = useState("");
  const [comment, setComment] = useState("");
  const [channel, setChannel] = useState<"telegram" | "email">("telegram");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile?.username && !name) setName(profile.username);
  }, [profile, name]);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profile_contacts")
      .select("phone")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.phone) setPhone((prev) => prev || (data.phone as string));
      });
  }, [user]);

  const regions = useMemo(() => [...new Set(points.map((p) => p.region))], [points]);
  const cities = useMemo(
    () => [...new Set(points.filter((p) => p.region === region).map((p) => p.city))],
    [points, region],
  );
  const cityPoints = useMemo(
    () => points.filter((p) => p.region === region && p.city === city),
    [points, region, city],
  );
  const selectedPoint = cityPoints.find((p) => p.id === pointId);

  const field =
    "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none transition-colors focus:border-primary";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Войдите, чтобы оформить заказ");
      void navigate({ to: "/auth" });
      return;
    }
    if (!selectedPoint) {
      toast.error("Выберите пункт выдачи");
      return;
    }
    setBusy(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: name,
          phone,
          region,
          city,
          pickup_point: `${selectedPoint.provider} — ${selectedPoint.address}`,
          address: selectedPoint.address,
          comment,
          total: cart.total,
          status: "new",
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: itemsError } = await supabase.from("order_items").insert(
        cart.items.map((i) => ({
          order_id: order.id as string,
          product_id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
        })),
      );
      if (itemsError) throw itemsError;

      const text = [
        "Новый заказ INVINCIBLE SOUL",
        `Покупатель: ${name}`,
        `Телефон: ${phone}`,
        `Доставка: ${region}, ${city}, ${selectedPoint.provider} — ${selectedPoint.address}`,
        comment ? `Комментарий: ${comment}` : "",
        "",
        ...cart.items.map((i) => `${i.title} × ${i.quantity} — ${money(i.price * i.quantity)}`),
        `Итого: ${money(cart.total)}`,
      ]
        .filter(Boolean)
        .join("\n");

      const url =
        channel === "telegram"
          ? `https://t.me/share/url?url=${encodeURIComponent(SHOP.telegram)}&text=${encodeURIComponent(text)}`
          : `mailto:${SHOP.email}?subject=${encodeURIComponent("Заказ INVINCIBLE SOUL")}&body=${encodeURIComponent(text)}`;

      cart.clear();
      toast.success("Заказ оформлен! Отправляем заявку магазину");
      window.open(url, "_blank", "noopener");
      await navigate({ to: "/profile" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось оформить заказ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Корзина</h1>

        {cart.items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">В корзине пока пусто.</p>
            <Link
              to="/"
              hash="catalog"
              className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <img
                    src={imageForSlug(item.slug)}
                    alt={item.title}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{money(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cart.setQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 rounded-lg border border-border"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => cart.setQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 rounded-lg border border-border"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.remove(item.id)}
                    className="text-sm text-muted-foreground hover:text-destructive"
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>

            <form
              onSubmit={submit}
              className="h-fit space-y-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <h2 className="text-lg font-bold">Оформление заказа</h2>
              <input
                className={field}
                required
                placeholder="Имя получателя"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className={field}
                required
                type="tel"
                placeholder="Телефон для связи"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <select
                className={field}
                required
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setCity("");
                  setPointId("");
                }}
              >
                <option value="">Регион доставки</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                className={field}
                required
                value={city}
                disabled={!region}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPointId("");
                }}
              >
                <option value="">Город</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                className={field}
                required
                value={pointId}
                disabled={!city}
                onChange={(e) => setPointId(e.target.value)}
              >
                <option value="">Пункт выдачи СДЭК / Ozon</option>
                {cityPoints.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.provider} — {p.address}
                  </option>
                ))}
              </select>
              <textarea
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
                rows={3}
                placeholder="Комментарий к заказу (размер, цвет)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
              <div className="flex gap-2">
                {(["telegram", "email"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`h-10 flex-1 rounded-xl border text-sm font-medium transition-colors ${
                      channel === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {c === "telegram" ? "В Telegram" : "На почту"}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-lg font-extrabold">
                <span>Итого</span>
                <span>{money(cart.total)}</span>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Отправляем…" : "Заказать товар"}
              </button>
              {!user && (
                <p className="text-center text-xs text-muted-foreground">
                  Для заказа нужен аккаунт —{" "}
                  <Link to="/auth" className="font-semibold text-primary">
                    войти или зарегистрироваться
                  </Link>
                </p>
              )}
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}