import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const articles = await prisma.article.findMany({
    where: { status: "REVIEW" },
    orderBy: { updatedAt: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      subtitle: true,
      updatedAt: true,
      author: { select: { id: true, name: true } },
      category: { select: { name: true } },
      topic: { select: { name: true } },
    },
  });

  return NextResponse.json({ articles });
}
