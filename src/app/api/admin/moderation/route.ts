import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const reports = await prisma.commentReport.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, name: true } },
      comment: {
        select: {
          id: true,
          body: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });

  return NextResponse.json({ reports });
}
