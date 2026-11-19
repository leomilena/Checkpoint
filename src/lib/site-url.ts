/**
 * URL base del sitio para construir enlaces absolutos (sitemap, RSS, emails,
 * robots.txt...). Se usa `.trim()` y se quita la barra final porque un
 * espacio o salto de línea de más al final de la variable de entorno
 * NEXTAUTH_URL —fácil de colar sin que se note al pegarla en Vercel— rompe
 * cualquier URL construida por concatenación simple (aunque `new URL()` lo
 * tolere silenciosamente, `${baseUrl}/ruta` no).
 */
export function getBaseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").trim().replace(/\/+$/, "");
}
