"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LikeFavoriteBar({
  articleId,
  initialLiked,
  initialLikeCount,
  initialFavorited,
  articleTitle,
}: {
  articleId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialFavorited: boolean;
  articleTitle: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [shareOpen, setShareOpen] = useState(false);

  function requireAuth() {
    if (!session?.user) {
      router.push(`/entrar?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return false;
    }
    return true;
  }

  async function toggleLike() {
    if (!requireAuth()) return;
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    const res = await fetch(`/api/articles/${articleId}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
    }
  }

  async function toggleFavorite() {
    if (!requireAuth()) return;
    setFavorited((v) => !v);
    const res = await fetch(`/api/articles/${articleId}/favorite`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setFavorited(data.favorited);
    }
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  async function copyLink() {
    await navigator.clipboard.writeText(currentUrl).catch(() => {});
    setShareOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={liked ? "Quitar me gusta" : "Me gusta"}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
          liked ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:text-text"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} aria-hidden="true">
          <path
            d="M12 20.5s-7.5-4.6-9.8-9.2C.6 7.7 2.6 4 6.2 4c2 0 3.6 1 5.8 3.5C14.2 5 15.8 4 17.8 4c3.6 0 5.6 3.7 4 7.3-2.3 4.6-9.8 9.2-9.8 9.2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {likeCount}
      </button>

      <button
        type="button"
        onClick={toggleFavorite}
        aria-pressed={favorited}
        aria-label={favorited ? "Quitar de guardados" : "Guardar para más tarde"}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
          favorited ? "border-accent2 bg-accent2/10 text-accent2" : "border-border text-muted hover:text-text"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} aria-hidden="true">
          <path d="M6 3h12v18l-6-4-6 4V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        {favorited ? "Guardado" : "Guardar"}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShareOpen((v) => !v)}
          aria-label="Compartir"
          aria-expanded={shareOpen}
          className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted transition hover:text-text"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="18" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="18" cy="19" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            <path d="m8.1 10.8 7.8-4.4M8.1 13.2l7.8 4.4" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          Compartir
        </button>
        {shareOpen && (
          <div className="absolute left-0 z-30 mt-2 w-52 overflow-hidden rounded-card border border-border bg-surface shadow-xl">
            <button
              type="button"
              onClick={copyLink}
              className="block w-full px-4 py-2.5 text-left text-sm text-text hover:bg-surface2"
            >
              Copiar enlace
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${articleTitle} ${currentUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 text-sm text-text hover:bg-surface2"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 text-sm text-text hover:bg-surface2"
            >
              X (Twitter)
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
