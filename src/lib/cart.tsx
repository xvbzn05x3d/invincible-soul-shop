import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "is-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      add: (item, quantity = 1) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.id === item.id);
          if (existing) {
            return prev.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
            );
          }
          return [...prev, { ...item, quantity }];
        }),
      setQuantity: (id, quantity) =>
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.id !== id)
            : prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
        ),
      remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      clear: () => setItems([]),
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: items.reduce((sum, i) => sum + i.quantity, 0),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}