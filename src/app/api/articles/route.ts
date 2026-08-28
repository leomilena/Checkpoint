import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isWriterOrAdmin } from "@/lib/permissions";
import { articleInputSchema } from "@/lib/validation";
import { generateUniqueSlug } from "@/lib/slug";
import { articleSupportsRating } from "@/lib/rating";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isWriterOrAdmin(user)) {
    return NextResponse.json({ error: "No tienes permiso para crear artículos" }, { status: 403 });
  }

  const parsed = articleInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos no válidos" }, { status: 400 });
  }

  const data = parsed.data;

  const [topic, category] = await Promise.all([
    prisma.topic.findUnique({ where: { id: data.topicId } }),
    prisma.category.findUnique({ where: { id: data.categoryId } }),
  ]);
  if (!topic || !category) {
    return NextResponse.json({ error: "Temática o categoría no válida" }, { status: 400 });
  }

  const slug = await generateUniqueSlug(data.title);
  const supportsRating = articleSupportsRating(category, topic);

  const article = await prisma.article.create({
    data: {
      title: data.title,
      subtitle: data.subtitle ?? null,
      slug,
      body: data.body,
      coverImageUrl: data.coverImageUrl ?? null,
      coverGradient: data.coverImageUrl ? 0 : (data.coverGradient ?? Math.floor(Math.random() * 6)),
      topicId: data.topicId,
      categoryId: data.categoryId,
      authorId: user.id,
      status: "DRAFT",
      writerRating: supportsRating ? data.writerRating ?? null : null,
      lastAutosaveAt: new Date(),
      coauthors: data.coauthorIds?.length
        ? { create: data.coauthorIds.map((userId) => ({ userId })) }
        : undefined,
    },
  });

  return NextResponse.json({ article }, { status: 201 });
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isWriterOrAdmin(user)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") ?? undefined;
  // Un redactor solo puede listar sus propios artículos; solo un admin puede ver los de todos.
  const mine = user.role !== "ADMIN" || searchParams.get("mine") === "1";

  const articles = await prisma.article.findMany({
    where: {
      ...(mine ? { authorId: user.id } : {}),
      ...(statusFilter ? { status: statusFilter as any } : { status: { not: "TRASHED" } }),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      reviewNote: true,
      updatedAt: true,
      lastAutosaveAt: true,
      author: { select: { id: true, name: true } },
      category: { select: { name: true, color: true } },
      topic: { select: { name: true } },
    },
  });

  return NextResponse.json({ articles });
}
