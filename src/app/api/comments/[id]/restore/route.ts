import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Solo un administrador puede restaurar comentarios" }, { status: 403 });
  }

  await prisma.comment.update({
    where: { id: params.id },
    data: { status: "VISIBLE", deletedAt: null },
  });

  return NextResponse.json({ ok: true });
}
