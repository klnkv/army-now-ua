export function DroneGlyph({ className = "h-16 w-20" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="30" y="18" width="20" height="12" rx="2" />
      <circle cx="40" cy="24" r="3" />
      <path d="M30 24 H14 M50 24 H66" />
      <path d="M14 24 V14 M14 24 V34 M66 24 V14 M66 24 V34" />
      <ellipse cx="14" cy="10" rx="10" ry="4" />
      <ellipse cx="14" cy="38" rx="10" ry="4" />
      <ellipse cx="66" cy="10" rx="10" ry="4" />
      <ellipse cx="66" cy="38" rx="10" ry="4" />
      <path d="M36 18 L32 10 M44 18 L48 10" />
    </svg>
  );
}
