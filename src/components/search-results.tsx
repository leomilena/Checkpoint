"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CoverImage } from "@/components/cover-image";

type Item = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  coverImageUrl: string | null;
  coverGradient: number;
  publishedAt: string | null;
  author: { name: string };
  category: { name: string; color: string; slug: string };
  topic: { name: string; slug: string };
};

export function SearchResults({
  topics,
  categories,
}: {
  topics: { name: string; slug: string }[];
  categories: { name: string; slug: string }[];
}) {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSearch() {
    setLoading(true);
    const params = new URLSearchParams({ limit: "24" });
    if (q) params.set("q", q);
    if (topic) params.set("topic", topic);
    if (category) params.set("category", category);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();
    setResults(data.articles ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (q || topic || category || from || to) runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
        className="mb-8 flex flex-col gap-3 rounded-card border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="q" className="mb-1 block text-xs font-medium text-muted">
            Búsqueda
          </label>
          <input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Título, autor, contenido…"
            className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="topic" className="mb-1 block text-xs font-medium text-muted">
            Temática
          </label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
          >
            <option value="">Todas</option>
            {topics.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-xs font-medium text-muted">
            Categoría
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="mb-1 block text-xs font-medium text-muted">
            Desde
          </label>
          <input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="to" className="mb-1 block text-xs font-medium text-muted">
            Hasta
          </label>
          <input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-bg transition hover:opacity-90"
        >
          Buscar
        </button>
      </form>

      {loading && <p className="text-muted">Buscando…</p>}

      {!loading && results && results.length === 0 && <p className="text-muted">Sin resultados.</p>}

      {!loading && results && results.length > 0 && (
        <ul className="flex flex-col gap-4">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={`/articulo/${r.slug}`}
                className="flex gap-4 rounded-card border border-border bg-surface p-3 transition hover:border-accent"
              >
                <CoverImage
                  src={r.coverImageUrl}
                  gradient={r.coverGradient}
                  alt={r.title}
                  className="h-20 w-32 shrink-0 rounded-lg"
                />
                <div>
                  <span
                    className="mb-1 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase"
                    style={{ color: r.category.color, backgroundColor: `${r.category.color}22` }}
                  >
                    {r.category.name}
                  </span>
                  <h3 className="font-display font-semibold text-text">{r.title}</h3>
                  {r.subtitle && <p className="line-clamp-1 text-sm text-muted">{r.subtitle}</p>}
                  <p className="mt-1 text-xs text-muted">{r.author.name}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
