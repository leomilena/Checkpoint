import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { CategoryBar } from "@/components/layout/category-bar";
import { Footer } from "@/components/layout/footer";
import { WelcomeModal } from "@/components/welcome-modal";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/site-url";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// La app es inherentemente dinámica (sesión, base de datos en cada petición);
// forzarlo evita que Next intente prerenderizar estáticamente páginas que
// dependen de hooks de cliente como useSearchParams/useSession en el layout.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "The Frame — videojuegos, cine y frikada",
    template: "%s · The Frame",
  },
  description:
    "The Frame es un medio digital de videojuegos, cine y frikada: noticias, análisis, guías y opinión.",
  alternates: {
    types: { "application/rss+xml": "/rss.xml" },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [topics, categories] = await Promise.all([
    prisma.topic.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <html lang="es" data-theme="dark" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-bg text-text font-body antialiased">
        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>
        <Providers>
          <WelcomeModal />
          <Header />
          <CategoryBar topics={topics} categories={categories} />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
