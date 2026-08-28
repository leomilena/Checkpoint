"use client";

import { useEffect, useState } from "react";
import { ArticleCard } from "@/components/article-card";
import type { ArticleCard as ArticleCardType } from "@/lib/article-select";

export function FavoritesList() {
  const [articles, setArticles] = useState<ArticleCardType[] | null>(null);

  useEffect(() => {
    fetch("/api/me/favorites")
      .then((res) => res.json())
      .then((data) => setArticles(data.articles ?? []));
  }, []);

  if (!articles) return <p className="text-muted">Cargando…</p>;
  if (articles.length === 0) return <p className="text-muted">Todavía no has guardado ningún artículo.</p>;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </div>
  );
}
