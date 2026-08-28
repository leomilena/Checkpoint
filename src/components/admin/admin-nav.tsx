"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/estadisticas", label: "Estadísticas" },
  { href: "/admin/articulos", label: "Artículos" },
  { href: "/admin/revision", label: "Revisión" },
  { href: "/admin/moderacion", label: "Moderación" },
  { href: "/admin/papelera", label: "Papelera" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/boletin", label: "Boletín" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel de administración" className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={pathname === tab.href ? "page" : undefined}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            pathname === tab.href ? "bg-accent text-bg" : "border border-border text-muted hover:text-text"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
