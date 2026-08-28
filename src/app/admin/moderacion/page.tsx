"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Report = {
  id: string;
  reason: string | null;
  createdAt: string;
  reporter: { name: string };
  comment: {
    id: string;
    body: string;
    user: { name: string };
    article: { title: string; slug: string };
  };
};

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[] | null>(null);

  async function load() {
    const res = await fetch("/api/admin/moderation");
    const data = await res.json();
    setReports(data.reports ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function dismiss(reportId: string) {
    const res = await fetch(`/api/admin/moderation/${reportId}/dismiss`, { method: "POST" });
    if (res.ok) load();
  }

  async function removeComment(commentId: string) {
    if (!confirm("¿Eliminar este comentario?")) return;
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (!reports) return <p className="text-muted">Cargando…</p>;
  if (reports.length === 0) return <p className="text-muted">No hay comentarios reportados pendientes.</p>;

  return (
    <ul className="flex flex-col gap-4">
      {reports.map((report) => (
        <li key={report.id} className="rounded-card border border-border bg-surface p-4">
          <p className="text-xs text-muted">
            Reportado por {report.reporter.name}
            {report.reason ? ` — "${report.reason}"` : ""}
          </p>
          <div className="mt-2 rounded-card border border-border bg-surface2 p-3">
            <p className="mb-1 text-xs font-semibold text-text">{report.comment.user.name}</p>
            <p className="text-sm text-text">{report.comment.body}</p>
          </div>
          <p className="mt-1 text-xs text-muted">
            En{" "}
            <Link href={`/articulo/${report.comment.article.slug}`} className="text-accent hover:underline">
              {report.comment.article.title}
            </Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => dismiss(report.id)}
              className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text hover:border-accent"
            >
              Descartar reporte
            </button>
            <button
              type="button"
              onClick={() => removeComment(report.comment.id)}
              className="rounded-full border border-danger px-4 py-1.5 text-sm font-medium text-danger hover:bg-danger/10"
            >
              Eliminar comentario
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
