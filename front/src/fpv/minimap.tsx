import { useEffect, useRef, useState } from "react";
import { WORLD } from "@/game/constants";
import { useHud } from "@/game/hud-store";
import { heightAt, scatterBuildings, urbanFactor } from "@/game/terrain";
import { sim } from "@/game/sim";

const SIZE = 160;

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(0);
  const baked = useRef<ImageData | null>(null);
  const heading = useHud((s) => s.heading);
  const grid = useHud((s) => s.grid);
  const night = useHud((s) => s.night);
  const x = useHud((s) => s.lat);
  const z = useHud((s) => s.lon);
  const remaining = useHud((s) => s.remaining);
  const lockedId = useHud((s) => s.lockedId);

  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = SIZE;
    c.height = SIZE;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(SIZE, SIZE);
    const buildings = scatterBuildings();
    for (let y = 0; y < SIZE; y++) {
      for (let x0 = 0; x0 < SIZE; x0++) {
        const wx = (x0 / SIZE - 0.5) * WORLD;
        const wz = (y / SIZE - 0.5) * WORLD;
        const h = heightAt(wx, wz);
        const i = (y * SIZE + x0) * 4;
        const u = urbanFactor(wx, wz);
        let v = 22 + Math.min(40, h);
        if (h < 4) v = 14;
        v = v * (1 - u * 0.25) + 28 * u;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v + 2;
        img.data[i + 3] = 255;
      }
    }
    baked.current = img;
    baked.current &&
      (() => {
        for (const b of buildings) {
          const px = Math.floor(((b.x + WORLD * 0.5) / WORLD) * SIZE);
          const py = Math.floor(((b.z + WORLD * 0.5) / WORLD) * SIZE);
          const chalk = b.variant === 1 || b.variant === 2;
          for (let dy = -3; dy <= 3; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
              if (Math.abs(dx) !== 3 && Math.abs(dy) !== 3 && Math.abs(dx) !== 2 && Math.abs(dy) !== 2)
                continue;
              const ix = px + dx;
              const iy = py + dy;
              if (ix < 0 || iy < 0 || ix >= SIZE || iy >= SIZE) continue;
              const i = (iy * SIZE + ix) * 4;
              img.data[i] = chalk ? 200 : 188;
              img.data[i + 1] = chalk ? 170 : 184;
              img.data[i + 2] = chalk ? 178 : 176;
            }
          }
        }
      })();
    setReady((n) => n + 1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = baked.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(img, 0, 0);
    ctx.strokeStyle = night ? "rgba(230,225,212,0.18)" : "rgba(180,180,180,0.16)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 10; i++) {
      const p = (i / 10) * SIZE;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, SIZE);
      ctx.moveTo(0, p);
      ctx.lineTo(SIZE, p);
      ctx.stroke();
    }
    const toX = (wx: number) => ((wx + WORLD * 0.5) / WORLD) * SIZE;
    const toY = (wz: number) => ((wz + WORLD * 0.5) / WORLD) * SIZE;

    for (const u of sim.units) {
      if (!u.alive) continue;
      const px = toX(u.x);
      const py = toY(u.z);
      const locked = u.id === lockedId;
      ctx.fillStyle = locked ? "#e6e1d4" : "#c41e1e";
      if (u.kind === "infantry") {
        ctx.beginPath();
        ctx.arc(px, py, locked ? 2.6 : 1.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (u.kind === "truck") {
        ctx.fillRect(px - 2.4, py - 1.5, 4.8, 3);
      } else {
        ctx.beginPath();
        ctx.moveTo(px, py - 5);
        ctx.lineTo(px + 4, py);
        ctx.lineTo(px, py + 5);
        ctx.lineTo(px - 4, py);
        ctx.closePath();
        ctx.fill();
      }
    }

    for (const t of sim.targets) {
      ctx.strokeStyle = "#c41e1e";
      ctx.lineWidth = 1.2;
      const px = toX(t.x);
      const py = toY(t.z);
      ctx.beginPath();
      ctx.moveTo(px, py - 6);
      ctx.lineTo(px + 5, py);
      ctx.lineTo(px, py + 6);
      ctx.lineTo(px - 5, py);
      ctx.closePath();
      ctx.stroke();
    }
    const dx = toX(sim.x);
    const dy = toY(sim.z);
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(-sim.yaw);
    ctx.fillStyle = "#e6e1d4";
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(5, 7);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [heading, grid, night, ready, x, z, remaining, lockedId]);

  return (
    <div className="hud-panel hud-corners p-2">
      <span className="c-tr" />
      <span className="c-bl" />
      <div className="mb-1 flex items-center justify-between font-hud text-[10px] tracking-[0.18em] text-chalk-dim">
        <span>МІНІ-КАРТА</span>
        <span>{grid}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="aspect-square w-full border border-line/20"
      />
    </div>
  );
}
