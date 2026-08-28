"use client";

import { useEffect } from "react";
import { markArticleRead } from "@/lib/read-tracking";

export function MarkRead({ slug, articleId }: { slug: string; articleId: string }) {
  useEffect(() => {
    markArticleRead(slug);
    fetch(`/api/articles/${articleId}/view`, { method: "POST" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, articleId]);

  return null;
}
