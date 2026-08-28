"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  mostRead: { id: string; title: string; slug: string; views: number; author: { name: string } }[];
  mostActiveAuthors: { id: string; name: string; publishedCount: number }[];
  totals: { publishedCount: number; userCount: number; commentCount: number; subscriberCount: number };
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <p className="text-muted">Cargando…</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Publicados", value: stats.totals.publishedCount },
          { label: "Usuarios", value: stats.totals.userCount },
          { label: "Comentarios", value: stats.totals.commentCount },
          { label: "Suscriptores", value: stats.totals.subscriberCount },
        ].map((card) => (
          <div key={card.label} className="rounded-card border border-border bg-surface p-4">
            <p className="font-mono text-2xl font-bold text-accent">{card.value}</p>
            <p className="text-sm text-muted">{card.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-text">Artículos más leídos</h2>
        <ol className="flex flex-col gap-2">
          {stats.mostRead.map((a, i) => (
            <li key={a.id} className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-2.5">
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted">{i + 1}</span>
                <Link href={`/articulo/${a.slug}`} className="text-sm font-medium text-text hover:text-accent">
                  {a.title}
                </Link>
                <span className="text-xs text-muted">— {a.author.name}</span>
              </span>
              <span className="font-mono text-sm text-muted">{a.views} vistas</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-text">Autores más activos</h2>
        <ol className="flex flex-col gap-2">
          {stats.mostActiveAuthors.map((a, i) => (
            <li key={a.id} className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-2.5">
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted">{i + 1}</span>
                <span className="text-sm font-medium text-text">{a.name}</span>
              </span>
              <span className="font-mono text-sm text-muted">{a.publishedCount} artículos</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
