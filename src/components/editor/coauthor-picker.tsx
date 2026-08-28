"use client";

export function CoauthorPicker({
  candidates,
  selected,
  onChange,
  excludeId,
}: {
  candidates: { id: string; name: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  excludeId?: string;
}) {
  const options = candidates.filter((c) => c.id !== excludeId);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  if (options.length === 0) return null;

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1 text-sm font-medium text-text">Coautores (opcional)</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((c) => (
          <label
            key={c.id}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
              selected.includes(c.id) ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(c.id)}
              onChange={() => toggle(c.id)}
              className="sr-only"
            />
            {c.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
