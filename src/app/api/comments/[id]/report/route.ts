import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({ reason: z.string().max(300).optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });

  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment || comment.status !== "VISIBLE") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));

  await prisma.commentReport.create({
    data: {
      commentId: comment.id,
      reporterId: user.id,
      reason: parsed.success ? parsed.data.reason : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
