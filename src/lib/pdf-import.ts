import { getDocumentProxy, extractText } from "unpdf";

export type PdfImportResult = { title: string; body: string };

function deriveTitle(rawText: string, fallbackFileName: string): string {
  const firstLine = rawText
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (firstLine && firstLine.length <= 160) return firstLine;

  const base = fallbackFileName.replace(/\.pdf$/i, "").trim();
  return base || "Artículo importado desde PDF";
}

/**
 * Reconstruye párrafos a partir del texto plano que extrae el PDF: una
 * línea suelta suele ser un simple salto de línea visual (no de párrafo),
 * así que se une con espacios; dos o más saltos seguidos sí se tratan como
 * cambio de párrafo real. Es una aproximación razonable, no perfecta — el
 * redactor termina de darle formato (negritas, subtítulos, citas) en el
 * editor después de importar.
 */
function reconstructParagraphs(rawText: string): string {
  const blocks = rawText.split(/\n{2,}/);

  const paragraphs = blocks
    .map((block) =>
      block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" ")
    )
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.join("\n\n");
}

export async function extractArticleFromPdf(
  buffer: Buffer,
  originalFileName: string
): Promise<PdfImportResult> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  if (!text.trim()) {
    throw new Error("No se ha podido extraer texto de este PDF (¿es un PDF escaneado sin texto?)");
  }

  return {
    title: deriveTitle(text, originalFileName),
    body: reconstructParagraphs(text),
  };
}
