export function KofiButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://ko-fi.com/TheFrame"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/10 px-3.5 py-1.5 text-sm font-medium text-accent transition hover:bg-accent/20 ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 6.5c0-1 1-1 1-2M12 6.5c0-1 1-1 1-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      Invítanos a un café
    </a>
  );
}
