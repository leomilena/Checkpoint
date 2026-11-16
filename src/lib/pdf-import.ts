import { getDocumentProxy, extractTextItems, extractImages, type StructuredTextItem } from "unpdf";
import sharp from "sharp";
import { uploadImage } from "@/lib/storage";

export type PdfImportResult = { title: string; body: string };

// Imágenes más pequeñas que esto casi siempre son viñetas, logos o
// decoración de plantilla, no fotos del artículo.
const MIN_IMAGE_DIMENSION = 100;

function deriveTitle(firstParagraph: string, fallbackFileName: string): string {
  const trimmed = firstParagraph.trim();
  if (trimmed && trimmed.length <= 160) return trimmed;

  const base = fallbackFileName.replace(/\.pdf$/i, "").trim();
  return base || "Artículo importado desde PDF";
}

type Line = { text: string; y: number; fontSize: number };

/**
 * Reconstruye las líneas visuales de una página a partir de los items de
 * texto. `hasEOL` lo marca pdf.js por cada línea del documento (incluidas
 * las que son simplemente el ajuste de línea de un párrafo largo), así que
 * aquí solo se agrupa texto en líneas — separar párrafos de verdad se hace
 * después mirando la posición.
 */
function groupIntoLines(items: StructuredTextItem[]): Line[] {
  const lines: Line[] = [];
  let buffer = "";
  let y = 0;
  let fontSize = 0;

  for (const item of items) {
    if (buffer === "") y = item.y;
    fontSize = Math.max(fontSize, item.fontSize || 0);
    buffer += item.str;
    if (item.hasEOL) {
      const text = buffer.trim();
      if (text) lines.push({ text, y, fontSize: fontSize || 12 });
      buffer = "";
      fontSize = 0;
    }
  }
  const trailing = buffer.trim();
  if (trailing) lines.push({ text: trailing, y, fontSize: fontSize || 12 });
  return lines;
}

/**
 * Agrupa líneas en párrafos a partir del hueco vertical real entre ellas,
 * no de si hay una línea en blanco en el texto plano. Un PDF no tiene
 * concepto de "párrafo": solo líneas colocadas en coordenadas. Si el salto
 * entre una línea y la siguiente es mayor de lo normal para ese tamaño de
 * letra, es que en el documento original había espaciado de párrafo o una
 * línea en blanco de verdad.
 */
function groupIntoParagraphs(lines: Line[]): string[] {
  const paragraphs: string[] = [];
  let current: string[] = [];

  lines.forEach((line, i) => {
    const prev = lines[i - 1];
    if (prev) {
      const gap = Math.abs(prev.y - line.y);
      const expectedLineHeight = (prev.fontSize || 12) * 1.4;
      if (gap > expectedLineHeight * 1.35 && current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
    }
    current.push(line.text);
  });

  if (current.length > 0) paragraphs.push(current.join(" "));
  return paragraphs;
}

export async function extractArticleFromPdf(
  buffer: Buffer,
  originalFileName: string
): Promise<PdfImportResult> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, items } = await extractTextItems(pdf);

  const bodyBlocks: string[] = [];
  let firstParagraph = "";

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const pageNumber = pageIndex + 1;
    const lines = groupIntoLines(items[pageIndex] ?? []);
    const paragraphs = groupIntoParagraphs(lines);

    if (!firstParagraph) {
      firstParagraph = paragraphs.find((p) => p.trim().length > 0) ?? "";
    }
    bodyBlocks.push(...paragraphs);

    try {
      const images = await extractImages(pdf, pageNumber);
      for (const image of images) {
        if (image.width < MIN_IMAGE_DIMENSION || image.height < MIN_IMAGE_DIMENSION) continue;
        try {
          const png = await sharp(Buffer.from(image.data), {
            raw: { width: image.width, height: image.height, channels: image.channels },
          })
            .png()
            .toBuffer();
          const url = await uploadImage(png, `pdf-pagina-${pageNumber}.png`, "inline");
          bodyBlocks.push(`![Imagen importada del PDF](${url})`);
        } catch (imageError) {
          console.error(`No se ha podido procesar una imagen de la página ${pageNumber} del PDF:`, imageError);
        }
      }
    } catch (extractImagesError) {
      console.error(`No se han podido extraer imágenes de la página ${pageNumber} del PDF:`, extractImagesError);
    }
  }

  const body = bodyBlocks.filter((b) => b.trim().length > 0).join("\n\n");

  if (!body.trim()) {
    throw new Error("No se ha podido extraer texto de este PDF (¿es un PDF escaneado sin texto?)");
  }

  return {
    title: deriveTitle(firstParagraph, originalFileName),
    body,
  };
}
