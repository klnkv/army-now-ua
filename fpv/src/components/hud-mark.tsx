/** Render HUD copy as CSS generated content so iOS has no text node to select. */
export function Mark({ v, className = "" }: { v: string; className?: string }) {
  return <span className={`hud-mark ${className}`} data-v={v} aria-label={v} />;
}
