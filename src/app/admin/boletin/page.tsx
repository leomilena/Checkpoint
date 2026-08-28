"use client";

import { useEffect, useState } from "react";

type Subscriber = { id: string; email: string; createdAt: string };

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/newsletter")
      .then((res) => res.json())
      .then((data) => setSubscribers(data.subscribers ?? []));
  }, []);

  if (!subscribers) return <p className="text-muted">Cargando…</p>;

  return (
    <div>
      <p className="mb-4 text-sm text-muted">{subscribers.length} suscriptores al boletín.</p>
      {subscribers.length === 0 ? (
        <p className="text-muted">Todavía no hay suscriptores.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface">
          {subscribers.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-text">{s.email}</span>
              <span className="font-mono text-xs text-muted">
                {new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
                  new Date(s.createdAt)
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
