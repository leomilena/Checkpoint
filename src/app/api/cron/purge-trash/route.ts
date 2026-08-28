import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TRASH_RETENTION_DAYS } from "@/lib/permissions";

/**
 * Purga definitivamente artículos y comentarios que llevan más de 30 días
 * en la papelera. Pensado para invocarse desde un cron externo (Vercel Cron,
 * GitHub Actions, etc.) con cabecera Authorization: Bearer CRON_SECRET.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const threshold = new Date(Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const [articles, comments] = await prisma.$transaction([
    prisma.article.deleteMany({ where: { status: "TRASHED", deletedAt: { lt: threshold } } }),
    prisma.comment.deleteMany({ where: { status: "DELETED", deletedAt: { lt: threshold } } }),
  ]);

  return NextResponse.json({ purgedArticles: articles.count, purgedComments: comments.count });
}
