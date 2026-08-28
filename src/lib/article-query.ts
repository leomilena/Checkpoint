import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { articleCardSelect } from "@/lib/article-select";

export type SortKey = "recent" | "most-read" | "most-commented" | "top-rated";

export function buildOrderBy(sort: SortKey): Prisma.ArticleOrderByWithRelationInput[] {
  switch (sort) {
    case "most-read":
      return [{ views: "desc" }, { publishedAt: "desc" }];
    case "most-commented":
      return [{ comments: { _count: "desc" } }, { publishedAt: "desc" }];
    case "top-rated":
      return [{ avgUserRating: "desc" }, { ratingsCount: "desc" }, { publishedAt: "desc" }];
    case "recent":
    default:
      return [{ publishedAt: "desc" }];
  }
}

export async function listPublishedArticles(params: {
  topicSlug?: string;
  categorySlug?: string;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}) {
  const { topicSlug, categorySlug, sort = "recent", page = 0, pageSize = 6 } = params;

  const where: Prisma.ArticleWhereInput = {
    status: "PUBLISHED",
    ...(topicSlug ? { topic: { slug: topicSlug } } : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: buildOrderBy(sort),
      skip: page * pageSize,
      take: pageSize,
      select: articleCardSelect,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total, hasMore: (page + 1) * pageSize < total };
}
