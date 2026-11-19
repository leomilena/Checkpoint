import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/site-url";

// Evita que Next intente generar el sitemap en build time (sin acceso a la
// base de datos todavía en la mayoría de plataformas); se calcula al vuelo
// en cada petición, igual que el resto de la app.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const [articles, topics, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 5000,
    }),
    prisma.topic.findMany({ select: { slug: true } }),
    prisma.category.findMany({ select: { slug: true } }),
  ]);

  return [
    { url: baseUrl, changeFrequency: "hourly", priority: 1 },
    ...topics.map((t) => ({
      url: `${baseUrl}/tema/${t.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
    ...categories.map((c) => ({
      url: `${baseUrl}/categoria/${c.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
    ...articles.map((a) => ({
      url: `${baseUrl}/articulo/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
