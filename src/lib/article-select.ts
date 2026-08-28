import { Prisma } from "@prisma/client";

export const articleCardSelect = {
  id: true,
  title: true,
  subtitle: true,
  slug: true,
  coverImageUrl: true,
  coverGradient: true,
  status: true,
  topic: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true, color: true } },
  author: { select: { id: true, name: true, avatarColor: true, avatarImageUrl: true } },
  coauthors: {
    select: { user: { select: { id: true, name: true, avatarColor: true, avatarImageUrl: true } } },
  },
  writerRating: true,
  avgUserRating: true,
  ratingsCount: true,
  publishedAt: true,
  views: true,
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.ArticleSelect;

export type ArticleCard = Prisma.ArticleGetPayload<{ select: typeof articleCardSelect }>;
