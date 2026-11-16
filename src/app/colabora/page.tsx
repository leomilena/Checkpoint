import type { Metadata } from "next";
import { WriterApplicationForm } from "@/components/writer-application-form";

export const metadata: Metadata = {
  title: "Quiero ser redactor",
  description: "Únete al equipo de The Frame: buscamos gente a la que le apasionen los videojuegos, el cine y la frikada.",
};

export default function ColaboraPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-text">Escribe con nosotros</h1>
      <p className="mt-3 text-muted">
        The Frame es un medio hecho por y para gente a la que le flipan los videojuegos, el cine y
        todo lo frikada que hay entremedias. Buscamos redactores con ganas de escribir —
        reseñas, noticias, análisis, lo que se te ocurra.
      </p>
      <ul className="mt-4 flex flex-col gap-2 text-sm text-muted">
        <li>📝 No es un trabajo remunerado: es un proyecto hecho por afición.</li>
        <li>🎮 Tú eliges sobre qué escribir, con la temática y el ritmo que quieras.</li>
        <li>🚀 Firmas tus artículos con tu nombre y tu propio perfil en la web.</li>
      </ul>
      <p className="mt-4 text-sm text-muted">
        Rellena el formulario y te contestaremos por email. Si lo prefieres, también puedes
        escribirnos directamente a{" "}
        <a href="mailto:caneloncontacts@gmail.com" className="text-accent hover:underline">
          caneloncontacts@gmail.com
        </a>
        .
      </p>

      <div className="mt-6">
        <WriterApplicationForm />
      </div>
    </div>
  );
}
