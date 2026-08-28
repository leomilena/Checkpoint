"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TrashedArticle = {
  id: string;
  title: string;
  slug: string;
  deletedAt: string;
  author: { name: string };
};

type TrashedComment = {
  id: string;
  body: string;
  deletedAt: string;
  user: { name: string };
  article: { title: string; slug: string };
};

function daysLeft(deletedAt: string) {
  const purgeDate = new Date(deletedAt).getTime() + 30 * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((purgeDate - Date.now()) / (24 * 60 * 60 * 1000)));
}

export default function TrashPage() {
  const [articles, setArticles] = useState<TrashedArticle[] | null>(null);
  const [comments, setComments] = useState<TrashedComment[] | null>(null);

  async function load() {
    const res = await fetch("/api/admin/trash");
    const data = await res.json();
    setArticles(data.articles ?? []);
    setComments(data.comments ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function restoreArticle(id: string) {
    const res = await fetch(`/api/articles/${id}/restore`, { method: "POST" });
    if (res.ok) load();
  }
  async function purgeArticle(id: string) {
    if (!confirm("Esta acción es definitiva. ¿Eliminar el artículo para siempre?")) return;
    const res = await fetch(`/api/articles/${id}/purge`, { method: "DELETE" });
    if (res.ok) load();
  }
  async function restoreComment(id: string) {
    const res = await fetch(`/api/comments/${id}/restore`, { method: "POST" });
    if (res.ok) load();
  }
  async function purgeComment(id: string) {
    if (!confirm("Esta acción es definitiva. ¿Eliminar el comentario para siempre?")) return;
    const res = await fetch(`/api/comments/${id}/purge`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (!articles || !comments) return <p className="text-muted">Cargando…</p>;

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted">
        Los elementos en la papelera se eliminan definitivamente a los 30 días.
      </p>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-text">Artículos eliminados</h2>
        {articles.length === 0 ? (
          <p className="text-muted">La papelera de artículos está vacía.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {articles.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-border bg-surface px-4 py-2.5">
                <div>
                  <span className="text-sm font-medium text-text">{a.title || "Sin título"}</span>
                  <span className="ml-2 text-xs text-muted">
                    por {a.author.name} · quedan {daysLeft(a.deletedAt)} días
                  </span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => restoreArticle(a.id)} className="text-sm text-accent hover:underline">
                    Restaurar
                  </button>
                  <button type="button" onClick={() => purgeArticle(a.id)} className="text-sm text-danger hover:underline">
                    Eliminar definitivamente
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-text">Comentarios eliminados</h2>
        {comments.length === 0 ? (
          <p className="text-muted">La papelera de comentarios está vacía.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {comments.map((c) => (
              <li key={c.id} className="rounded-card border border-border bg-surface px-4 py-2.5">
                <p className="text-sm text-text">&ldquo;{c.body}&rdquo;</p>
                <p className="mt-1 text-xs text-muted">
                  {c.user.name} en{" "}
                  <Link href={`/articulo/${c.article.slug}`} className="text-accent hover:underline">
                    {c.article.title}
                  </Link>{" "}
                  · quedan {daysLeft(c.deletedAt)} días
                </p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => restoreComment(c.id)} className="text-sm text-accent hover:underline">
                    Restaurar
                  </button>
                  <button type="button" onClick={() => purgeComment(c.id)} className="text-sm text-danger hover:underline">
                    Eliminar definitivamente
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
