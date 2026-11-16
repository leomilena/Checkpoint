import Image from "next/image";
import React from "react";

const YOUTUBE_ID_PATTERNS = [
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

export function extractYouTubeId(url: string): string | null {
  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = pattern.exec(url);
    if (match) return match[1];
  }
  return null;
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[2] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b-${i}`}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      nodes.push(<em key={`${keyPrefix}-i-${i}`}>{match[3]}</em>);
    }
    lastIndex = regex.lastIndex;
    i += 1;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/**
 * Renderiza el subconjunto de markdown que produce el editor enriquecido:
 * ## títulos, **negrita**, *cursiva*, > citas e imágenes ![alt](url).
 * Se parsea manualmente (sin dangerouslySetInnerHTML) para evitar inyección de HTML.
 */
export function renderArticleBody(body: string): React.ReactNode {
  const lines = body.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let quoteBuffer: string[] = [];

  function flushParagraph(key: string) {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(" ").trim();
    if (text) blocks.push(<p key={key}>{renderInline(text, key)}</p>);
    paragraphBuffer = [];
  }

  function flushQuote(key: string) {
    if (quoteBuffer.length === 0) return;
    const text = quoteBuffer.join(" ").trim();
    if (text) blocks.push(<blockquote key={key}>{renderInline(text, key)}</blockquote>);
    quoteBuffer = [];
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    const key = `block-${idx}`;

    const imageMatch = /^!\[([^\]]*)\]\((\S+)\)$/.exec(line);
    const youtubeMatch = /^\[youtube\]\((\S+)\)$/.exec(line);
    const youtubeId = youtubeMatch ? extractYouTubeId(youtubeMatch[1]) : null;

    if (line.startsWith("## ")) {
      flushParagraph(key);
      flushQuote(key);
      blocks.push(<h2 key={key}>{line.slice(3)}</h2>);
    } else if (line.startsWith("> ")) {
      flushParagraph(key);
      quoteBuffer.push(line.slice(2));
    } else if (imageMatch) {
      flushParagraph(key);
      flushQuote(key);
      const caption = imageMatch[1].trim();
      blocks.push(
        <figure key={key} className="my-5">
          <span className="relative block h-80 w-full overflow-hidden rounded-card">
            <Image src={imageMatch[2]} alt={caption} fill className="object-cover" sizes="700px" />
          </span>
          {caption && (
            <figcaption className="mt-1.5 text-center text-xs text-muted">{caption}</figcaption>
          )}
        </figure>
      );
    } else if (youtubeId) {
      flushParagraph(key);
      flushQuote(key);
      blocks.push(
        <div key={key} className="relative my-5 aspect-video w-full overflow-hidden rounded-card">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title="Vídeo de YouTube incrustado"
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    } else if (line === "") {
      flushParagraph(key);
      flushQuote(key);
    } else {
      flushQuote(key);
      paragraphBuffer.push(line);
    }
  });

  flushParagraph("final-p");
  flushQuote("final-q");

  return blocks;
}
