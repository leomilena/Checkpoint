import { NextResponse } from "next/server";
import { listPublishedArticles, type SortKey } from "@/lib/article-query";

const VALID_SORTS: SortKey[] = ["recent", "most-read", "most-commented", "top-rated"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topicSlug = searchParams.get("topic") ?? undefined;
  const categorySlug = searchParams.get("category") ?? undefined;
  const sortParam = searchParams.get("sort") as SortKey | null;
  const sort = sortParam && VALID_SORTS.includes(sortParam) ? sortParam : "recent";
  const page = Math.max(0, Number(searchParams.get("page") ?? 0));

  const result = await listPublishedArticles({ topicSlug, categorySlug, sort, page, pageSize: 6 });
  return NextResponse.json(result);
}
