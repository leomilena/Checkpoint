import type { ReleaseItem } from "@/lib/external-media";

export function ReleaseWidget({
  title,
  items,
  attribution,
}: {
  title: string;
  items: ReleaseItem[];
  attribution: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex h-full flex-col rounded-card border border-border bg-surface p-4">
      <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-wide text-accent">{title}</h2>
      <ul className="flex flex-1 flex-col divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3">
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface2">
                {item.imageUrl && (
                  // Imágenes de dominios externos (TMDB/RAWG): una miniatura pequeña
                  // no merece la complejidad de configurar next/image para hosts externos.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-text transition group-hover:text-accent">
                  {item.title}
                </span>
                {item.subtitle && <span className="block text-xs text-muted">{item.subtitle}</span>}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-muted">{attribution}</p>
    </div>
  );
}
