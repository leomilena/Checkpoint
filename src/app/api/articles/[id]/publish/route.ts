import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { notifyIndexNow } from "@/lib/indexnow";
import { getBaseUrl } from "@/lib/site-url";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Solo un administrador puede publicar" }, { status: 403 });
  }

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (article.status === "PUBLISHED" || article.status === "TRASHED") {
    return NextResponse.json({ error: "El artículo no se puede publicar desde su estado actual" }, { status: 409 });
  }
  if (article.title.trim().length < 3 || article.body.trim().length < 20) {
    return NextResponse.json(
      { error: "Añade un título y contenido antes de publicar" },
      { status: 400 }
    );
  }

  const wasReview = article.status === "REVIEW";

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: {
      status: "PUBLISHED",
      publishedAt: article.publishedAt ?? new Date(),
      reviewNote: null,
    },
  });

  if (wasReview) {
    await prisma.notification.create({
      data: {
        userId: article.authorId,
        type: "ARTICLE_APPROVED",
        articleId: article.id,
        message: `Tu artículo "${article.title}" ha sido aprobado y publicado.`,
      },
    });
  }

  const readers = await prisma.user.findMany({
    where: { id: { not: article.authorId }, banned: false },
    select: { id: true },
  });
  if (readers.length > 0) {
    await prisma.notification.createMany({
      data: readers.map((reader) => ({
        userId: reader.id,
        type: "NEW_ARTICLE" as const,
        articleId: article.id,
        message: `Nuevo artículo: "${article.title}"`,
      })),
    });
  }

  // Esperamos el aviso (en vez de lanzarlo "en segundo plano") porque en
  // el runtime serverless de Vercel una promesa sin await puede quedar
  // cortada en cuanto se devuelve la respuesta.
  const baseUrl = getBaseUrl();
  await notifyIndexNow(`${baseUrl}/articulo/${article.slug}`);

  return NextResponse.json({ article: updated });
}
