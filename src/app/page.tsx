import { listPublishedArticles } from "@/lib/article-query";
import { ArticleGrid } from "@/components/article-grid";
import { getNowPlayingMovies, getLatestGameReleases } from "@/lib/external-media";

export default async function HomePage() {
  const [{ articles, hasMore }, gameReleases, movieReleases] = await Promise.all([
    listPublishedArticles({ sort: "recent", page: 0, pageSize: 10 }),
    getLatestGameReleases(),
    getNowPlayingMovies(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Portada</h1>
      <ArticleGrid
        initialArticles={articles}
        initialHasMore={hasMore}
        gameReleases={gameReleases}
        movieReleases={movieReleases}
      />
    </div>
  );
}
