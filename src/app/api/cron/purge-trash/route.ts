import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TRASH_RETENTION_DAYS } from "@/lib/permissions";

/**
 * Purga definitivamente artículos y comentarios que llevan más de 30 días
 * en la papelera. Pensado para invocarse desde un cron externo con cabecera
 * Authorization: Bearer CRON_SECRET — incluido Vercel Cron, que añade esa
 * cabecera automáticamente a partir de la variable de entorno CRON_SECRET
 * y llama por GET (ver vercel.json). Se acepta también POST para crons
 * externos (GitHub Actions, cron de un VPS, etc.).
 */
async function purgeTrash(req: Request) {
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

export const GET = purgeTrash;
export const POST = purgeTrash;
