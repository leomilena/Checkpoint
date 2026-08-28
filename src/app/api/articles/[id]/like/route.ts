import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const existing = await prisma.like.findUnique({
    where: { userId_articleId: { userId: user.id, articleId: params.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { userId_articleId: { userId: user.id, articleId: params.id } } });
  } else {
    await prisma.like.create({ data: { userId: user.id, articleId: params.id } });
  }

  const count = await prisma.like.count({ where: { articleId: params.id } });
  return NextResponse.json({ liked: !existing, count });
}
