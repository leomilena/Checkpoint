import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await prisma.commentReport.update({
    where: { id: params.id },
    data: { status: "DISMISSED" },
  });

  return NextResponse.json({ ok: true });
}
