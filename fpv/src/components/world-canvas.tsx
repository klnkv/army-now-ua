import { Canvas } from "@react-three/fiber";
import { useMemo, useState } from "react";
import * as THREE from "three";
import { GameScene } from "@/game/scene";
import { getQuality } from "@/game/quality";

export function WorldCanvas({
  flying,
  onCanvasReady,
}: {
  flying: boolean;
  onCanvasReady?: (el: HTMLCanvasElement) => void;
}) {
  const q = useMemo(() => getQuality(), []);
  const [ctxGen, setCtxGen] = useState(0);

  return (
    <Canvas
      key={ctxGen}
      className="absolute inset-0 h-full w-full touch-none"
      style={{ display: "block", touchAction: "none" }}
      dpr={q.dpr}
      flat={!q.toneMapping}
      frameloop="always"
      performance={{ min: 0.45, max: 1, debounce: 180 }}
      camera={{ fov: q.mobile ? 68 : 72, near: 0.35, far: q.far, position: [14, 21, 22] }}
      gl={{
        antialias: q.antialias,
        alpha: false,
        powerPreference: q.mobile ? "default" : "high-performance",
        failIfMajorPerformanceCaveat: false,
        stencil: false,
        depth: true,
        precision: q.precision,
        logarithmicDepthBuffer: false,
        preserveDrawingBuffer: false,
        premultipliedAlpha: true,
      }}
      onCreated={({ gl, camera, size }) => {
        camera.far = q.far;
        camera.near = 0.35;
        camera.updateProjectionMatrix();
        gl.toneMapping = q.toneMapping ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
        gl.toneMappingExposure = q.toneMapping ? 1.14 : 1;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor("#1a1a1e", 1);
        gl.shadowMap.enabled = false;
        const cssLong = Math.max(size.width, size.height, 1);
        gl.setPixelRatio(Math.min(q.dpr, q.maxBuffer / cssLong));
        const canvas = gl.domElement;
        canvas.style.touchAction = "none";
        const block = (e: Event) => e.preventDefault();
        canvas.addEventListener("touchstart", block, { passive: false });
        canvas.addEventListener("touchmove", block, { passive: false });
        canvas.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
        });
        canvas.addEventListener("webglcontextrestored", () => {
          setCtxGen((n) => n + 1);
        });
        onCanvasReady?.(canvas);
        window.__glStats = () => ({
          calls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
          points: gl.info.render.points,
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
          dpr: gl.getPixelRatio(),
          drawing: { w: canvas.width, h: canvas.height },
        });
      }}
      onPointerDown={(e) => {
        if (!flying) return;
        if (e.pointerType === "mouse") {
          (e.target as HTMLElement).requestPointerLock?.();
        }
      }}
    >
      <GameScene />
    </Canvas>
  );
}
