import { money } from "@/lib/shop";

export function PriceChart({ data }: { data: { day: string; price: number }[] }) {
  if (data.length < 2) {
    return <p className="text-sm text-muted-foreground">Данных о ценах пока нет.</p>;
  }

  const width = 640;
  const height = 180;
  const pad = 24;
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const points = data.map((d, i) => {
    const x = pad + (i * (width - pad * 2)) / (data.length - 1);
    const y = pad + (height - pad * 2) * (1 - (d.price - min) / span);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const first = data[0];
  const last = data[data.length - 1];
  const diff = last.price - first.price;

  const fmt = (day: string) =>
    new Date(day).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-[var(--font-display)] text-sm font-bold">Динамика цены за месяц</h3>
        <span
          className={`text-sm font-semibold ${diff > 0 ? "text-destructive" : "text-primary"}`}
        >
          {diff === 0 ? "Цена без изменений" : `${diff > 0 ? "+" : ""}${money(diff)} за 30 дней`}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 w-full" role="img" aria-label="График цены">
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points={`${pad},${height - pad} ${points.join(" ")} ${width - pad},${height - pad}`}
          fill="var(--accent)"
          opacity="0.5"
          stroke="none"
        />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {fmt(first.day)} · {money(first.price)}
        </span>
        <span>
          мин. {money(min)} / макс. {money(max)}
        </span>
        <span>
          {fmt(last.day)} · {money(last.price)}
        </span>
      </div>
    </div>
  );
}