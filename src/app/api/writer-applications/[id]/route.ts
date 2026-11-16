import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const schema = z.object({
  reviewed: z.boolean(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });

  const application = await prisma.writerApplication.update({
    where: { id: params.id },
    data: { reviewed: parsed.data.reviewed },
  });

  return NextResponse.json({ application });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await prisma.writerApplication.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
