import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canEditArticle } from "@/lib/permissions";
import { ArticleEditorForm } from "@/components/editor/article-editor-form";

export const metadata: Metadata = { title: "Editar artículo" };

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?callbackUrl=/redactor/editar/${params.id}`);
  if (user.role !== "WRITER" && user.role !== "ADMIN") redirect("/");

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { coauthors: { select: { userId: true } } },
  });
  if (!article) notFound();

  const coauthorIds = article.coauthors.map((c) => c.userId);
  if (!canEditArticle(user, { authorId: article.authorId, coauthorIds })) {
    redirect("/");
  }

  const [topics, categories, coauthorCandidates] = await Promise.all([
    prisma.topic.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: { in: ["WRITER", "ADMIN"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Editar artículo</h1>
      <ArticleEditorForm
        topics={topics}
        categories={categories}
        coauthorCandidates={coauthorCandidates}
        currentUserId={user.id}
        currentUserRole={user.role === "ADMIN" ? "ADMIN" : "WRITER"}
        initialArticle={{
          id: article.id,
          title: article.title,
          subtitle: article.subtitle,
          body: article.body,
          topicId: article.topicId,
          categoryId: article.categoryId,
          coverImageUrl: article.coverImageUrl,
          coverGradient: article.coverGradient,
          writerRating: article.writerRating,
          coauthorIds,
          status: article.status,
          reviewNote: article.reviewNote,
          slug: article.slug,
        }}
      />
    </div>
  );
}
