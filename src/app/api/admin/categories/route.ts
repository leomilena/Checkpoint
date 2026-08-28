import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { nextCategoryColor } from "@/lib/permissions";
import slugify from "slugify";

const schema = z.object({ name: z.string().min(2).max(40) });

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nombre no válido" }, { status: 400 });

  const slug = slugify(parsed.data.name, { lower: true, strict: true, locale: "es" });
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 409 });

  const count = await prisma.category.count();
  const category = await prisma.category.create({
    data: { name: parsed.data.name, slug, color: nextCategoryColor(count) },
  });

  return NextResponse.json({ category }, { status: 201 });
}
