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
      title="Checkpoint alcanzado — ya has leído este artículo"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 3v18M6 4h11l-3 4 3 4H6" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      </svg>
      Checkpoint
    </span>
  );
}
