import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isWriterOrAdmin } from "@/lib/permissions";
import { generateUniqueSlug } from "@/lib/slug";
import { extractArticleFromPdf } from "@/lib/pdf-import";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isWriterOrAdmin(user)) {
    return NextResponse.json({ error: "No tienes permiso para crear artículos" }, { status: 403 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo no válido" }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "El archivo debe ser un PDF" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "El PDF supera los 20MB" }, { status: 400 });
  }

  const [topic, category] = await Promise.all([
    prisma.topic.findFirst({ orderBy: { name: "asc" } }),
    prisma.category.findFirst({ orderBy: { name: "asc" } }),
  ]);
  if (!topic || !category) {
    return NextResponse.json(
      { error: "Crea antes al menos una temática y una categoría desde el panel de administración" },
      { status: 409 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { title, body } = await extractArticleFromPdf(buffer, file.name);
    const slug = await generateUniqueSlug(title);

    const article = await prisma.article.create({
      data: {
        title,
        body,
        slug,
        topicId: topic.id,
        categoryId: category.id,
        authorId: user.id,
        status: "DRAFT",
        coverGradient: Math.floor(Math.random() * 6),
        lastAutosaveAt: new Date(),
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error("Error al importar PDF:", error);
    const message = error instanceof Error ? error.message : "No se ha podido importar el PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
