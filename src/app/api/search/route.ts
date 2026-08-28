import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const topicSlug = searchParams.get("topic") ?? undefined;
  const categorySlug = searchParams.get("category") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit") ?? 8)));

  if (!q && !topicSlug && !categorySlug && !from && !to) {
    return NextResponse.json({ articles: [] });
  }

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { subtitle: { contains: q, mode: "insensitive" } },
              { body: { contains: q, mode: "insensitive" } },
              { author: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(topicSlug ? { topic: { slug: topicSlug } } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(from || to
        ? {
            publishedAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      subtitle: true,
      coverImageUrl: true,
      coverGradient: true,
      publishedAt: true,
      author: { select: { name: true } },
      category: { select: { name: true, color: true, slug: true } },
      topic: { select: { name: true, slug: true } },
    },
  });

  return NextResponse.json({ articles });
}
