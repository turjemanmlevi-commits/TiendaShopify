export function Bow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 84 50"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M40 20C31 5 9 1 7 12c-2 11 19 14 33 8Zm4 0C53 5 75 1 77 12c2 11-19 14-33 8ZM39 24C29 32 30 42 20 47m25-23c10 8 9 18 19 23M38 18c0-5 8-5 8 0v6c0 4-8 4-8 0v-6Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-mark${compact ? " brand-mark--compact" : ""}`}>
      <span>
        Haunted <i>Tips</i>
        <span className="brand-spark" aria-hidden="true">
          ✧
        </span>
      </span>
      <span className="brand-caption">PRETTY LITTLE DARK THINGS</span>
    </span>
  );
}
