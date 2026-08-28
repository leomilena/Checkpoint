"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string; color: string };
type Topic = { id: string; name: string };

function TagManager<T extends { id: string; name: string }>({
  title,
  items,
  onAdd,
  onRemove,
  renderTag,
}: {
  title: string;
  items: T[];
  onAdd: (name: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  renderTag?: (item: T) => React.ReactNode;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      await onAdd(name.trim());
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <h2 className="mb-3 font-display text-lg font-bold text-text">{title}</h2>
      <div className="mb-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.id}
            className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-text"
          >
            {renderTag ? renderTag(item) : item.name}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Eliminar ${item.name}`}
              className="text-muted hover:text-danger"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="flex-1 rounded-full border border-border bg-surface2 px-3 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
        />
        <button type="submit" className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-bg hover:opacity-90">
          Añadir
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [topics, setTopics] = useState<Topic[] | null>(null);

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
  }
  async function loadTopics() {
    const res = await fetch("/api/admin/topics");
    const data = await res.json();
    setTopics(data.topics ?? []);
  }

  useEffect(() => {
    loadCategories();
    loadTopics();
  }, []);

  async function addCategory(name: string) {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await loadCategories();
  }
  async function removeCategory(id: string) {
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) loadCategories();
    else alert((await res.json()).error ?? "No se ha podido eliminar");
  }

  async function addTopic(name: string) {
    const res = await fetch("/api/admin/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await loadTopics();
  }
  async function removeTopic(id: string) {
    const res = await fetch(`/api/admin/topics/${id}`, { method: "DELETE" });
    if (res.ok) loadTopics();
    else alert((await res.json()).error ?? "No se ha podido eliminar");
  }

  if (!categories || !topics) return <p className="text-muted">Cargando…</p>;

  return (
    <div className="flex flex-col gap-6">
      <TagManager
        title="Categorías"
        items={categories}
        onAdd={addCategory}
        onRemove={removeCategory}
        renderTag={(item) => (
          <>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
            {item.name}
          </>
        )}
      />
      <TagManager title="Temáticas" items={topics} onAdd={addTopic} onRemove={removeTopic} />
    </div>
  );
}
