import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const topics = await Promise.all(
    [
      { name: "Videojuegos", slug: "videojuegos" },
      { name: "Cine", slug: "cine" },
      { name: "Frikada", slug: "frikada" },
    ].map((t) =>
      prisma.topic.upsert({ where: { slug: t.slug }, update: {}, create: t })
    )
  );

  const categories = await Promise.all(
    [
      { name: "Noticia", slug: "noticia", color: "#5FB4FF" },
      { name: "Análisis", slug: "analisis", color: "#FFB238" },
      { name: "Guía", slug: "guia", color: "#3DDC97" },
      { name: "Opinión", slug: "opinion", color: "#C792FF" },
    ].map((c) =>
      prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c })
    )
  );

  const passwordHash = await bcrypt.hash("checkpoint123", 12);

  const marc = await prisma.user.upsert({
    where: { email: "marc@checkpoint.dev" },
    update: {},
    create: {
      name: "Marc",
      email: "marc@checkpoint.dev",
      passwordHash,
      role: "ADMIN",
      avatarColor: "#FFB238",
      bio: "Fundador y administrador de Checkpoint.",
    },
  });

  const laia = await prisma.user.upsert({
    where: { email: "laia@checkpoint.dev" },
    update: {},
    create: {
      name: "Laia Ferrer",
      email: "laia@checkpoint.dev",
      passwordHash,
      role: "WRITER",
      avatarColor: "#3DDC97",
      bio: "Redactora especializada en análisis de videojuegos y cine.",
    },
  });

  const videojuegos = topics.find((t) => t.slug === "videojuegos")!;
  const cine = topics.find((t) => t.slug === "cine")!;
  const analisis = categories.find((c) => c.slug === "analisis")!;
  const noticia = categories.find((c) => c.slug === "noticia")!;

  const existing = await prisma.article.count();
  if (existing === 0) {
    await prisma.article.create({
      data: {
        title: "Bienvenidos a Checkpoint",
        subtitle: "Un nuevo punto de guardado para la cultura friki",
        slug: "bienvenidos-a-checkpoint",
        body:
          "## Empieza la partida\n\nCheckpoint nace como un espacio para hablar de videojuegos, cine y todo lo frikada que hay entremedias.\n\n> Guarda la partida, sigue jugando.",
        topicId: videojuegos.id,
        categoryId: noticia.id,
        status: "PUBLISHED",
        authorId: marc.id,
        publishedAt: new Date(),
        coverGradient: 1,
      },
    });

    await prisma.article.create({
      data: {
        title: "Análisis: el retorno del survival horror",
        subtitle: "Un repaso a lo mejor del género este año",
        slug: "analisis-retorno-survival-horror",
        body:
          "## Una vuelta a los orígenes\n\nEste año el survival horror ha vivido un resurgir notable.\n\n**Nuestra conclusión:** una vuelta a los orígenes con mecánicas modernas.",
        topicId: videojuegos.id,
        categoryId: analisis.id,
        status: "PUBLISHED",
        authorId: laia.id,
        publishedAt: new Date(),
        writerRating: 4.5,
        coverGradient: 3,
      },
    });
  }

  console.log("Seed completo:");
  console.log(`  Admin: marc@checkpoint.dev / checkpoint123`);
  console.log(`  Redactora: laia@checkpoint.dev / checkpoint123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
