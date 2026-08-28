import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Solo un administrador puede restaurar" }, { status: 403 });
  }

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article || article.status !== "TRASHED") {
    return NextResponse.json({ error: "El artículo no está en la papelera" }, { status: 409 });
  }

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { status: article.publishedAt ? "PUBLISHED" : "DRAFT", deletedAt: null },
  });

  return NextResponse.json({ article: updated });
}
