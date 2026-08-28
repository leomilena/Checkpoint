import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canEditArticle, isAdmin } from "@/lib/permissions";
import { articleInputSchema } from "@/lib/validation";
import { generateUniqueSlug } from "@/lib/slug";
import { articleSupportsRating } from "@/lib/rating";

async function loadArticleForEdit(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: { coauthors: { select: { userId: true } } },
  });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const article = await loadArticleForEdit(params.id);
  if (!article) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const coauthorIds = article.coauthors.map((c) => c.userId);
  if (!canEditArticle(user, { authorId: article.authorId, coauthorIds })) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json({ article: { ...article, coauthorIds } });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const article = await loadArticleForEdit(params.id);
  if (!article) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const coauthorIds = article.coauthors.map((c) => c.userId);
  if (!canEditArticle(user, { authorId: article.authorId, coauthorIds })) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  if (article.status === "TRASHED") {
    return NextResponse.json({ error: "El artículo está en la papelera" }, { status: 409 });
  }

  const isAutosave = new URL(req.url).searchParams.get("autosave") === "1";
  const parsed = articleInputSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos no válidos" }, { status: 400 });
  }
  const data = parsed.data;

  let slug = article.slug;
  if (data.title && data.title !== article.title) {
    slug = await generateUniqueSlug(data.title, article.id);
  }

  let supportsRatingUpdate: boolean | undefined;
  if (data.topicId || data.categoryId) {
    const [topic, category] = await Promise.all([
      prisma.topic.findUnique({ where: { id: data.topicId ?? article.topicId } }),
      prisma.category.findUnique({ where: { id: data.categoryId ?? article.categoryId } }),
    ]);
    if (!topic || !category) {
      return NextResponse.json({ error: "Temática o categoría no válida" }, { status: 400 });
    }
    supportsRatingUpdate = articleSupportsRating(category, topic);
  }

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: {
      ...(data.title !== undefined ? { title: data.title, slug } : {}),
      ...(data.subtitle !== undefined ? { subtitle: data.subtitle } : {}),
      ...(data.body !== undefined ? { body: data.body } : {}),
      ...(data.topicId !== undefined ? { topicId: data.topicId } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.coverImageUrl !== undefined
        ? { coverImageUrl: data.coverImageUrl, coverGradient: data.coverImageUrl ? 0 : article.coverGradient }
        : {}),
      ...(data.coverGradient !== undefined && !data.coverImageUrl
        ? { coverGradient: data.coverGradient }
        : {}),
      ...(data.writerRating !== undefined
        ? { writerRating: supportsRatingUpdate ?? true ? data.writerRating : null }
        : {}),
      ...(data.coauthorIds
        ? {
            coauthors: {
              deleteMany: {},
              create: data.coauthorIds.map((userId) => ({ userId })),
            },
          }
        : {}),
      lastAutosaveAt: new Date(),
    },
  });

  return NextResponse.json({ article: updated, autosaved: isAutosave });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { coauthors: { select: { userId: true } } },
  });
  if (!article) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const coauthorIds = article.coauthors.map((c) => c.userId);
  const canDelete = isAdmin(user) || canEditArticle(user, { authorId: article.authorId, coauthorIds });
  if (!canDelete) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await prisma.article.update({
    where: { id: article.id },
    data: { status: "TRASHED", deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
