import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { listPublishedArticles } from "@/lib/article-query";
import { ArticleGrid } from "@/components/article-grid";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  return { title: category?.name ?? "Categoría" };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();

  const { articles, hasMore } = await listPublishedArticles({
    categorySlug: params.slug,
    sort: "recent",
    page: 0,
    pageSize: 6,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-text">{category.name}</h1>
      </div>
      <ArticleGrid initialArticles={articles} initialHasMore={hasMore} categorySlug={params.slug} />
    </div>
  );
}
