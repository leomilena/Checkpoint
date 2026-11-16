import { getDocumentProxy, extractTextItems, getResolvedPDFJS, type StructuredTextItem } from "unpdf";
import sharp from "sharp";
import { uploadImage } from "@/lib/storage";

type PDFDocumentProxy = Awaited<ReturnType<typeof getDocumentProxy>>;

export type PdfImportResult = { title: string; body: string };

// Una imagen colocada más pequeña que esto (en puntos de página, no en
// píxeles del archivo) es casi siempre un icono, viñeta o adorno, no una
// foto del artículo.
const MIN_PLACED_SIZE = 40;
// Si una imagen cubre casi toda la página, es un fondo o plantilla de
// diseño (típico de PDFs exportados de Canva), no una foto suelta.
const BACKGROUND_COVERAGE_RATIO = 0.92;

function deriveTitle(firstParagraph: string, fallbackFileName: string): string {
  const trimmed = firstParagraph.trim();
  if (trimmed && trimmed.length <= 160) return trimmed;

  const base = fallbackFileName.replace(/\.pdf$/i, "").trim();
  return base || "Artículo importado desde PDF";
}

type Line = { text: string; y: number; fontSize: number };

type PositionedImage = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  channels: 1 | 3 | 4;
  topY: number;
  placedWidth: number;
  placedHeight: number;
};

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
 * Agrupa un tramo de líneas consecutivas (sin fotos de por medio) en
 * párrafos, a partir del hueco vertical real entre ellas, no de si hay una
 * línea en blanco en el texto plano. Un PDF no tiene concepto de "párrafo":
 * solo líneas colocadas en coordenadas. Si el salto entre una línea y la
 * siguiente es mayor de lo normal para ese tamaño de letra, es que en el
 * documento original había espaciado de párrafo o una línea en blanco.
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

type Matrix = [number, number, number, number, number, number];

function multiplyMatrix(m1: Matrix, m2: Matrix): Matrix {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + b1 * c2,
    a1 * b2 + b1 * d2,
    c1 * a2 + d1 * c2,
    c1 * b2 + d1 * d2,
    e1 * a2 + f1 * c2 + e2,
    e1 * b2 + f1 * d2 + f2,
  ];
}

/**
 * Recorre la lista de operaciones de dibujo de la página (la misma
 * representación interna que usa pdf.js para pintarla) para encontrar cada
 * imagen incrustada junto con el rectángulo real donde se coloca en la
 * página — algo que las funciones de alto nivel de unpdf no exponen. Las
 * imágenes en PDF siempre se pintan en el cuadrado unidad [0,1]x[0,1] del
 * espacio de coordenadas vigente en ese punto, así que basta con seguir la
 * matriz de transformación actual (pila de `q`/`Q`/`cm`) y aplicarla a las
 * esquinas de ese cuadrado.
 */
async function extractPositionedImages(pdf: PDFDocumentProxy, pageNumber: number): Promise<PositionedImage[]> {
  const page = await pdf.getPage(pageNumber);
  const operatorList = await page.getOperatorList();
  const { OPS } = await getResolvedPDFJS();

  let ctm: Matrix = [1, 0, 0, 1, 0, 0];
  const stack: Matrix[] = [];
  const results: PositionedImage[] = [];

  for (let i = 0; i < operatorList.fnArray.length; i++) {
    const fn = operatorList.fnArray[i];
    const args = operatorList.argsArray[i];

    if (fn === OPS.save) {
      stack.push(ctm);
    } else if (fn === OPS.restore) {
      ctm = stack.pop() ?? ctm;
    } else if (fn === OPS.transform) {
      // El operador `cm` compone su matriz CON la CTM vigente (M ∘ CTM), no
      // al revés: aplicar esto en el orden contrario multiplica la
      // traslación acumulada por la escala del `cm` siguiente, lo que
      // descoloca por completo cualquier imagen tras más de una `cm`.
      ctm = multiplyMatrix(args as Matrix, ctm);
    } else if (fn === OPS.paintImageXObject || fn === OPS.paintImageXObjectRepeat) {
      const imageKey = args[0];
      const image = await new Promise<any>((resolve) =>
        (typeof imageKey === "string" && imageKey.startsWith("g_") ? page.commonObjs : page.objs).get(
          imageKey,
          resolve
        )
      );
      if (!image?.data || !image.width || !image.height) continue;

      const channels = image.data.length / (image.width * image.height);
      if (![1, 3, 4].includes(channels)) continue;

      const corners = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ].map(([x, y]) => ({
        x: ctm[0] * x + ctm[2] * y + ctm[4],
        y: ctm[1] * x + ctm[3] * y + ctm[5],
      }));
      const xs = corners.map((c) => c.x);
      const ys = corners.map((c) => c.y);
      const placedWidth = Math.max(...xs) - Math.min(...xs);
      const placedHeight = Math.max(...ys) - Math.min(...ys);

      results.push({
        data: image.data,
        width: image.width,
        height: image.height,
        channels: channels as 1 | 3 | 4,
        topY: Math.max(...ys),
        placedWidth,
        placedHeight,
      });
    }
  }

  return results;
}

type Block = { kind: "line"; line: Line } | { kind: "image"; image: PositionedImage };

/**
 * Entremezcla las líneas de texto y las imágenes de una página por su
 * posición vertical real, para que una foto que en el documento original
 * iba entre dos párrafos acabe en el artículo también entre esos dos
 * párrafos, en vez de todas las fotos amontonadas al final de la página.
 */
function interleaveByPosition(
  lines: Line[],
  images: PositionedImage[]
): Block[] {
  const blocks: Block[] = [
    ...lines.map((line): Block => ({ kind: "line", line })),
    ...images.map((image): Block => ({ kind: "image", image })),
  ];
  blocks.sort((a, b) => {
    const ay = a.kind === "line" ? a.line.y : a.image.topY;
    const by = b.kind === "line" ? b.line.y : b.image.topY;
    return by - ay;
  });
  return blocks;
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

    let positionedImages: PositionedImage[] = [];
    let pageWidth = 0;
    let pageHeight = 0;
    try {
      const page = await pdf.getPage(pageNumber);
      const [x0, y0, x1, y1] = page.view;
      pageWidth = x1 - x0;
      pageHeight = y1 - y0;
      positionedImages = await extractPositionedImages(pdf, pageNumber);
    } catch (extractImagesError) {
      console.error(`No se han podido extraer imágenes de la página ${pageNumber} del PDF:`, extractImagesError);
    }

    const usableImages = positionedImages.filter((image) => {
      if (image.placedWidth < MIN_PLACED_SIZE || image.placedHeight < MIN_PLACED_SIZE) return false;
      if (
        pageWidth > 0 &&
        pageHeight > 0 &&
        image.placedWidth >= pageWidth * BACKGROUND_COVERAGE_RATIO &&
        image.placedHeight >= pageHeight * BACKGROUND_COVERAGE_RATIO
      ) {
        return false;
      }
      return true;
    });

    const pageBlocks = interleaveByPosition(lines, usableImages);

    let pendingLines: Line[] = [];
    const flushParagraphs = () => {
      if (pendingLines.length === 0) return;
      for (const paragraph of groupIntoParagraphs(pendingLines)) {
        if (!firstParagraph) firstParagraph = paragraph;
        bodyBlocks.push(paragraph);
      }
      pendingLines = [];
    };

    for (const block of pageBlocks) {
      if (block.kind === "line") {
        pendingLines.push(block.line);
        continue;
      }

      flushParagraphs();
      try {
        const png = await sharp(Buffer.from(block.image.data), {
          raw: { width: block.image.width, height: block.image.height, channels: block.image.channels },
        })
          .png()
          .toBuffer();
        const url = await uploadImage(png, `pdf-pagina-${pageNumber}.png`, "inline");
        bodyBlocks.push(`![Imagen importada del PDF](${url})`);
      } catch (imageError) {
        console.error(`No se ha podido procesar una imagen de la página ${pageNumber} del PDF:`, imageError);
      }
    }
    flushParagraphs();
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
