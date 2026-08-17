import { supabase } from "@/integrations/supabase/client";

import gloves from "@/assets/p-gloves.jpg";
import rashguard from "@/assets/p-rashguard.jpg";
import shorts from "@/assets/p-shorts.jpg";
import hoodie from "@/assets/p-hoodie.jpg";
import tshirt from "@/assets/p-tshirt.jpg";
import wraps from "@/assets/p-wraps.jpg";
import rope from "@/assets/p-rope.jpg";
import shin from "@/assets/p-shin.jpg";
import bag from "@/assets/p-bag.jpg";
import leggings from "@/assets/p-leggings.jpg";
import mouthguard from "@/assets/p-mouthguard.jpg";
import windbreaker from "@/assets/p-windbreaker.jpg";

export const productImages: Record<string, string> = {
  "boxing-gloves-pro": gloves,
  "rashguard-blue": rashguard,
  "training-shorts": shorts,
  "hoodie-soul": hoodie,
  "tshirt-logo": tshirt,
  "hand-wraps": wraps,
  "jump-rope": rope,
  "shin-guards": shin,
  "sport-bag": bag,
  "leggings-women": leggings,
  "mouthguard": mouthguard,
  "windbreaker": windbreaker,
};

export function imageForSlug(slug: string) {
  return productImages[slug] ?? gloves;
}

export type Product = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  price: number;
  old_price: number | null;
  is_new: boolean;
  popularity: number;
  created_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  pros: string;
  cons: string;
  comment: string;
  photos: string[];
  created_at: string;
};

export type PickupPoint = {
  id: string;
  provider: string;
  region: string;
  city: string;
  address: string;
};

export const money = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value) + " \u20BD";

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as unknown as Product) ?? null;
}

export async function fetchRatings(): Promise<Record<string, { avg: number; count: number }>> {
  const { data, error } = await supabase.from("reviews").select("product_id, rating");
  if (error) throw error;
  const map: Record<string, { sum: number; count: number }> = {};
  for (const row of (data ?? []) as { product_id: string; rating: number }[]) {
    const entry = map[row.product_id] ?? { sum: 0, count: 0 };
    entry.sum += row.rating;
    entry.count += 1;
    map[row.product_id] = entry;
  }
  return Object.fromEntries(
    Object.entries(map).map(([id, v]) => [id, { avg: v.sum / v.count, count: v.count }]),
  );
}

export async function fetchPriceHistory(productId: string) {
  const { data, error } = await supabase
    .from("price_history")
    .select("day, price")
    .eq("product_id", productId)
    .order("day", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((d) => ({ day: d.day as string, price: Number(d.price) }));
}

export async function fetchReviews(productId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const reviews = (data ?? []) as unknown as Review[];
  const ids = [...new Set(reviews.map((r) => r.user_id))];
  let authors: Record<string, { username: string; avatar_url: string | null }> = {};
  if (ids.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", ids);
    authors = Object.fromEntries(
      (profiles ?? []).map((p) => [
        p.id as string,
        { username: p.username as string, avatar_url: (p.avatar_url as string | null) ?? null },
      ]),
    );
  }
  return reviews.map((r) => ({
    ...r,
    author: authors[r.user_id] ?? { username: "Покупатель", avatar_url: null },
  }));
}

export async function fetchPickupPoints(): Promise<PickupPoint[]> {
  const { data, error } = await supabase.from("pickup_points").select("*").order("region");
  if (error) throw error;
  return (data ?? []) as unknown as PickupPoint[];
}

export const SHOP = {
  telegram: "https://t.me/INVINCIBLE_Sport",
  vk: "https://vk.ru/im/channels/-235909700",
  email: "pv-boks@yandex.ru",
  phone: "+79104913900",
  phoneLabel: "+7 910 491-39-00",
};