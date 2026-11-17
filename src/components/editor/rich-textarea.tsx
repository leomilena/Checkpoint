"use client";

import { useRef, useState } from "react";

async function uploadFile(file: File, kind: "inline"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "No se ha podido subir la imagen");
  return data.url as string;
}

type PendingPrompt = { kind: "youtube" | "x" } | { kind: "caption"; url: string } | null;

export function RichTextarea({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<PendingPrompt>(null);
  const [promptValue, setPromptValue] = useState("");

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

  function closePrompt() {
    setPendingPrompt(null);
    setPromptValue("");
  }

  function confirmPrompt() {
    if (!pendingPrompt) return;
    const trimmed = promptValue.trim();

    if (pendingPrompt.kind === "youtube") {
      if (trimmed) insertAtCursor(`[youtube](${trimmed})`);
    } else if (pendingPrompt.kind === "x") {
      if (trimmed) insertAtCursor(`[x](${trimmed})`);
    } else if (pendingPrompt.kind === "caption") {
      insertAtCursor(`![${trimmed}](${pendingPrompt.url})`);
    }
    closePrompt();
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "inline");
      setPromptValue("");
      setPendingPrompt({ kind: "caption", url });
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se ha podido subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent";

  const PROMPT_LABELS: Record<NonNullable<PendingPrompt>["kind"], string> = {
    youtube: "Pega el enlace del vídeo de YouTube",
    x: "Pega el enlace de la publicación de X",
    caption: "Pie de foto (opcional, se mostrará debajo de la imagen)",
  };

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
        <button
          type="button"
          aria-label="Insertar vídeo de YouTube"
          title="Insertar vídeo de YouTube"
          onClick={() => {
            setPromptValue("");
            setPendingPrompt({ kind: "youtube" });
          }}
          className={buttonClass}
        >
          ▶
        </button>
        <button
          type="button"
          aria-label="Insertar publicación de X"
          title="Insertar publicación de X"
          onClick={() => {
            setPromptValue("");
            setPendingPrompt({ kind: "x" });
          }}
          className={buttonClass}
        >
          𝕏
        </button>
      </div>

      {pendingPrompt && (
        <div className="mb-2 flex flex-col gap-2 rounded-lg border border-accent bg-surface2 p-3 sm:flex-row sm:items-center">
          <label className="flex-1 text-xs text-muted">
            {PROMPT_LABELS[pendingPrompt.kind]}
            <input
              autoFocus
              type="text"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmPrompt();
                } else if (e.key === "Escape") {
                  closePrompt();
                }
              }}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmPrompt}
              className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-bg transition hover:opacity-90"
            >
              Insertar
            </button>
            <button
              type="button"
              onClick={closePrompt}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition hover:text-text"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
