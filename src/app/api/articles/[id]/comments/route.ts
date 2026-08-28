import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { commentSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { looksLikeSpamOrAbuse } from "@/lib/moderation";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const comments = await prisma.comment.findMany({
    where: { articleId: params.id, parentId: null, status: "VISIBLE" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatarColor: true, avatarImageUrl: true } },
      replies: {
        where: { status: "VISIBLE" },
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, avatarColor: true, avatarImageUrl: true } },
        },
      },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesión para comentar" }, { status: 401 });
  if (!rateLimit(`comment:${user.id}`, 10, 60 * 1000)) {
    return NextResponse.json({ error: "Estás comentando demasiado rápido. Espera un momento." }, { status: 429 });
  }

  const parsed = commentSchema.safeParse({ ...(await req.json().catch(() => ({}))), articleId: params.id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Comentario no válido" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article || article.status !== "PUBLISHED") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (article.commentsLocked) {
    return NextResponse.json({ error: "Los comentarios de este artículo están bloqueados" }, { status: 409 });
  }
  if (looksLikeSpamOrAbuse(parsed.data.body)) {
    return NextResponse.json(
      { error: "Tu comentario parece spam o contiene lenguaje no permitido" },
      { status: 400 }
    );
  }

  if (parsed.data.parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parsed.data.parentId } });
    if (!parent || parent.articleId !== article.id) {
      return NextResponse.json({ error: "Comentario padre no válido" }, { status: 400 });
    }
    if (parent.parentId) {
      return NextResponse.json({ error: "Solo se admite un nivel de respuestas" }, { status: 400 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      articleId: article.id,
      userId: user.id,
      parentId: parsed.data.parentId ?? null,
      body: parsed.data.body,
    },
    include: {
      user: { select: { id: true, name: true, avatarColor: true, avatarImageUrl: true } },
    },
  });

  if (article.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: article.authorId,
        type: "NEW_COMMENT",
        articleId: article.id,
        commentId: comment.id,
        message: `${user.name} ha comentado en "${article.title}".`,
      },
    });
  }

  return NextResponse.json({ comment }, { status: 201 });
}
