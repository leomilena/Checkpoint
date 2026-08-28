"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";

type CommentUser = { id: string; name: string; avatarColor: string; avatarImageUrl: string | null };
type CommentItem = {
  id: string;
  body: string;
  createdAt: string;
  user: CommentUser;
  replies: CommentItem[];
};

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(date)
  );
}

function CommentRow({
  comment,
  articleId,
  locked,
  canModerate,
  onReply,
  onReported,
  onDeleted,
  isReply = false,
}: {
  comment: CommentItem;
  articleId: string;
  locked: boolean;
  canModerate: boolean;
  onReply: (parentId: string, body: string) => Promise<void>;
  onReported: (id: string) => void;
  onDeleted: (id: string) => void;
  isReply?: boolean;
}) {
  const { data: session } = useSession();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setBusy(true);
    await onReply(comment.id, replyText.trim());
    setReplyText("");
    setReplying(false);
    setBusy(false);
  }

  async function report() {
    const res = await fetch(`/api/comments/${comment.id}/report`, { method: "POST" });
    if (res.ok) onReported(comment.id);
  }

  async function remove() {
    if (!confirm("¿Eliminar este comentario? Podrá restaurarse desde la papelera durante 30 días.")) return;
    const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
    if (res.ok) onDeleted(comment.id);
  }

  return (
    <div className={isReply ? "ml-10 mt-3" : ""}>
      <div className="flex gap-3">
        <Avatar name={comment.user.name} color={comment.user.avatarColor} imageUrl={comment.user.avatarImageUrl} size={32} />
        <div className="flex-1">
          <div className="rounded-card border border-border bg-surface p-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-semibold text-text">{comment.user.name}</span>
              <span className="font-mono text-[11px] text-muted">{formatDateTime(comment.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-text">{comment.body}</p>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted">
            {!isReply && !locked && session?.user && (
              <button type="button" onClick={() => setReplying((v) => !v)} className="hover:text-accent">
                Responder
              </button>
            )}
            {session?.user && (
              <button type="button" onClick={report} className="hover:text-danger">
                Reportar
              </button>
            )}
            {canModerate && (
              <button type="button" onClick={remove} className="hover:text-danger">
                Eliminar
              </button>
            )}
          </div>

          {replying && (
            <form onSubmit={submitReply} className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe una respuesta…"
                className="flex-1 rounded-full border border-border bg-surface2 px-3 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-bg disabled:opacity-60"
              >
                Enviar
              </button>
            </form>
          )}

          {comment.replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              articleId={articleId}
              locked={locked}
              canModerate={canModerate}
              onReply={onReply}
              onReported={onReported}
              onDeleted={onDeleted}
              isReply
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CommentsSection({
  articleId,
  initialLocked,
  canLock,
}: {
  articleId: string;
  initialLocked: boolean;
  canLock: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(initialLocked);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  const isAdmin = session?.user?.role === "ADMIN";

  async function load() {
    const res = await fetch(`/api/articles/${articleId}/comments`);
    const data = await res.json();
    setComments(data.comments ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  async function postComment(parentId: string | null, body: string) {
    if (!session?.user) {
      router.push(`/entrar?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const res = await fetch(`/api/articles/${articleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, parentId }),
    });
    if (res.ok) await load();
  }

  async function submitTopLevel(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await postComment(null, text.trim());
    setText("");
  }

  async function toggleLock() {
    const res = await fetch(`/api/articles/${articleId}/lock-comments`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLocked(data.commentsLocked);
    }
  }

  function handleDeleted(id: string) {
    setComments((prev) =>
      prev
        .filter((c) => c.id !== id)
        .map((c) => ({ ...c, replies: c.replies.filter((r) => r.id !== id) }))
    );
  }

  const totalCount = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  return (
    <section aria-label="Comentarios" className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-text">Comentarios ({totalCount})</h2>
        {canLock && (
          <button
            type="button"
            onClick={toggleLock}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text"
          >
            {locked ? "Desbloquear comentarios" : "Bloquear comentarios"}
          </button>
        )}
      </div>

      {locked && (
        <p className="mb-4 rounded-card border border-border bg-surface2 px-4 py-2 text-sm text-muted">
          Los comentarios de este artículo están bloqueados. Solo puedes ver los existentes.
        </p>
      )}

      {!locked && (
        <form onSubmit={submitTopLevel} className="mb-6 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={session?.user ? "Escribe un comentario…" : "Inicia sesión para comentar"}
            disabled={!session?.user}
            className="flex-1 rounded-full border border-border bg-surface2 px-4 py-2 text-sm text-text focus:outline-none focus:border-accent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!session?.user}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-60"
          >
            Comentar
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-muted">Cargando comentarios…</p>
      ) : comments.length === 0 ? (
        <p className="text-muted">Sé el primero en comentar.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {comments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              articleId={articleId}
              locked={locked}
              canModerate={isAdmin}
              onReply={postComment}
              onReported={(id) => setReportedIds((prev) => new Set(prev).add(id))}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
      {reportedIds.size > 0 && (
        <p className="mt-3 text-xs text-accent2" role="status">
          Gracias, hemos recibido tu reporte.
        </p>
      )}
    </section>
  );
}
