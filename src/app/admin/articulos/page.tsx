"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "TRASHED";
  updatedAt: string;
  author: { name: string };
  category: { name: string; color: string };
  topic: { name: string };
};

const STATUS_LABEL: Record<Item["status"], string> = {
  DRAFT: "Borrador",
  REVIEW: "En revisión",
  PUBLISHED: "Publicado",
  TRASHED: "En papelera",
};

export default function AdminArticlesPage() {
  const [items, setItems] = useState<Item[] | null>(null);

  async function load() {
    const res = await fetch("/api/articles");
    const data = await res.json();
    setItems(data.articles ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("¿Enviar este artículo a la papelera?")) return;
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (!items) return <p className="text-muted">Cargando…</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="py-2 pr-4">Título</th>
            <th className="py-2 pr-4">Autor</th>
            <th className="py-2 pr-4">Estado</th>
            <th className="py-2 pr-4">Actualizado</th>
            <th className="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border">
              <td className="py-2.5 pr-4 font-medium text-text">{item.title || "Sin título"}</td>
              <td className="py-2.5 pr-4 text-muted">{item.author.name}</td>
              <td className="py-2.5 pr-4 text-muted">{STATUS_LABEL[item.status]}</td>
              <td className="py-2.5 pr-4 font-mono text-xs text-muted">
                {new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
                  new Date(item.updatedAt)
                )}
              </td>
              <td className="flex gap-2 py-2.5">
                <Link href={`/redactor/editar/${item.id}`} className="text-accent hover:underline">
                  Editar
                </Link>
                <button type="button" onClick={() => remove(item.id)} className="text-danger hover:underline">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
