import slugify from "slugify";
import { prisma } from "@/lib/prisma";

export async function generateUniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title, { lower: true, strict: true, locale: "es" }).slice(0, 80) || "articulo";
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}
