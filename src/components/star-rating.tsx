function Star({ fill }: { fill: number }) {
  const id = `star-clip-${Math.random().toString(36).slice(2)}`;
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      <path
        d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20l1.4-6.3-4.8-4.3 6.4-.6L12 3Z"
        fill="none"
        stroke="var(--cp-border)"
        strokeWidth="1.2"
      />
      <g clipPath={`url(#${id})`}>
        <path
          d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20l1.4-6.3-4.8-4.3 6.4-.6L12 3Z"
          fill="var(--cp-accent)"
        />
      </g>
    </svg>
  );
}

export function StarRatingDisplay({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const stars = [0, 1, 2, 3, 4].map((i) => Math.min(1, Math.max(0, value - i)));
  return (
    <span className={`inline-flex items-center gap-0.5 ${size === "md" ? "scale-125 origin-left" : ""}`}>
      {stars.map((fill, i) => (
        <Star key={i} fill={fill} />
      ))}
    </span>
  );
}
