"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Field, inputClass } from "@/components/ui/field";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se ha podido restablecer la contraseña.");
      setStatus("idle");
      return;
    }
    setStatus("done");
    setTimeout(() => router.push("/entrar"), 1500);
  }

  if (!token) {
    return <p className="text-sm text-danger">Enlace no válido. Solicita uno nuevo.</p>;
  }

  if (status === "done") {
    return <p className="text-sm text-accent2">Contraseña actualizada. Redirigiendo…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
      <Field label="Nueva contraseña" htmlFor="password">
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? "Guardando…" : "Restablecer contraseña"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Restablecer contraseña</h1>
      </div>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
