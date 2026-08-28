import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (user.role !== "WRITER" || article.authorId !== user.id) {
    return NextResponse.json({ error: "Solo el redactor autor puede enviar a revisión" }, { status: 403 });
  }
  if (article.status !== "DRAFT") {
    return NextResponse.json({ error: "Solo se pueden enviar a revisión los borradores" }, { status: 409 });
  }
  if (article.title.trim().length < 3 || article.body.trim().length < 20) {
    return NextResponse.json(
      { error: "Añade un título y contenido antes de enviar a revisión" },
      { status: 400 }
    );
  }

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { status: "REVIEW", reviewNote: null },
  });

  return NextResponse.json({ article: updated });
}
