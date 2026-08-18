import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PriceChart } from "@/components/site/PriceChart";
import { Stars } from "@/components/site/Stars";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchPriceHistory,
  fetchProductBySlug,
  fetchReviews,
  imageForSlug,
  money,
} from "@/lib/shop";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    const title = `${name} — купить в INVINCIBLE SOUL`;
    const description = `${name}: цена, динамика цены за последний месяц и отзывы покупателей с фото и оценками в магазине INVINCIBLE SOUL.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Товар не найден</div>,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const cart = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });
  const { data: history = [] } = useQuery({
    queryKey: ["price-history", product?.id],
    queryFn: () => fetchPriceHistory(product!.id),
    enabled: !!product,
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: () => fetchReviews(product!.id),
    enabled: !!product,
  });

  const [rating, setRating] = useState(5);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Загрузка…</div>;
  if (!product) return <div className="p-10 text-center">Товар не найден</div>;

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const photos: string[] = [];
      for (const file of files.slice(0, 4)) {
        const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "")}`;
        const { error: upErr } = await supabase.storage.from("review-photos").upload(path, file);
        if (upErr) throw upErr;
        const { data: signed } = await supabase.storage
          .from("review-photos")
          .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
        if (signed?.signedUrl) photos.push(signed.signedUrl);
      }
      const { error } = await supabase.from("reviews").insert({
        product_id: product.id,
        user_id: user.id,
        rating,
        pros,
        cons,
        comment,
        photos,
      });
      if (error) throw error;
      toast.success("Спасибо! Отзыв опубликован");
      setPros("");
      setCons("");
      setComment("");
      setFiles([]);
      setRating(5);
      await queryClient.invalidateQueries({ queryKey: ["reviews", product.id] });
      await queryClient.invalidateQueries({ queryKey: ["ratings"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось отправить отзыв");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link to="/" hash="catalog" className="text-sm text-muted-foreground hover:text-primary">
          ← Назад в каталог
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <img
            src={imageForSlug(product.slug)}
            alt={product.title}
            width={768}
            height={768}
            className="aspect-square w-full rounded-3xl border border-border bg-card object-cover shadow-[var(--shadow-card)]"
          />
          <div>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.category}
            </span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{product.title}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Stars value={avg} />
              <span>
                {avg ? avg.toFixed(1) : "Нет оценок"} · {reviews.length} отзывов
              </span>
            </div>
            <p className="mt-4 text-muted-foreground">{product.description}</p>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-3xl font-extrabold">{money(Number(product.price))}</span>
              {product.old_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {money(Number(product.old_price))}
                </span>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  cart.add({
                    id: product.id,
                    slug: product.slug,
                    title: product.title,
                    price: Number(product.price),
                  });
                  toast.success("Товар добавлен в корзину");
                }}
                className="h-12 rounded-xl bg-primary px-7 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                В корзину
              </button>
              <Link
                to="/cart"
                className="inline-flex h-12 items-center rounded-xl border border-border px-7 font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                Оформить заказ
              </Link>
            </div>
            <div className="mt-6">
              <PriceChart data={history} />
            </div>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Отзывы покупателей ({reviews.length})
          </h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {reviews.length === 0 && (
                <p className="text-muted-foreground">Отзывов пока нет — станьте первым!</p>
              )}
              {reviews.map((r) => (
                <article key={r.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    {r.author.avatar_url ? (
                      <img src={r.author.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                        {r.author.username.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{r.author.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <span className="ml-auto">
                      <Stars value={r.rating} />
                    </span>
                  </div>
                  {r.pros && (
                    <p className="mt-3 text-sm">
                      <span className="font-semibold text-primary">Достоинства:</span> {r.pros}
                    </p>
                  )}
                  {r.cons && (
                    <p className="mt-1 text-sm">
                      <span className="font-semibold text-destructive">Недостатки:</span> {r.cons}
                    </p>
                  )}
                  {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                  {r.photos.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.photos.map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt="Фото из отзыва"
                          loading="lazy"
                          className="h-20 w-20 rounded-lg border border-border object-cover"
                        />
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h3 className="text-lg font-bold">Оставить отзыв</h3>
              {user ? (
                <form onSubmit={submitReview} className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Оценка:</span>
                    <Stars value={rating} size={22} onChange={setRating} />
                  </div>
                  <textarea
                    className={field}
                    rows={2}
                    placeholder="Достоинства"
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    maxLength={500}
                  />
                  <textarea
                    className={field}
                    rows={2}
                    placeholder="Недостатки"
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    maxLength={500}
                  />
                  <textarea
                    className={field}
                    rows={3}
                    placeholder="Комментарий"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={1000}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                    className="w-full text-sm text-muted-foreground"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {busy ? "Отправляем…" : "Опубликовать отзыв"}
                  </button>
                </form>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  <Link to="/auth" className="font-semibold text-primary">
                    Войдите
                  </Link>{" "}
                  по номеру телефона, чтобы оставить отзыв с фото и оценкой.
                </p>
              )}
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}