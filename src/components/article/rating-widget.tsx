"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { StarRatingDisplay } from "@/components/star-rating";

export function RatingWidget({
  articleId,
  writerRating,
  initialAvg,
  initialCount,
  initialYourRating,
  verb,
}: {
  articleId: string;
  writerRating: number | null;
  initialAvg: number;
  initialCount: number;
  initialYourRating: number | null;
  verb: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [yourRating, setYourRating] = useState(initialYourRating);
  const [hover, setHover] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function vote(value: number) {
    if (!session?.user) {
      router.push(`/entrar?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/articles/${articleId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const data = await res.json();
      setAvg(data.avgUserRating);
      setCount(data.ratingsCount);
      setYourRating(data.yourRating);
    }
    setSaving(false);
  }

  const displayValue = hover ?? yourRating ?? 0;

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm">
        {writerRating != null && (
          <span className="flex items-center gap-2">
            <span className="text-muted">Nota The Frame:</span>
            <StarRatingDisplay value={writerRating} size="md" />
            <span className="font-semibold text-text">{writerRating.toFixed(1)}</span>
          </span>
        )}
        <span className="flex items-center gap-2">
          <span className="text-muted">Nota de los usuarios:</span>
          <StarRatingDisplay value={avg} size="md" />
          <span className="font-semibold text-text">
            {avg.toFixed(1)} ({count} voto{count === 1 ? "" : "s"})
          </span>
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm text-muted">{yourRating != null ? "Tu voto:" : `Vota — ${verb}:`}</span>
        <div
          className="flex items-center gap-0.5"
          onMouseLeave={() => setHover(null)}
          role="radiogroup"
          aria-label={verb}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={saving}
              role="radio"
              aria-checked={yourRating === n}
              aria-label={`${n} de 5 estrellas`}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onClick={() => vote(n)}
              className="p-0.5 disabled:opacity-60"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20l1.4-6.3-4.8-4.3 6.4-.6L12 3Z"
                  fill={n <= displayValue ? "var(--cp-accent)" : "none"}
                  stroke="var(--cp-accent)"
                  strokeWidth="1.4"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
