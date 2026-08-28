import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const [mostRead, authorGroups, totals] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { views: "desc" },
      take: 10,
      select: { id: true, title: true, slug: true, views: true, author: { select: { name: true } } },
    }),
    prisma.article.groupBy({
      by: ["authorId"],
      where: { status: "PUBLISHED" },
      _count: { _all: true },
      orderBy: { _count: { authorId: "desc" } },
      take: 10,
    }),
    prisma.$transaction([
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count(),
      prisma.comment.count({ where: { status: "VISIBLE" } }),
      prisma.newsletterSubscriber.count(),
    ]),
  ]);

  const authorUsers = await prisma.user.findMany({
    where: { id: { in: authorGroups.map((g) => g.authorId) } },
    select: { id: true, name: true },
  });
  const authorsSorted = authorGroups.map((g) => ({
    id: g.authorId,
    name: authorUsers.find((u) => u.id === g.authorId)?.name ?? "—",
    publishedCount: g._count._all,
  }));

  const [publishedCount, userCount, commentCount, subscriberCount] = totals;

  return NextResponse.json({
    mostRead,
    mostActiveAuthors: authorsSorted,
    totals: { publishedCount, userCount, commentCount, subscriberCount },
  });
}
