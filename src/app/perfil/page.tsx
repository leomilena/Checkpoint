import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { FavoritesList } from "@/components/profile/favorites-list";
import { ArticleCard } from "@/components/article-card";
import { articleCardSelect } from "@/lib/article-select";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function MyProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/entrar?callbackUrl=/perfil");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { name: true, bio: true, avatarColor: true, avatarImageUrl: true, role: true },
  });
  if (!user) redirect("/entrar");

  const isWriter = user.role === "WRITER" || user.role === "ADMIN";

  const publishedArticles = isWriter
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          OR: [{ authorId: sessionUser.id }, { coauthors: { some: { userId: sessionUser.id } } }],
        },
        orderBy: { publishedAt: "desc" },
        select: articleCardSelect,
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Mi perfil</h1>

      <ProfileEditForm
        initialName={user.name}
        initialBio={user.bio ?? ""}
        initialColor={user.avatarColor}
        initialImageUrl={user.avatarImageUrl}
      />

      {isWriter && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-text">Mis artículos publicados</h2>
            <Link href="/redactor/articulos" className="text-sm font-medium text-accent hover:underline">
              Ver borradores y revisión →
            </Link>
          </div>
          {publishedArticles.length === 0 ? (
            <p className="text-muted">Todavía no has publicado ningún artículo.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {publishedArticles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold text-text">Guardados</h2>
        <FavoritesList />
      </section>
    </div>
  );
}
