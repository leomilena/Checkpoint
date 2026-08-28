"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Result = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  author: { name: string };
  category: { name: string; color: string };
};

export function SearchBox() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.articles ?? []);
        setOpen(true);
      } catch {
        // ignore aborted requests
      }
    }, 200);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function submitFullSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={submitFullSearch}
        className={`items-center gap-2 rounded-full border border-border bg-surface2 px-3 py-1.5 transition-all sm:flex ${
          expanded ? "flex" : "hidden sm:flex"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-muted">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Buscar artículos, autores…"
          aria-label="Buscar en Checkpoint"
          className="w-40 bg-transparent text-sm text-text placeholder:text-muted focus:outline-none sm:w-56"
        />
      </form>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-label="Abrir buscador"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface2 text-muted hover:text-accent sm:hidden"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && results.length > 0 && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-card border border-border bg-surface shadow-xl">
          <ul>
            {results.map((r) => (
              <li key={r.id} className="border-b border-border last:border-0">
                <Link
                  href={`/articulo/${r.slug}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 transition hover:bg-surface2"
                >
                  <span
                    className="mb-1 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
                    style={{ color: r.category.color, backgroundColor: `${r.category.color}22` }}
                  >
                    {r.category.name}
                  </span>
                  <p className="line-clamp-1 text-sm font-medium text-text">{r.title}</p>
                  <p className="text-xs text-muted">{r.author.name}</p>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={submitFullSearch}
            className="block w-full px-4 py-2 text-left text-xs font-medium text-accent hover:bg-surface2"
          >
            Ver todos los resultados para “{query}”
          </button>
        </div>
      )}
    </div>
  );
}
