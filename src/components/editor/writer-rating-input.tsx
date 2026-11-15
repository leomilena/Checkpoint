"use client";

const OPTIONS = Array.from({ length: 11 }, (_, i) => i * 0.5);

export function WriterRatingInput({
  value,
  onChange,
  verb,
}: {
  value: number | null;
  onChange: (next: number | null) => void;
  verb: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="writer-rating" className="text-sm font-medium text-text">
        Nota The Frame — {verb}
      </label>
      <select
        id="writer-rating"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full rounded-lg border border-border bg-surface2 px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent"
      >
        <option value="">Sin puntuar</option>
        {OPTIONS.map((v) => (
          <option key={v} value={v}>
            {v.toFixed(1)} / 5
          </option>
        ))}
      </select>
    </div>
  );
}
