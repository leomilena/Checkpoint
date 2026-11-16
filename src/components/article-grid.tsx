"use client";

import { useState } from "react";
import { ArticleCard } from "@/components/article-card";
import { FeaturedArticleCard } from "@/components/featured-article-card";
import type { ArticleCard as ArticleCardType } from "@/lib/article-select";
import type { SortKey } from "@/lib/article-query";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Más recientes" },
  { key: "most-read", label: "Más leídos" },
  { key: "most-commented", label: "Más comentados" },
  { key: "top-rated", label: "Mejor puntuados" },
];

export function ArticleGrid({
  initialArticles,
  initialHasMore,
  topicSlug,
  categorySlug,
}: {
  initialArticles: ArticleCardType[];
  initialHasMore: boolean;
  topicSlug?: string;
  categorySlug?: string;
}) {
  const [sort, setSort] = useState<SortKey>("recent");
  const [articles, setArticles] = useState(initialArticles);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  async function fetchPage(nextSort: SortKey, nextPage: number, replace: boolean) {
    setLoading(true);
    const params = new URLSearchParams({ sort: nextSort, page: String(nextPage) });
    if (topicSlug) params.set("topic", topicSlug);
    if (categorySlug) params.set("category", categorySlug);

    const res = await fetch(`/api/articles/load-more?${params.toString()}`);
    const data = await res.json();
    setArticles((prev) => (replace ? data.articles : [...prev, ...data.articles]));
    setHasMore(data.hasMore);
    setPage(nextPage);
    setLoading(false);
  }

  function onSortChange(next: SortKey) {
    setSort(next);
    fetchPage(next, 0, true);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Ordenar artículos">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={sort === opt.key}
            onClick={() => onSortChange(opt.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              sort === opt.key ? "bg-accent text-bg" : "border border-border text-muted hover:text-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-muted">No hay artículos todavía.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {articles.length > 0 && (
            <FeaturedArticleCard article={articles[0]} />
          )}

          {articles.length > 1 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {articles.slice(1, 5).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {articles.length > 5 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.slice(5).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => fetchPage(sort, page + 1, false)}
            disabled={loading}
            className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-text transition hover:border-accent hover:text-accent disabled:opacity-60"
          >
            {loading ? "Cargando…" : "Cargar más"}
          </button>
        </div>
      )}
    </div>
  );
}
