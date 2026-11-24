import { prisma } from "@/lib/prisma";
import { listPublishedArticles } from "@/lib/article-query";
import { articleCardSelect } from "@/lib/article-select";
import { ArticleGrid } from "@/components/article-grid";
import { getLatestGameReleases } from "@/lib/external-media";

export default async function HomePage() {
  const [{ articles, hasMore }, gameReleases, mostRead] = await Promise.all([
    // 3 para la fila del destacado + un múltiplo de 3 para que la rejilla de
    // abajo siempre acabe en una fila completa, sin dejar una tarjeta suelta
    // mientras todavía quede más contenido por cargar con "Cargar más".
    listPublishedArticles({ sort: "recent", page: 0, pageSize: 9 }),
    getLatestGameReleases(),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { views: "desc" },
      take: 6,
      select: articleCardSelect,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Portada</h1>
      <ArticleGrid
        initialArticles={articles}
        initialHasMore={hasMore}
        gameReleases={gameReleases}
        mostRead={mostRead}
      />
    </div>
  );
}
