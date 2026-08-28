"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "TRASHED";
  reviewNote: string | null;
  updatedAt: string;
  category: { name: string; color: string };
  topic: { name: string };
};

const STATUS_LABEL: Record<Item["status"], string> = {
  DRAFT: "Borrador",
  REVIEW: "En revisión",
  PUBLISHED: "Publicado",
  TRASHED: "En papelera",
};

export function MyArticlesList() {
  const [items, setItems] = useState<Item[] | null>(null);

  async function load() {
    const res = await fetch("/api/articles?mine=1");
    const data = await res.json();
    setItems(data.articles ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submitReview(id: string) {
    const res = await fetch(`/api/articles/${id}/submit-review`, { method: "POST" });
    if (res.ok) load();
    else alert((await res.json()).error ?? "No se ha podido enviar a revisión");
  }

  async function remove(id: string) {
    if (!confirm("¿Enviar este artículo a la papelera?")) return;
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (!items) return <p className="text-muted">Cargando…</p>;
  if (items.length === 0) return <p className="text-muted">Todavía no has creado ningún artículo.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-card border border-border bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase"
                  style={{ color: item.category.color, backgroundColor: `${item.category.color}22` }}
                >
                  {item.category.name}
                </span>
                <span className="font-mono text-[10px] uppercase text-muted">{item.topic.name}</span>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted">
                  {STATUS_LABEL[item.status]}
                </span>
              </div>
              <p className="font-display font-semibold text-text">{item.title || "Sin título"}</p>
              {item.reviewNote && item.status === "DRAFT" && (
                <p className="mt-1 text-xs text-danger">Nota del admin: {item.reviewNote}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {item.status === "PUBLISHED" ? (
                <Link
                  href={`/articulo/${item.slug}`}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text hover:border-accent"
                >
                  Ver
                </Link>
              ) : (
                <Link
                  href={`/articulo/${item.slug}`}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text hover:border-accent"
                >
                  Vista previa
                </Link>
              )}
              {item.status !== "TRASHED" && (
                <Link
                  href={`/redactor/editar/${item.id}`}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text hover:border-accent"
                >
                  Editar
                </Link>
              )}
              {item.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={() => submitReview(item.id)}
                  className="rounded-full bg-accent2 px-3 py-1.5 text-xs font-semibold text-bg hover:opacity-90"
                >
                  Enviar a revisión
                </button>
              )}
              {item.status !== "TRASHED" && (
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-danger hover:border-danger"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
