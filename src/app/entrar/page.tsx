import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Entrar en Checkpoint</h1>
        <p className="mt-1 text-sm text-muted">Accede para comentar, votar y guardar artículos.</p>
      </div>
      <LoginForm />
    </div>
  );
}
