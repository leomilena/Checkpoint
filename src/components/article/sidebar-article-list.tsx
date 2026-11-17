import Link from "next/link";
import { CoverImage } from "@/components/cover-image";
import type { ArticleCard as ArticleCardType } from "@/lib/article-select";

export function SidebarArticleList({ title, articles }: { title: string; articles: ArticleCardType[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-wide text-accent">{title}</h2>
      <ul className="flex flex-col divide-y divide-border">
        {articles.map((article) => (
          <li key={article.id} className="py-3 first:pt-0 last:pb-0">
            <Link href={`/articulo/${article.slug}`} className="group flex items-start gap-3">
              <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <CoverImage
                  src={article.coverImageUrl}
                  gradient={article.coverGradient}
                  alt={article.title}
                  className="h-full w-full"
                />
              </span>
              <span className="line-clamp-3 text-sm font-medium leading-snug text-text transition group-hover:text-accent">
                {article.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
