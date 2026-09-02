export function Tryzub({ className = "h-16 w-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 88"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M32 6 L32 52" />
      <path d="M32 6 C32 6 36 18 42 22 C50 28 54 24 56 18 C52 34 46 38 40 42 C36 45 34 50 34 56" />
      <path d="M32 6 C32 6 28 18 22 22 C14 28 10 24 8 18 C12 34 18 38 24 42 C28 45 30 50 30 56" />
      <path d="M24 56 C18 62 16 70 18 80 C24 74 30 70 32 68 C34 70 40 74 46 80 C48 70 46 62 40 56" />
      <path d="M22 34 C26 38 30 40 32 40 C34 40 38 38 42 34" />
      <circle cx="32" cy="84" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
