import type { ButtonHTMLAttributes, ReactNode } from "react";

export function ChalkBtn({
  children,
  tone = "ghost",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "ghost" | "solid" | "gold" | "red" }) {
  const tones = {
    ghost: "chalk-border bg-transparent text-fg",
    solid: "border border-fg bg-fg text-accent-fg",
    gold: "chalk-border-gold text-bought",
    red: "chalk-border-red text-boost",
  };
  return (
    <button
      type="button"
      {...rest}
      onMouseDown={(e) => {
        e.preventDefault();
        rest.onMouseDown?.(e);
      }}
      className={`flex min-h-11 select-none items-center justify-center gap-2 px-4 text-sm font-medium tracking-[0.14em] uppercase transition-opacity duration-150 hover:opacity-90 active:scale-[0.99] disabled:opacity-40 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`chalk-border bg-surface/80 p-4 ${className}`}>{children}</div>;
}

export function Rule({ className = "" }: { className?: string }) {
  return <div className={`h-px w-full bg-fg/35 ${className}`} />;
}

export function StatBar({ value }: { value: number }) {
  const w = Math.max(4, Math.min(100, value));
  return (
    <div className="h-1.5 w-full bg-fg/15">
      <div className="h-full bg-fg" style={{ width: `${w}%` }} />
    </div>
  );
}

export function OriginBox({
  origin,
  children,
  onClick,
  label,
}: {
  origin: "earned" | "bought" | "boosted" | "none" | "lost";
  children: ReactNode;
  onClick?: () => void;
  label: string;
}) {
  const ring =
    origin === "bought"
      ? "chalk-border-gold"
      : origin === "boosted"
        ? "chalk-border-red"
        : origin === "lost"
          ? "border border-dashed border-fg/35"
          : origin === "none"
            ? "chalk-border-blue text-locked"
            : "chalk-border";
  return (
    <button type="button" onClick={onClick} className={`flex flex-col items-center gap-1 p-2 ${ring}`}>
      <span className="text-fg">{children}</span>
      <span className="text-[10px] tracking-[0.16em] text-muted uppercase">{label}</span>
    </button>
  );
}

export function Dot({ tone }: { tone: "open" | "bought" | "boosted" | "off" }) {
  const c =
    tone === "bought" ? "bg-bought" : tone === "boosted" ? "bg-boost" : tone === "off" ? "bg-fg/20" : "bg-fg";
  return <span className={`inline-block size-1.5 rounded-full ${c}`} />;
}

export function LetterMark({
  kind,
  on,
}: {
  kind: "earn" | "buy" | "boost";
  on: boolean;
}) {
  if (!on) return null;
  const color = kind === "buy" ? "text-bought" : kind === "boost" ? "text-boost" : "text-fg";
  return <span className={`text-xs tracking-widest ${color}`}>{kind === "boost" ? "Ӧ" : "Ä"}</span>;
}

export function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden bg-bg text-fg">
      {children}
    </div>
  );
}
