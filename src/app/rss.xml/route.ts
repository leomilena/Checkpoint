import { prisma } from "@/lib/prisma";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 30,
    select: {
      title: true,
      subtitle: true,
      slug: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  const items = articles
    .map(
      (a) => `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${baseUrl}/articulo/${a.slug}</link>
      <guid>${baseUrl}/articulo/${a.slug}</guid>
      ${a.subtitle ? `<description>${escapeXml(a.subtitle)}</description>` : ""}
      <author>${escapeXml(a.author.name)}</author>
      <pubDate>${(a.publishedAt ?? new Date()).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Checkpoint</title>
    <link>${baseUrl}</link>
    <description>Videojuegos, cine y frikada.</description>
    <language>es</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
