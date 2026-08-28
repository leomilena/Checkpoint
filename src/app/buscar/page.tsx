import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SearchResults } from "@/components/search-results";

export const metadata: Metadata = { title: "Buscar" };

export default async function SearchPage() {
  const [topics, categories] = await Promise.all([
    prisma.topic.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Buscar</h1>
      <Suspense fallback={null}>
        <SearchResults topics={topics} categories={categories} />
      </Suspense>
    </div>
  );
}
