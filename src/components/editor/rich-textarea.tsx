"use client";

import { useRef, useState } from "react";

async function uploadFile(file: File, kind: "inline"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("No se ha podido subir la imagen");
  const data = await res.json();
  return data.url as string;
}

export function RichTextarea({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function wrapSelection(prefix: string, suffix: string = prefix) {
    const textarea = ref.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || "texto";
    const next = value.slice(0, selectionStart) + prefix + selected + suffix + value.slice(selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = selectionStart + prefix.length;
      textarea.selectionEnd = selectionStart + prefix.length + selected.length;
    });
  }

  function insertLinePrefix(prefix: string) {
    const textarea = ref.current;
    if (!textarea) return;
    const { selectionStart } = textarea;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = selectionStart + prefix.length;
    });
  }

  function insertAtCursor(text: string) {
    const textarea = ref.current;
    if (!textarea) {
      onChange(`${value}\n\n${text}\n\n`);
      return;
    }
    const { selectionStart, selectionEnd } = textarea;
    const next = `${value.slice(0, selectionStart)}\n\n${text}\n\n${value.slice(selectionEnd)}`;
    onChange(next);
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "inline");
      insertAtCursor(`![${file.name.replace(/\.[a-z0-9]+$/i, "")}](${url})`);
    } catch {
      alert("No se ha podido subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent";

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Formato del texto">
        <button type="button" aria-label="Negrita" title="Negrita" onClick={() => wrapSelection("**")} className={buttonClass}>
          B
        </button>
        <button type="button" aria-label="Cursiva" title="Cursiva" onClick={() => wrapSelection("*")} className={`${buttonClass} italic`}>
          I
        </button>
        <button
          type="button"
          aria-label="Subtítulo"
          title="Subtítulo"
          onClick={() => insertLinePrefix("## ")}
          className={buttonClass}
        >
          H2
        </button>
        <button
          type="button"
          aria-label="Cita"
          title="Cita"
          onClick={() => insertLinePrefix("> ")}
          className={buttonClass}
        >
          &ldquo;
        </button>
        <button
          type="button"
          aria-label="Insertar imagen"
          title="Insertar imagen"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={buttonClass}
        >
          {uploading ? "…" : "🖼"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickImage} className="hidden" />
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={18}
        placeholder="Escribe el cuerpo del artículo… Usa ## para subtítulos, **negrita**, *cursiva* y > para citas."
        className="w-full rounded-lg border border-border bg-surface2 px-4 py-3 text-sm leading-relaxed text-text placeholder:text-muted focus:outline-none focus:border-accent"
      />
    </div>
  );
}
