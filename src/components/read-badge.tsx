"use client";

import { useEffect, useState } from "react";
import { isArticleRead } from "@/lib/read-tracking";

export function ReadBadge({ slug }: { slug: string }) {
  const [read, setRead] = useState(false);

  useEffect(() => {
    setRead(isArticleRead(slug));
  }, [slug]);

  if (!read) return null;

  return (
    <span
      className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-bg/85 px-2 py-1 font-mono text-[10px] font-semibold text-accent shadow"
      title="En el encuadre — ya has leído este artículo"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 9V5a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M20 9V5a1 1 0 0 0-1-1h-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M4 15v4a1 1 0 0 0 1 1h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M20 15v4a1 1 0 0 1-1 1h-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      En el encuadre
    </span>
  );
}
