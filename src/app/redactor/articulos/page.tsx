import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { MyArticlesList } from "@/components/editor/my-articles-list";

export const metadata: Metadata = { title: "Mis artículos" };

export default async function MyArticlesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?callbackUrl=/redactor/articulos");
  if (user.role !== "WRITER" && user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Mis artículos</h1>
      </div>
      <MyArticlesList />
    </div>
  );
}
