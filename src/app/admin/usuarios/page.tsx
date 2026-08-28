"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "READER" | "WRITER" | "ADMIN";
  banned: boolean;
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserRow[] | null>(null);

  async function load() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateUser(id: string, patch: Partial<Pick<UserRow, "role" | "banned">>) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) load();
    else alert((await res.json()).error ?? "No se ha podido actualizar");
  }

  if (!users) return <p className="text-muted">Cargando…</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="py-2 pr-4">Nombre</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Rol</th>
            <th className="py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.id === session?.user?.id;
            return (
              <tr key={u.id} className="border-b border-border">
                <td className="py-2.5 pr-4 font-medium text-text">{u.name}</td>
                <td className="py-2.5 pr-4 text-muted">{u.email}</td>
                <td className="py-2.5 pr-4">
                  <select
                    value={u.role}
                    disabled={isSelf}
                    onChange={(e) => updateUser(u.id, { role: e.target.value as UserRow["role"] })}
                    className="rounded-lg border border-border bg-surface2 px-2 py-1 text-sm text-text disabled:opacity-50"
                  >
                    <option value="READER">Lector</option>
                    <option value="WRITER">Redactor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="py-2.5">
                  <button
                    type="button"
                    disabled={isSelf}
                    onClick={() => updateUser(u.id, { banned: !u.banned })}
                    className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                      u.banned ? "bg-danger/15 text-danger" : "border border-border text-muted hover:text-text"
                    }`}
                  >
                    {u.banned ? "Reactivar" : "Banear"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
