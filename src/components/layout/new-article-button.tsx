"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function NewArticleButton() {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user || (user.role !== "WRITER" && user.role !== "ADMIN")) return null;

  return (
    <Link
      href="/redactor/nuevo"
      aria-label="Nuevo artículo"
      className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-bg transition hover:opacity-90 sm:px-4"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">Nuevo artículo</span>
    </Link>
  );
}
