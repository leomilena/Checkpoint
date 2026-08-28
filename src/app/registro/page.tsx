import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted">Únete para comentar, votar y guardar tus artículos favoritos.</p>
      </div>
      <RegisterForm />
    </div>
  );
}
