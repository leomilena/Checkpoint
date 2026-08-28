"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Item = { name: string; slug: string };

export function CategoryBar({
  topics,
  categories,
}: {
  topics: Item[];
  categories: Item[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [moreOpen, setMoreOpen] = useState(false);

  const activeTopic = pathname.startsWith("/tema/") ? pathname.split("/")[2] : searchParams?.get("topic");
  const activeCategory = pathname.startsWith("/categoria/")
    ? pathname.split("/")[2]
    : searchParams?.get("category");

  const visibleTopics = topics.slice(0, 3);
  const overflowTopics = topics.slice(3);

  const tabClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
      active
        ? "bg-accent text-bg"
        : "text-muted hover:bg-surface2 hover:text-text"
    }`;

  return (
    <nav
      aria-label="Categorías y temáticas"
      className="sticky top-[57px] z-40 border-b border-border bg-bg/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-thin">
        <Link href="/" className={tabClass(pathname === "/")}>
          Portada
        </Link>

        {visibleTopics.map((t) => (
          <Link key={t.slug} href={`/tema/${t.slug}`} className={tabClass(activeTopic === t.slug)}>
            {t.name}
          </Link>
        ))}

        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/categoria/${c.slug}`}
            className={tabClass(activeCategory === c.slug)}
          >
            {c.name}
          </Link>
        ))}

        {overflowTopics.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={tabClass(overflowTopics.some((t) => t.slug === activeTopic))}
              aria-expanded={moreOpen}
            >
              Más ▾
            </button>
            {moreOpen && (
              <div className="absolute left-0 z-40 mt-2 w-44 overflow-hidden rounded-card border border-border bg-surface shadow-xl">
                {overflowTopics.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tema/${t.slug}`}
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 text-sm text-text hover:bg-surface2"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
