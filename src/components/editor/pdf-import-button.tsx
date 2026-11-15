"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function PdfImportButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/articles/import-pdf", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se ha podido importar el PDF");
      router.push(`/redactor/editar/${data.article.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se ha podido importar el PDF");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {loading ? "Importando…" : "Importar desde PDF"}
      </button>
      <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={onPick} className="hidden" />
    </div>
  );
}
