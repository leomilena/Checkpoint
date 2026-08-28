"use client";

import { useRef, useState } from "react";
import { CoverImage } from "@/components/cover-image";

export function CoverUploader({
  coverImageUrl,
  coverGradient,
  onChange,
}: {
  coverImageUrl: string | null;
  coverGradient: number;
  onChange: (next: { coverImageUrl: string | null; coverGradient: number }) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "cover");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onChange({ coverImageUrl: data.url, coverGradient });
    } catch {
      alert("No se ha podido subir la portada.");
    } finally {
      setUploading(false);
    }
  }

  function shuffleGradient() {
    const next = Math.floor(Math.random() * 6);
    onChange({ coverImageUrl: null, coverGradient: next });
  }

  return (
    <div>
      <CoverImage
        src={coverImageUrl}
        gradient={coverGradient}
        alt="Portada del artículo"
        className="aspect-[16/9] w-full rounded-card"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-text transition hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {uploading ? "Subiendo…" : "Subir foto de portada"}
        </button>
        {coverImageUrl && (
          <button
            type="button"
            onClick={() => onChange({ coverImageUrl: null, coverGradient })}
            className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted transition hover:text-danger"
          >
            Quitar foto
          </button>
        )}
        {!coverImageUrl && (
          <button
            type="button"
            onClick={shuffleGradient}
            className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted transition hover:text-text"
          >
            Cambiar degradado
          </button>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
    </div>
  );
}
