"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputClass } from "@/components/ui/field";
import { RichTextarea } from "@/components/editor/rich-textarea";
import { CoverUploader } from "@/components/editor/cover-uploader";
import { WriterRatingInput } from "@/components/editor/writer-rating-input";
import { CoauthorPicker } from "@/components/editor/coauthor-picker";
import { renderArticleBody } from "@/lib/render-body";
import { articleSupportsRating, ratingVerb } from "@/lib/rating";

type Option = { id: string; name: string; slug: string; color?: string };

type InitialArticle = {
  id: string;
  title: string;
  subtitle: string | null;
  body: string;
  topicId: string;
  categoryId: string;
  coverImageUrl: string | null;
  coverGradient: number;
  writerRating: number | null;
  coauthorIds: string[];
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "TRASHED";
  reviewNote: string | null;
  slug: string;
};

export function ArticleEditorForm({
  topics,
  categories,
  coauthorCandidates,
  currentUserId,
  currentUserRole,
  initialArticle,
}: {
  topics: Option[];
  categories: Option[];
  coauthorCandidates: { id: string; name: string }[];
  currentUserId: string;
  currentUserRole: "WRITER" | "ADMIN";
  initialArticle?: InitialArticle;
}) {
  const router = useRouter();

  const [articleId, setArticleId] = useState<string | null>(initialArticle?.id ?? null);
  const [title, setTitle] = useState(initialArticle?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialArticle?.subtitle ?? "");
  const [body, setBody] = useState(initialArticle?.body ?? "");
  const [topicId, setTopicId] = useState(initialArticle?.topicId ?? topics[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(initialArticle?.categoryId ?? categories[0]?.id ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialArticle?.coverImageUrl ?? null);
  const [coverGradient, setCoverGradient] = useState(initialArticle?.coverGradient ?? 0);
  const [writerRating, setWriterRating] = useState<number | null>(initialArticle?.writerRating ?? null);
  const [coauthorIds, setCoauthorIds] = useState<string[]>(initialArticle?.coauthorIds ?? []);
  const [status, setStatus] = useState(initialArticle?.status ?? "DRAFT");
  const [reviewNote] = useState(initialArticle?.reviewNote ?? null);
  const [slug, setSlug] = useState(initialArticle?.slug ?? "");

  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(initialArticle ? new Date() : null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const lastSavedSnapshot = useRef<string>(
    JSON.stringify({ title, subtitle, body, topicId, categoryId, coverImageUrl, coverGradient, writerRating, coauthorIds })
  );

  const topic = topics.find((t) => t.id === topicId);
  const category = categories.find((c) => c.id === categoryId);
  const showRating = topic && category ? articleSupportsRating({ slug: category.slug }, { slug: topic.slug }) : false;

  const buildPayload = useCallback(
    () => ({
      title,
      subtitle,
      body,
      topicId,
      categoryId,
      coverImageUrl,
      coverGradient,
      writerRating: showRating ? writerRating : null,
      coauthorIds,
    }),
    [title, subtitle, body, topicId, categoryId, coverImageUrl, coverGradient, writerRating, coauthorIds, showRating]
  );

  const save = useCallback(
    async (manual = false) => {
      if (!title.trim()) return;
      setSaving(true);
      setError(null);
      try {
        const payload = buildPayload();
        if (!articleId) {
          const res = await fetch("/api/articles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error((await res.json()).error ?? "Error al guardar");
          const data = await res.json();
          setArticleId(data.article.id);
          setSlug(data.article.slug);
        } else {
          const res = await fetch(`/api/articles/${articleId}?autosave=${manual ? "0" : "1"}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error((await res.json()).error ?? "Error al guardar");
        }
        lastSavedSnapshot.current = JSON.stringify(payload);
        setLastSavedAt(new Date());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      } finally {
        setSaving(false);
      }
    },
    [articleId, title, buildPayload]
  );

  // Autoguardado cada ~8 segundos si hay cambios sin guardar.
  useEffect(() => {
    const interval = setInterval(() => {
      const snapshot = JSON.stringify(buildPayload());
      if (snapshot !== lastSavedSnapshot.current && title.trim() && status !== "PUBLISHED") {
        save(false);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [buildPayload, save, title, status]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSavedAt) setSecondsAgo(Math.floor((Date.now() - lastSavedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSavedAt]);

  async function submitReview() {
    await save(true);
    if (!articleId) return;
    const res = await fetch(`/api/articles/${articleId}/submit-review`, { method: "POST" });
    if (!res.ok) {
      setError((await res.json()).error ?? "No se ha podido enviar a revisión");
      return;
    }
    router.push("/redactor/articulos");
  }

  async function publishNow() {
    await save(true);
    if (!articleId) return;
    const res = await fetch(`/api/articles/${articleId}/publish`, { method: "POST" });
    if (!res.ok) {
      setError((await res.json()).error ?? "No se ha podido publicar");
      return;
    }
    router.push(`/articulo/${slug}`);
  }

  async function saveDraftAndExit() {
    await save(true);
    router.push("/redactor/articulos");
  }

  const autosaveLabel = saving
    ? "Guardando…"
    : lastSavedAt
      ? `Autoguardado hace ${secondsAgo < 5 ? "unos segundos" : `${secondsAgo}s`}`
      : "Sin guardar todavía";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr,1fr]">
      <div>
        {reviewNote && status === "DRAFT" && (
          <div className="mb-4 rounded-card border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            <strong>Nota del administrador:</strong> {reviewNote}
          </div>
        )}

        <Field label="Título" htmlFor="title">
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${inputClass} font-display text-lg font-semibold`}
            placeholder="Título del artículo"
          />
        </Field>

        <div className="h-4" />

        <Field label="Subtítulo (opcional)" htmlFor="subtitle">
          <input
            id="subtitle"
            value={subtitle ?? ""}
            onChange={(e) => setSubtitle(e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-text">Cuerpo del artículo</span>
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="text-sm font-medium text-accent hover:underline"
          >
            {preview ? "Volver a editar" : "Vista previa"}
          </button>
        </div>

        <div className="mt-2">
          {preview ? (
            <div className="prose-checkpoint rounded-card border border-border bg-surface p-5">
              <h1 className="font-display text-2xl font-bold text-text">{title || "Sin título"}</h1>
              {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
              <div className="mt-4">{renderArticleBody(body)}</div>
            </div>
          ) : (
            <RichTextarea value={body} onChange={setBody} />
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-5">
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="mb-3 font-mono text-xs text-muted">{autosaveLabel}</p>
          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => save(true)}
              disabled={saving || !title.trim()}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-accent disabled:opacity-50"
            >
              Guardar borrador
            </button>
            {status !== "PUBLISHED" && currentUserRole === "WRITER" && (
              <button
                type="button"
                onClick={submitReview}
                disabled={saving || !title.trim()}
                className="rounded-full bg-accent2 px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-50"
              >
                Enviar a revisión
              </button>
            )}
            {status !== "PUBLISHED" && currentUserRole === "ADMIN" && (
              <button
                type="button"
                onClick={publishNow}
                disabled={saving || !title.trim()}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-50"
              >
                Publicar
              </button>
            )}
            <button
              type="button"
              onClick={saveDraftAndExit}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:text-text"
            >
              Guardar y salir
            </button>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-semibold text-text">Portada</p>
          <CoverUploader
            coverImageUrl={coverImageUrl}
            coverGradient={coverGradient}
            onChange={({ coverImageUrl, coverGradient }) => {
              setCoverImageUrl(coverImageUrl);
              setCoverGradient(coverGradient);
            }}
          />
        </div>

        <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4">
          <Field label="Temática" htmlFor="topic">
            <select
              id="topic"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className={inputClass}
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Categoría" htmlFor="category">
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          {showRating && topic && (
            <WriterRatingInput value={writerRating} onChange={setWriterRating} verb={ratingVerb(topic.slug)} />
          )}

          <CoauthorPicker
            candidates={coauthorCandidates}
            selected={coauthorIds}
            onChange={setCoauthorIds}
            excludeId={currentUserId}
          />
        </div>
      </aside>
    </div>
  );
}
