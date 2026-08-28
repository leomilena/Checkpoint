import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Avatar } from "@/components/avatar";
import { ArticleCard } from "@/components/article-card";
import { articleCardSelect } from "@/lib/article-select";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { name: true } });
  return { title: user?.name ?? "Perfil" };
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();
  if (currentUser?.id === params.id) redirect("/perfil");

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, bio: true, avatarColor: true, avatarImageUrl: true, role: true },
  });
  if (!user) notFound();

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ authorId: user.id }, { coauthors: { some: { userId: user.id } } }],
    },
    orderBy: { publishedAt: "desc" },
    select: articleCardSelect,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Avatar name={user.name} color={user.avatarColor} imageUrl={user.avatarImageUrl} size={64} />
        <div>
          <h1 className="font-display text-2xl font-bold text-text">{user.name}</h1>
          {user.bio && <p className="mt-1 max-w-lg text-sm text-muted">{user.bio}</p>}
        </div>
      </div>

      <h2 className="mb-4 font-display text-lg font-bold text-text">Artículos publicados</h2>
      {articles.length === 0 ? (
        <p className="text-muted">Todavía no hay artículos publicados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
