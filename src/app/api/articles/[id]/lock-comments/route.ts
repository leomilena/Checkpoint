import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canLockComments } from "@/lib/permissions";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { coauthors: { select: { userId: true } } },
  });
  if (!article) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const coauthorIds = article.coauthors.map((c) => c.userId);
  if (!canLockComments(user, { authorId: article.authorId, coauthorIds })) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { commentsLocked: !article.commentsLocked },
  });

  return NextResponse.json({ commentsLocked: updated.commentsLocked });
}
