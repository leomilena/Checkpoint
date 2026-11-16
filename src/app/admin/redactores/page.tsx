"use client";

import { useEffect, useState } from "react";

type Application = {
  id: string;
  name: string;
  email: string;
  message: string;
  reviewed: boolean;
  createdAt: string;
};

export default function WriterApplicationsAdminPage() {
  const [applications, setApplications] = useState<Application[] | null>(null);

  async function load() {
    const res = await fetch("/api/writer-applications");
    const data = await res.json();
    setApplications(data.applications ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleReviewed(id: string, reviewed: boolean) {
    const res = await fetch(`/api/writer-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewed }),
    });
    if (res.ok) load();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    const res = await fetch(`/api/writer-applications/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (!applications) return <p className="text-muted">Cargando…</p>;

  if (applications.length === 0) {
    return <p className="text-muted">Todavía no ha llegado ninguna solicitud de redactor.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {applications.map((app) => (
        <div
          key={app.id}
          className={`rounded-card border p-4 ${
            app.reviewed ? "border-border bg-surface opacity-70" : "border-accent/40 bg-surface"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-text">{app.name}</p>
              <a href={`mailto:${app.email}`} className="text-sm text-accent hover:underline">
                {app.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted">
                {new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
                  new Date(app.createdAt)
                )}
              </span>
              <button
                type="button"
                onClick={() => toggleReviewed(app.id, !app.reviewed)}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted transition hover:text-text"
              >
                {app.reviewed ? "Marcar pendiente" : "Marcar revisada"}
              </button>
              <button
                type="button"
                onClick={() => remove(app.id)}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-danger transition hover:bg-danger/10"
              >
                Eliminar
              </button>
            </div>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{app.message}</p>
        </div>
      ))}
    </div>
  );
}
