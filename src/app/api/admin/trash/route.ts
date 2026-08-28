import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const [articles, comments] = await Promise.all([
    prisma.article.findMany({
      where: { status: "TRASHED" },
      orderBy: { deletedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        deletedAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.comment.findMany({
      where: { status: "DELETED" },
      orderBy: { deletedAt: "desc" },
      select: {
        id: true,
        body: true,
        deletedAt: true,
        user: { select: { name: true } },
        article: { select: { title: true, slug: true } },
      },
    }),
  ]);

  return NextResponse.json({ articles, comments });
}
