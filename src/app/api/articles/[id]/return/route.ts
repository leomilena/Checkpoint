import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";

const schema = z.object({ note: z.string().max(500).optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Solo un administrador puede devolver artículos" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  const note = parsed.success ? parsed.data.note : undefined;

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (article.status !== "REVIEW") {
    return NextResponse.json({ error: "Solo se pueden devolver artículos en revisión" }, { status: 409 });
  }

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { status: "DRAFT", reviewNote: note ?? "El administrador ha devuelto este artículo a borrador." },
  });

  await prisma.notification.create({
    data: {
      userId: article.authorId,
      type: "ARTICLE_RETURNED",
      articleId: article.id,
      message: `Tu artículo "${article.title}" ha sido devuelto a borrador.`,
    },
  });

  return NextResponse.json({ article: updated });
}
