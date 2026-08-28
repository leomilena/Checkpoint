import { listPublishedArticles } from "@/lib/article-query";
import { ArticleGrid } from "@/components/article-grid";

export default async function HomePage() {
  const { articles, hasMore } = await listPublishedArticles({ sort: "recent", page: 0, pageSize: 6 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Portada</h1>
      <ArticleGrid initialArticles={articles} initialHasMore={hasMore} />
    </div>
  );
}
