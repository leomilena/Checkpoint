import Image from "next/image";

export function CoverImage({
  src,
  gradient,
  alt,
  className = "",
  sizes,
}: {
  src?: string | null;
  gradient: number;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes ?? "100vw"} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`gradient-cover-${gradient % 6} relative flex items-center justify-center overflow-hidden ${className}`}
      role="img"
      aria-label={alt}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="opacity-30" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#ECEAE3" strokeWidth="1.6" />
        <circle cx="9" cy="10" r="1.6" fill="#ECEAE3" />
        <path d="m4 17 5-5 4 4 3-3 4 4" stroke="#ECEAE3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
