import { Star } from "lucide-react";

export function Stars({
  value,
  size = 16,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i - 0.25;
        const star = (
          <Star
            size={size}
            className={filled ? "fill-[var(--star)] text-[var(--star)]" : "text-border"}
            strokeWidth={1.5}
          />
        );
        return onChange ? (
          <button
            key={i}
            type="button"
            aria-label={`Оценка ${i}`}
            onClick={() => onChange(i)}
            className="transition-transform hover:scale-110"
          >
            {star}
          </button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
    </span>
  );
}