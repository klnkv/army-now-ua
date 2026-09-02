import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUp, Crosshair } from "lucide-react";
import { touchState } from "@/game/sim";
import { Mark } from "./hud-mark";

type Kind = "move" | "look";

type Slot = {
  id: number;
  ox: number;
  oy: number;
};

const MAX = 46;
const BASE = 112;

function clampOrigin(x: number, y: number) {
  const r = BASE / 2 + 6;
  return {
    x: Math.min(window.innerWidth - r, Math.max(r, x)),
    y: Math.min(window.innerHeight - r, Math.max(r, y)),
  };
}

export function TouchControls({ visible }: { visible: boolean }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const moveBase = useRef<HTMLDivElement>(null);
  const lookBase = useRef<HTMLDivElement>(null);
  const moveKnob = useRef<HTMLDivElement>(null);
  const lookKnob = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) {
      touchState.setMove(0, 0);
      touchState.setLook(0, 0);
      return;
    }
    const layer = layerRef.current;
    if (!layer) return;
    const root = layer;

    const slots: Record<Kind, Slot | null> = { move: null, look: null };

    function baseEl(kind: Kind) {
      return kind === "move" ? moveBase.current : lookBase.current;
    }
    function knobEl(kind: Kind) {
      return kind === "move" ? moveKnob.current : lookKnob.current;
    }

    function apply(kind: Kind, dx: number, dy: number) {
      const m = Math.hypot(dx, dy);
      const s = m > MAX ? MAX / m : 1;
      const x = dx * s;
      const y = dy * s;
      const knob = knobEl(kind);
      if (knob) knob.style.transform = `translate(${x}px, ${y}px)`;
      const nx = x / MAX;
      const ny = y / MAX;
      if (kind === "move") touchState.setMove(nx, ny);
      else touchState.setLook(nx, ny);
    }

    function show(kind: Kind, x: number, y: number) {
      const el = baseEl(kind);
      if (!el) return;
      const p = clampOrigin(x, y);
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
      el.style.opacity = "1";
      el.style.visibility = "visible";
      apply(kind, 0, 0);
    }

    function hide(kind: Kind) {
      const el = baseEl(kind);
      if (el) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
      }
      const knob = knobEl(kind);
      if (knob) knob.style.transform = "translate(0px, 0px)";
      apply(kind, 0, 0);
      slots[kind] = null;
    }

    function overChrome(x: number, y: number) {
      const hit = document.elementFromPoint(x, y);
      return !!hit?.closest("button, [data-touch-chrome]");
    }

    function kindFor(x: number) {
      const rect = root.getBoundingClientRect();
      return x < rect.left + rect.width * 0.5 ? "move" : "look";
    }

    function grab(id: number, x: number, y: number) {
      if (overChrome(x, y)) return;
      const kind = kindFor(x);
      if (slots[kind]) return;
      slots[kind] = { id, ox: x, oy: y };
      show(kind, x, y);
    }

    function drag(id: number, x: number, y: number) {
      const kind: Kind | null =
        slots.move?.id === id ? "move" : slots.look?.id === id ? "look" : null;
      if (!kind) return;
      const s = slots[kind]!;
      apply(kind, x - s.ox, y - s.oy);
    }

    function drop(id: number) {
      if (slots.move?.id === id) hide("move");
      if (slots.look?.id === id) hide("look");
    }

    const touchOpts: AddEventListenerOptions = { passive: false, capture: true };

    const onTouchStart = (e: TouchEvent) => {
      const t0 = e.target as HTMLElement | null;
      if (t0?.closest("button, [data-touch-chrome]")) return;
      for (const t of Array.from(e.changedTouches)) grab(t.identifier, t.clientX, t.clientY);
      if (e.cancelable) e.preventDefault();
    };
    const onTouchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (slots.move?.id === t.identifier || slots.look?.id === t.identifier) {
          drag(t.identifier, t.clientX, t.clientY);
        }
      }
      if (e.cancelable) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) drop(t.identifier);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const t0 = e.target as HTMLElement | null;
      if (t0?.closest("button, [data-touch-chrome]")) return;
      grab(e.pointerId, e.clientX, e.clientY);
      if (slots.move?.id === e.pointerId || slots.look?.id === e.pointerId) {
        root.setPointerCapture(e.pointerId);
        e.preventDefault();
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      drag(e.pointerId, e.clientX, e.clientY);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      drop(e.pointerId);
    };

    root.addEventListener("touchstart", onTouchStart, touchOpts);
    root.addEventListener("touchmove", onTouchMove, touchOpts);
    root.addEventListener("touchend", onTouchEnd, touchOpts);
    root.addEventListener("touchcancel", onTouchEnd, touchOpts);
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);

    return () => {
      root.removeEventListener("touchstart", onTouchStart, touchOpts);
      root.removeEventListener("touchmove", onTouchMove, touchOpts);
      root.removeEventListener("touchend", onTouchEnd, touchOpts);
      root.removeEventListener("touchcancel", onTouchEnd, touchOpts);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      hide("move");
      hide("look");
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={layerRef}
      data-touch-layer="1"
      className="absolute inset-0 z-20 touch-none"
      style={{ touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
    >
      <div ref={moveBase} className="stick-float" aria-hidden>
        <div ref={moveKnob} className="stick-knob" />
        <Mark v="ГАЗ" className="stick-float-label" />
      </div>
      <div ref={lookBase} className="stick-float" aria-hidden>
        <div ref={lookKnob} className="stick-knob" />
        <Mark v="ПРИЦІЛ" className="stick-float-label" />
      </div>

      <div
        data-touch-chrome="1"
        className="pointer-events-none absolute inset-x-0 bottom-[max(10px,env(safe-area-inset-bottom))] z-30 flex justify-center"
      >
        <Mark
          v="ЛІВА СТОРОНА — ГАЗ · ПРАВА — ПРИЦІЛ"
          className="pointer-events-none mb-14 block font-hud text-[9px] tracking-[0.14em] text-chalk-mute"
        />
      </div>

      <div
        data-touch-chrome="1"
        className="absolute bottom-[max(12px,env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2"
      >
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center border border-chalk/40 bg-ink/70"
          style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            touchState.setClimb(1);
          }}
          onPointerUp={() => touchState.setClimb(0)}
          onPointerCancel={() => touchState.setClimb(0)}
          aria-label="Піднятись"
        >
          <ArrowUp className="size-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center border border-strike/80 bg-strike/20 text-strike"
          style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            touchState.queueStrike();
          }}
          aria-label="Удар"
        >
          <Crosshair className="size-5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center border border-chalk/40 bg-ink/70"
          style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            touchState.setClimb(-1);
          }}
          onPointerUp={() => touchState.setClimb(0)}
          onPointerCancel={() => touchState.setClimb(0)}
          aria-label="Опуститись"
        >
          <ArrowDown className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
