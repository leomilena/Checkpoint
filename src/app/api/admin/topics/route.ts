import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import slugify from "slugify";

const schema = z.object({ name: z.string().min(2).max(40) });

export async function GET() {
  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ topics });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nombre no válido" }, { status: 400 });

  const slug = slugify(parsed.data.name, { lower: true, strict: true, locale: "es" });
  const existing = await prisma.topic.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Ya existe una temática con ese nombre" }, { status: 409 });

  const topic = await prisma.topic.create({ data: { name: parsed.data.name, slug } });
  return NextResponse.json({ topic }, { status: 201 });
}
