import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canLockComments } from "@/lib/permissions";
import { articleSupportsRating, ratingVerb } from "@/lib/rating";
import { renderArticleBody } from "@/lib/render-body";
import { CoverImage } from "@/components/cover-image";
import { Avatar } from "@/components/avatar";
import { MarkRead } from "@/components/article/mark-read";
import { LikeFavoriteBar } from "@/components/article/like-favorite-bar";
import { RatingWidget } from "@/components/article/rating-widget";
import { TextSizeControl } from "@/components/article/text-size-control";
import { CommentsSection } from "@/components/article/comments-section";
import { ArticleCard } from "@/components/article-card";
import { articleCardSelect } from "@/lib/article-select";

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    select: { title: true, subtitle: true, coverImageUrl: true, status: true },
  });
  if (!article || article.status !== "PUBLISHED") return { title: "Artículo no encontrado" };
  return {
    title: article.title,
    description: article.subtitle ?? undefined,
    openGraph: {
      title: article.title,
      description: article.subtitle ?? undefined,
      images: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const user = await getCurrentUser();

  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { id: true, name: true, avatarColor: true, avatarImageUrl: true, bio: true } },
      coauthors: {
        select: { user: { select: { id: true, name: true, avatarColor: true, avatarImageUrl: true } } },
      },
      category: true,
      topic: true,
    },
  });

  const isOwnerOrAdmin =
    user &&
    (user.role === "ADMIN" ||
      (article &&
        (article.authorId === user.id || article.coauthors.some((c) => c.user.id === user.id))));

  if (!article || (article.status !== "PUBLISHED" && !isOwnerOrAdmin)) {
    notFound();
  }

  const [likeCount, liked, favorited, yourRating] = await Promise.all([
    prisma.like.count({ where: { articleId: article.id } }),
    user ? prisma.like.findUnique({ where: { userId_articleId: { userId: user.id, articleId: article.id } } }) : null,
    user
      ? prisma.favorite.findUnique({ where: { userId_articleId: { userId: user.id, articleId: article.id } } })
      : null,
    user ? prisma.rating.findUnique({ where: { userId_articleId: { userId: user.id, articleId: article.id } } }) : null,
  ]);

  const [related, mostRead] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: article.id },
        OR: [{ topicId: article.topicId }, { categoryId: article.categoryId }],
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: articleCardSelect,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", id: { not: article.id } },
      orderBy: { views: "desc" },
      take: 4,
      select: articleCardSelect,
    }),
  ]);

  const showRating = articleSupportsRating(article.category, article.topic);
  const coauthors = article.coauthors.map((c) => c.user);
  const canLock = canLockComments(user, {
    authorId: article.authorId,
    coauthorIds: coauthors.map((c) => c.id),
  });

  const isDraftPreview = article.status !== "PUBLISHED";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <MarkRead slug={article.slug} articleId={article.id} />

      {isDraftPreview && (
        <div className="mb-6 rounded-card border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent">
          Vista previa — este artículo aún no está publicado ({article.status === "DRAFT" ? "borrador" : "en revisión"}).
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <span
          className="rounded-full px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide"
          style={{ color: article.category.color, backgroundColor: `${article.category.color}22` }}
        >
          {article.category.name}
        </span>
        <Link href={`/tema/${article.topic.slug}`} className="font-mono text-xs uppercase tracking-wide text-muted hover:text-accent">
          {article.topic.name}
        </Link>
      </div>

      <h1 className="font-display text-3xl font-bold leading-tight text-text sm:text-4xl">{article.title}</h1>
      {article.subtitle && <p className="mt-2 text-lg text-muted">{article.subtitle}</p>}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar name={article.author.name} color={article.author.avatarColor} imageUrl={article.author.avatarImageUrl} />
          <div className="text-sm">
            <Link href={`/perfil/${article.author.id}`} className="font-medium text-text hover:text-accent">
              {article.author.name}
            </Link>
            {coauthors.length > 0 && (
              <>
                {" "}
                y{" "}
                {coauthors.map((c, i) => (
                  <span key={c.id}>
                    <Link href={`/perfil/${c.id}`} className="font-medium text-text hover:text-accent">
                      {c.name}
                    </Link>
                    {i < coauthors.length - 1 ? ", " : ""}
                  </span>
                ))}
              </>
            )}
            <p className="text-xs text-muted">{formatDate(article.publishedAt)}</p>
          </div>
        </div>
        <TextSizeControl />
      </div>

      <CoverImage
        src={article.coverImageUrl}
        gradient={article.coverGradient}
        alt={article.title}
        className="my-6 aspect-[16/9] w-full rounded-card"
      />

      {showRating && (
        <div className="mb-6">
          <RatingWidget
            articleId={article.id}
            writerRating={article.writerRating}
            initialAvg={article.avgUserRating}
            initialCount={article.ratingsCount}
            initialYourRating={yourRating?.value ?? null}
            verb={ratingVerb(article.topic.slug)}
          />
        </div>
      )}

      <div className="prose-checkpoint">{renderArticleBody(article.body)}</div>

      <div className="mt-8 border-t border-border pt-6">
        <LikeFavoriteBar
          articleId={article.id}
          initialLiked={Boolean(liked)}
          initialLikeCount={likeCount}
          initialFavorited={Boolean(favorited)}
          articleTitle={article.title}
        />
      </div>

      {article.status === "PUBLISHED" && (
        <CommentsSection articleId={article.id} initialLocked={article.commentsLocked} canLock={Boolean(canLock)} />
      )}

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 font-display text-xl font-bold text-text">Artículos relacionados</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <ArticleCard key={r.id} article={r} />
            ))}
          </div>
        </section>
      )}

      {mostRead.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 font-display text-xl font-bold text-text">Más leídos de Checkpoint</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {mostRead.map((r) => (
              <ArticleCard key={r.id} article={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
