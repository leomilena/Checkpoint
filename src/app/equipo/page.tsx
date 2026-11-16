import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/avatar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nuestro equipo",
  description: "Quién está detrás de The Frame: administración y redactores.",
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administración",
  WRITER: "Redactor/a",
};

export default async function EquipoPage() {
  const members = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "WRITER"] }, banned: false },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, bio: true, avatarColor: true, avatarImageUrl: true, role: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-text">Nuestro equipo</h1>
      <p className="mt-3 text-muted">
        La gente que escribe y mantiene The Frame.{" "}
        <Link href="/colabora" className="text-accent hover:underline">
          ¿Quieres unirte?
        </Link>
      </p>

      {members.length === 0 ? (
        <p className="mt-8 text-muted">Todavía no hay nadie en el equipo.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/perfil/${member.id}`}
              className="flex items-start gap-3 rounded-card border border-border bg-surface p-4 transition hover:border-accent"
            >
              <Avatar name={member.name} color={member.avatarColor} imageUrl={member.avatarImageUrl} size={48} />
              <div className="min-w-0">
                <p className="font-semibold text-text">{member.name}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-accent">
                  {ROLE_LABEL[member.role] ?? member.role}
                </p>
                {member.bio && <p className="mt-1 line-clamp-2 text-sm text-muted">{member.bio}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
