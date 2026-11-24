"use client";

import { useState } from "react";
import { ArticleCard } from "@/components/article-card";
import { FeaturedArticleCard } from "@/components/featured-article-card";
import { ReleaseWidget } from "@/components/home/release-widget";
import { SidebarArticleList } from "@/components/article/sidebar-article-list";
import type { ArticleCard as ArticleCardType } from "@/lib/article-select";
import type { ReleaseItem } from "@/lib/external-media";
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
  gameReleases = [],
  mostRead = [],
}: {
  initialArticles: ArticleCardType[];
  initialHasMore: boolean;
  topicSlug?: string;
  categorySlug?: string;
  gameReleases?: ReleaseItem[];
  mostRead?: ArticleCardType[];
}) {
  const isHome = !topicSlug && !categorySlug;
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
        <div className="flex flex-col gap-10">
          {articles.length > 0 && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FeaturedArticleCard article={articles[0]} />
              </div>
              {articles.length > 1 && (
                <div className="flex flex-col gap-8">
                  {articles.slice(1, 3).map((article) => (
                    <ArticleCard key={article.id} article={article} className="flex-1" />
                  ))}
                </div>
              )}
            </div>
          )}

          {isHome && (gameReleases.length > 0 || mostRead.length > 0) && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ReleaseWidget
                title="Últimos lanzamientos de videojuegos"
                items={gameReleases}
                attribution="Datos de videojuegos vía RAWG.io"
              />
              <SidebarArticleList title="Más leídos de The Frame" articles={mostRead} />
            </div>
          )}

          {articles.length > 3 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.slice(3).map((article) => (
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
