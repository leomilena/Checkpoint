import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Solo un administrador puede eliminar definitivamente" }, { status: 403 });
  }

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article || article.status !== "TRASHED") {
    return NextResponse.json({ error: "El artículo no está en la papelera" }, { status: 409 });
  }

  await prisma.article.delete({ where: { id: article.id } });
  return NextResponse.json({ ok: true });
}
