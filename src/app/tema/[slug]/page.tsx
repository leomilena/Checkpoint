import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { listPublishedArticles } from "@/lib/article-query";
import { ArticleGrid } from "@/components/article-grid";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const topic = await prisma.topic.findUnique({ where: { slug: params.slug } });
  return { title: topic?.name ?? "Temática" };
}

export default async function TopicPage({ params }: { params: { slug: string } }) {
  const topic = await prisma.topic.findUnique({ where: { slug: params.slug } });
  if (!topic) notFound();

  const { articles, hasMore } = await listPublishedArticles({
    topicSlug: params.slug,
    sort: "recent",
    page: 0,
    pageSize: 6,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-text">{topic.name}</h1>
      <ArticleGrid initialArticles={articles} initialHasMore={hasMore} topicSlug={params.slug} />
    </div>
  );
}
