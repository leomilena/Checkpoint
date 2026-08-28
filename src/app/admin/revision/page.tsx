"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  updatedAt: string;
  author: { id: string; name: string };
  category: { name: string };
  topic: { name: string };
};

export default function AdminReviewPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch("/api/admin/review");
    const data = await res.json();
    setItems(data.articles ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    const res = await fetch(`/api/articles/${id}/publish`, { method: "POST" });
    if (res.ok) load();
    else alert((await res.json()).error ?? "No se ha podido publicar");
  }

  async function returnToDraft(id: string) {
    const note = noteDrafts[id] ?? "";
    const res = await fetch(`/api/articles/${id}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note || undefined }),
    });
    if (res.ok) load();
  }

  if (!items) return <p className="text-muted">Cargando…</p>;
  if (items.length === 0) return <p className="text-muted">No hay artículos pendientes de revisión.</p>;

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.id} className="rounded-card border border-border bg-surface p-4">
          <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase text-muted">
            <span>{item.category.name}</span>
            <span>·</span>
            <span>{item.topic.name}</span>
          </div>
          <Link href={`/articulo/${item.slug}`} className="font-display text-lg font-semibold text-text hover:text-accent">
            {item.title || "Sin título"}
          </Link>
          {item.subtitle && <p className="text-sm text-muted">{item.subtitle}</p>}
          <p className="mt-1 text-xs text-muted">Enviado por {item.author.name}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => approve(item.id)}
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-bg hover:opacity-90"
            >
              Aprobar y publicar
            </button>
            <input
              placeholder="Nota opcional para el redactor"
              value={noteDrafts[item.id] ?? ""}
              onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
              className="min-w-[200px] flex-1 rounded-full border border-border bg-surface2 px-3 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => returnToDraft(item.id)}
              className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted hover:text-danger"
            >
              Devolver a borrador
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
