import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_articleId: { userId: user.id, articleId: params.id } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { userId_articleId: { userId: user.id, articleId: params.id } } });
  } else {
    await prisma.favorite.create({ data: { userId: user.id, articleId: params.id } });
  }

  return NextResponse.json({ favorited: !existing });
}
