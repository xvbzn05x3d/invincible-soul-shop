import { Link } from "@tanstack/react-router";

import { imageForSlug, money, type Product } from "@/lib/shop";
import { Stars } from "./Stars";

export function ProductCard({
  product,
  rating,
  onAdd,
}: {
  product: Product;
  rating?: { avg: number; count: number };
  onAdd: () => void;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="relative block">
        <img
          src={imageForSlug(product.slug)}
          alt={product.title}
          loading="lazy"
          width={768}
          height={768}
          className="aspect-square w-full bg-secondary object-cover"
        />
        {product.is_new && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Новинка
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category}
        </span>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="text-sm font-semibold leading-snug transition-colors hover:text-primary"
        >
          {product.title}
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Stars value={rating?.avg ?? 0} size={14} />
          <span>
            {rating ? rating.avg.toFixed(1) : "—"} · {rating?.count ?? 0} отз.
          </span>
        </div>
        <div className="mt-auto flex items-end gap-2 pt-2">
          <span className="font-[var(--font-display)] text-lg font-bold">{money(product.price)}</span>
          {product.old_price && (
            <span className="text-sm text-muted-foreground line-through">
              {money(Number(product.old_price))}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="mt-2 h-10 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          В корзину
        </button>
      </div>
    </article>
  );
}