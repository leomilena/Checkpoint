import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ratingSchema } from "@/lib/validation";
import { articleSupportsRating } from "@/lib/rating";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const parsed = ratingSchema.safeParse({ ...(await req.json().catch(() => ({}))), articleId: params.id });
  if (!parsed.success) {
    return NextResponse.json({ error: "Puntuación no válida" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { category: true, topic: true },
  });
  if (!article || article.status !== "PUBLISHED") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (!articleSupportsRating(article.category, article.topic)) {
    return NextResponse.json({ error: "Este artículo no admite puntuación" }, { status: 409 });
  }

  await prisma.rating.upsert({
    where: { userId_articleId: { userId: user.id, articleId: article.id } },
    update: { value: parsed.data.value },
    create: { userId: user.id, articleId: article.id, value: parsed.data.value },
  });

  const agg = await prisma.rating.aggregate({
    where: { articleId: article.id },
    _avg: { value: true },
    _count: { value: true },
  });

  const avgUserRating = agg._avg.value ?? 0;
  const ratingsCount = agg._count.value;

  await prisma.article.update({
    where: { id: article.id },
    data: { avgUserRating, ratingsCount },
  });

  return NextResponse.json({ avgUserRating, ratingsCount, yourRating: parsed.data.value });
}
