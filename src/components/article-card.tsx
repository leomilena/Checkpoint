import Link from "next/link";
import { CoverImage } from "@/components/cover-image";
import { Avatar } from "@/components/avatar";
import { StarRatingDisplay } from "@/components/star-rating";
import { ReadBadge } from "@/components/read-badge";
import { articleSupportsRating } from "@/lib/rating";
import type { ArticleCard as ArticleCardType } from "@/lib/article-select";

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(date));
}

export function ArticleCard({ article }: { article: ArticleCardType }) {
  const showRating = articleSupportsRating(article.category, article.topic);
  const coauthors = article.coauthors.map((c) => c.user);
  const authorLabel =
    coauthors.length > 0 ? `${article.author.name} y ${coauthors[0].name}` : article.author.name;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-8px_var(--cp-accent)]">
      <Link href={`/articulo/${article.slug}`} className="relative block aspect-[16/9]">
        <ReadBadge slug={article.slug} />
        <CoverImage
          src={article.coverImageUrl}
          gradient={article.coverGradient}
          alt={article.title}
          className="h-full w-full"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: article.category.color, backgroundColor: `${article.category.color}22` }}
          >
            {article.category.name}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted">{article.topic.name}</span>
        </div>

        <Link href={`/articulo/${article.slug}`}>
          <h3 className="font-display text-lg font-semibold leading-snug text-text transition group-hover:text-accent">
            {article.title}
          </h3>
        </Link>

        {article.subtitle && <p className="line-clamp-2 text-sm text-muted">{article.subtitle}</p>}

        {showRating && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
            {article.writerRating != null && (
              <span className="flex items-center gap-1">
                <StarRatingDisplay value={article.writerRating} />
                {article.writerRating.toFixed(1)}
              </span>
            )}
            {article.ratingsCount > 0 && (
              <span>
                Usuarios: {article.avgUserRating.toFixed(1)} ({article.ratingsCount})
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Avatar name={article.author.name} color={article.author.avatarColor} imageUrl={article.author.avatarImageUrl} size={24} />
            <span className="text-xs text-muted">{authorLabel}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-muted">
            <span>{formatDate(article.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              {article.views}
            </span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              {article._count.comments}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
