import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ArticleEditorForm } from "@/components/editor/article-editor-form";

export const metadata: Metadata = { title: "Nuevo artículo" };

export default async function NewArticlePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?callbackUrl=/redactor/nuevo");
  if (user.role !== "WRITER" && user.role !== "ADMIN") redirect("/");

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
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Nuevo artículo</h1>
      <ArticleEditorForm
        topics={topics}
        categories={categories}
        coauthorCandidates={coauthorCandidates}
        currentUserId={user.id}
        currentUserRole={user.role === "ADMIN" ? "ADMIN" : "WRITER"}
      />
    </div>
  );
}
