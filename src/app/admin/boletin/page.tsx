"use client";

import { useEffect, useState } from "react";

type Subscriber = { id: string; email: string; createdAt: string };

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/newsletter")
      .then((res) => res.json())
      .then((data) => setSubscribers(data.subscribers ?? []));
  }, []);

  async function sendCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!subscribers || subscribers.length === 0) return;
    if (!confirm(`¿Enviar este boletín a ${subscribers.length} suscriptor(es)? No se puede deshacer.`)) {
      return;
    }

    setSending(true);
    setResult(null);
    const res = await fetch("/api/admin/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    if (!res.ok) {
      setResult(data.error ?? "No se ha podido enviar el boletín");
    } else {
      setResult(`Enviado a ${data.sent} de ${data.total} suscriptores${data.failed ? ` (${data.failed} fallidos)` : ""}.`);
      setSubject("");
      setBody("");
    }
    setSending(false);
  }

  if (!subscribers) return <p className="text-muted">Cargando…</p>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-text">Escribir boletín</h2>
        {subscribers.length === 0 ? (
          <p className="text-muted">Todavía no hay suscriptores a quién enviar nada.</p>
        ) : (
          <form onSubmit={sendCampaign} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
            <div>
              <label htmlFor="subject" className="mb-1 block text-xs font-medium text-muted">
                Asunto
              </label>
              <input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                maxLength={200}
                placeholder="Novedades de esta semana en The Frame"
                className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label htmlFor="body" className="mb-1 block text-xs font-medium text-muted">
                Contenido
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={8}
                maxLength={10000}
                placeholder="Escribe el boletín. Deja una línea en blanco entre párrafos."
                className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-fit rounded-full bg-accent px-5 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
            >
              {sending ? "Enviando…" : `Enviar a ${subscribers.length} suscriptor(es)`}
            </button>
            {result && <p className="text-sm text-muted">{result}</p>}
          </form>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-text">Suscriptores ({subscribers.length})</h2>
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
    </div>
  );
}
