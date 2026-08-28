import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Solo un administrador puede eliminar comentarios" }, { status: 403 });
  }

  const comment = await prisma.comment.update({
    where: { id: params.id },
    data: { status: "DELETED", deletedAt: new Date() },
  });

  await prisma.commentReport.updateMany({
    where: { commentId: comment.id, status: "PENDING" },
    data: { status: "RESOLVED" },
  });

  return NextResponse.json({ ok: true });
}
