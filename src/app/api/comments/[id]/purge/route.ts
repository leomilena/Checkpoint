import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Solo un administrador puede eliminar definitivamente" }, { status: 403 });
  }

  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment || comment.status !== "DELETED") {
    return NextResponse.json({ error: "El comentario no está en la papelera" }, { status: 409 });
  }

  await prisma.comment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
