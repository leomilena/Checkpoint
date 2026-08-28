"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Avatar } from "@/components/avatar";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (status === "loading") {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-surface2" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/entrar"
        className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-bg transition hover:opacity-90"
      >
        Entrar
      </Link>
    );
  }

  const { user } = session;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú de usuario"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-transparent p-0.5 hover:border-border"
      >
        <Avatar name={user.name} color={user.avatarColor} imageUrl={user.avatarImageUrl} size={34} />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-card border border-border bg-surface shadow-xl">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-text">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <nav className="py-1 text-sm">
            <Link href="/perfil" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-surface2">
              Mi perfil
            </Link>
            {(user.role === "WRITER" || user.role === "ADMIN") && (
              <Link
                href="/redactor/articulos"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 hover:bg-surface2"
              >
                Mis artículos
              </Link>
            )}
            {user.role === "ADMIN" && (
              <Link href="/admin" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-surface2">
                Panel de administración
              </Link>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full px-4 py-2 text-left text-danger hover:bg-surface2"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
