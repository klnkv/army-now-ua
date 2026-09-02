import { useEffect, useRef, useState, type ComponentType } from "react";
import "@/game/bind-hud";
import {
  attachControlsTest,
  bindInput,
  initWorld,
  unbindInput,
} from "@/game/sim";
import { lockSelection } from "@/game/lock-select";
import { useHud } from "@/game/hud-store";
import { Briefing, ResultOverlay } from "./briefing";
import { FlightHud } from "./hud";
import { TouchControls } from "./touch-controls";

initWorld();

type WorldCanvasProps = {
  flying: boolean;
  onCanvasReady?: (el: HTMLCanvasElement) => void;
};

export function GameApp() {
  const phase = useHud((s) => s.phase);
  const [touch, setTouch] = useState(false);
  const [World, setWorld] = useState<ComponentType<WorldCanvasProps> | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    bindInput();
    attachControlsTest();
    const showTouch = () =>
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 767px)").matches;
    setTouch(showTouch());
    const onResize = () => setTouch(showTouch());
    window.addEventListener("resize", onResize);
    window.__gameReady = true;
    void import("./world-canvas").then((m) => setWorld(() => m.WorldCanvas));
    return () => {
      window.removeEventListener("resize", onResize);
      unbindInput();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return lockSelection(root);
  }, []);

  function onStart() {
    const canvas = document.querySelector("canvas");
    if (canvas && !window.matchMedia("(pointer: coarse)").matches) {
      canvas.requestPointerLock?.();
    }
  }

  return (
    <main
      ref={rootRef}
      className="fixed inset-0 w-full overflow-hidden bg-ink"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        touchAction: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <div
        className="absolute inset-0 z-0 bg-ink-2"
        style={{ isolation: "isolate", transform: "translateZ(0)" }}
      >
        {World ? <World flying={phase === "flight"} /> : <div className="absolute inset-0 bg-ink" />}
      </div>

      <div className="tactical-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="scanlines pointer-events-none absolute inset-0" />
      <div className="grain pointer-events-none absolute inset-0" />

      {phase === "brief" ? <Briefing onStart={onStart} /> : null}
      {phase === "flight" || phase === "strike" || phase === "result" ? <FlightHud /> : null}
      <ResultOverlay />
      <TouchControls visible={touch && phase === "flight"} />
    </main>
  );
}
