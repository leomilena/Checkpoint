const URL_REGEX = /https?:\/\/\S+/gi;

// Lista mínima de ejemplo; en producción se recomienda un servicio dedicado
// (p. ej. Perspective API) para detección de lenguaje ofensivo real.
const BLOCKLIST = ["viagra", "casino online", "préstamo urgente", "haz click aquí"];

export function looksLikeSpamOrAbuse(body: string): boolean {
  const lower = body.toLowerCase();
  const urlMatches = body.match(URL_REGEX) ?? [];
  if (urlMatches.length >= 3) return true;
  return BLOCKLIST.some((term) => lower.includes(term));
}
