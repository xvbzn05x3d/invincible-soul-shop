import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { type Product } from "@/lib/shop";
import { X } from "lucide-react";

type ProductEditorProps = {
  product?: Partial<Product>;
  onClose: () => void;
  onSuccess: () => void;
};

export function ProductEditor({ product, onClose, onSuccess }: ProductEditorProps) {
  const [busy, setBusy] = useState(false);
  const [formData, setFormData] = useState({
    title: product?.title || "",
    slug: product?.slug || "",
    category: product?.category || "",
    description: product?.description || "",
    price: product?.price || 0,
    old_price: product?.old_price || null,
    is_new: product?.is_new || false,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (!formData.slug) {
        formData.slug = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9а-я]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      const { error } = product?.id
        ? await supabase.from("products").update(formData).eq("id", product.id)
        : await supabase.from("products").insert([formData]);

      if (error) throw error;
      toast.success(product?.id ? "Товар обновлён" : "Товар добавлен");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">
            {product?.id ? "Редактировать товар" : "Добавить товар"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Название</label>
            <input
              required
              className={field}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Цена</label>
              <input
                type="number"
                required
                className={field}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Старая цена</label>
              <input
                type="number"
                className={field}
                value={formData.old_price || ""}
                onChange={(e) => setFormData({ ...formData, old_price: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Категория</label>
            <input
              required
              className={field}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Описание</label>
            <textarea
              className={field}
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_new"
              checked={formData.is_new}
              onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="is_new" className="text-sm font-medium">Новинка</label>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
}
