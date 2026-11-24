/**
 * Convierte el cuerpo en markdown del editor en un adelanto de texto plano:
 * quita títulos, imágenes, vídeos/tuits incrustados, marcas de negrita/cursiva
 * y citas, y corta por palabra completa al límite de caracteres indicado.
 */
export function excerptFromBody(body: string, maxLength = 220): string {
  const plain = body
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith("![")) return false; // imagen
      if (/^\[(youtube|x)\]\(/.test(trimmed)) return false; // vídeo/tuit incrustado
      return true;
    })
    .join(" ")
    .replace(/^#+\s*/g, "")
    .replace(/>\s*/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;
  const cut = plain.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
