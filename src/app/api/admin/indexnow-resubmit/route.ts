import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { notifyIndexNowBulk } from "@/lib/indexnow";
import { getBaseUrl } from "@/lib/site-url";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const baseUrl = getBaseUrl();
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });

  const urls = [baseUrl, ...articles.map((a) => `${baseUrl}/articulo/${a.slug}`)];
  await notifyIndexNowBulk(urls);

  return NextResponse.json({ sent: urls.length });
}
