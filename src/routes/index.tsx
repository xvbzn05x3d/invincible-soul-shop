import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BadgeCheck, ShieldCheck, Truck, Wallet, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import logo from "@/assets/logo.png.asset.json";
import heroImage from "@/assets/p-gloves.jpg";
import { Header } from "@/components/site/Header";
import { Footer, ContactLinks } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { fetchProducts, fetchRatings, type Product } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { ProductEditor } from "@/components/site/ProductEditor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INVINCIBLE SOUL — спортивная одежда по доступным ценам" },
      {
        name: "description",
        content:
          "Спортивная одежда и экипировка INVINCIBLE SOUL для мужчин и женщин: доступные цены, гарантированное качество, отзывы покупателей и доставка СДЭК и Ozon.",
      },
      { property: "og:title", content: "INVINCIBLE SOUL — спортивная одежда" },
      {
        property: "og:description",
        content: "Доступные цены и гарантированное качество. Закажите онлайн за пару минут.",
      },
    ],
  }),
  component: Index,
});

const SORTS = [
  { id: "popular", label: "Популярные" },
  { id: "new", label: "Новинки" },
  { id: "cheap", label: "Дешевле" },
  { id: "expensive", label: "Дороже" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

function Index() {
  const [sort, setSort] = useState<SortId>("popular");
  const [category, setCategory] = useState<string>("Все");
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const cart = useCart();
  const { role } = useAuth();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const { data: ratings = {} } = useQuery({ queryKey: ["ratings"], queryFn: fetchRatings });

  const categories = useMemo(
    () => ["Все", ...new Set(products.map((p) => p.category))],
    [products],
  );

  const visible = useMemo(() => {
    const list = products.filter((p) => category === "Все" || p.category === category);
    const sorted = [...list];
    if (sort === "popular") sorted.sort((a, b) => b.popularity - a.popularity);
    if (sort === "new")
      sorted.sort((a, b) => Number(b.is_new) - Number(a.is_new) || b.created_at.localeCompare(a.created_at));
    if (sort === "cheap") sorted.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "expensive") sorted.sort((a, b) => Number(b.price) - Number(a.price));
    return sorted;
  }, [products, category, sort]);

  const addToCart = (product: Product) => {
    cart.add({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.price),
    });
    toast.success("Товар добавлен в корзину");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="border-b border-border bg-[image:var(--gradient-soft)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3">
              <img src={logo.url} alt="Логотип INVINCIBLE SOUL" className="h-14 w-14 object-contain" />
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                Спортивная одежда и экипировка
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              INVINCIBLE <span className="text-primary">SOUL</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Доступные цены и гарантированное качество. Экипировка и одежда для мужчин и женщин
              любого возраста — от первой тренировки до профессионального ринга.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#catalog"
                className="inline-flex h-12 items-center rounded-xl bg-primary px-7 font-semibold text-primary-foreground shadow-[var(--shadow-hover)] transition-all hover:opacity-90 active:scale-95"
              >
                Заказать товар
              </a>
              <Link
                to="/cart"
                className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-7 font-semibold transition-all hover:border-primary hover:text-primary active:scale-95"
              >
                Перейти в корзину
              </Link>
            </div>
          </div>
          <div className="relative animate-in fade-in slide-in-from-right duration-700">
            <img
              src={heroImage}
              alt="Боксёрские перчатки INVINCIBLE SOUL"
              width={768}
              height={768}
              className="mx-auto aspect-square w-full max-w-md rounded-3xl border border-border bg-card object-cover shadow-[var(--shadow-card)]"
            />
          </div>
        </div>
      </section>

      <section id="advantages" className="mx-auto max-w-6xl px-4 py-14 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Wallet, title: "Доступные цены", text: "Прямые поставки без наценки посредников." },
            { icon: ShieldCheck, title: "Гарантия качества", text: "Проверяем каждую партию перед отправкой." },
            { icon: Truck, title: "Доставка СДЭК и Ozon", text: "Пункты выдачи по всей России." },
            { icon: BadgeCheck, title: "Честные отзывы", text: "Оценки и фото от реальных покупателей." },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
            >
              <item.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-base font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-6xl px-4 pb-16 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Каталог товаров</h2>
          {(role === "owner" || role === "editor") && (
            <button
              onClick={() => setEditingProduct({})}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Добавить товар
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`h-9 rounded-full border px-4 text-sm transition-colors ${
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSort(s.id)}
              className={`h-9 rounded-full px-4 text-sm font-medium transition-colors ${
                sort === s.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-10 text-muted-foreground">Загружаем товары…</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((product) => (
              <div key={product.id} className="group relative">
                <ProductCard
                  product={product}
                  rating={ratings[product.id]}
                  onAdd={() => addToCart(product)}
                />
                {(role === "owner" || role === "editor") && (
                  <div className="absolute right-2 top-2 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-foreground shadow-sm hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Удалить этот товар?")) {
                          const { error } = await supabase.from("products").delete().eq("id", product.id);
                          if (error) toast.error(error.message);
                          else {
                            toast.success("Товар удален");
                            queryClient.invalidateQueries({ queryKey: ["products"] });
                          }
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-foreground shadow-sm hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {editingProduct && (
          <ProductEditor
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
          />
        )}
      </section>

      <section className="border-y border-border bg-secondary/60 animate-in fade-in duration-700">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-extrabold tracking-tight">Обратная связь</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Задайте вопрос о размере, наличии или доставке — мы на связи в Telegram, ВКонтакте, по
            почте и телефону.
          </p>
          <div className="mt-6">
            <ContactLinks />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
