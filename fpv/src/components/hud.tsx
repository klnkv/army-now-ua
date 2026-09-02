import type { ReactNode } from "react";
import {
  Battery,
  Crosshair,
  Eye,
  Home,
  Mountain,
  Skull,
  Sun,
  Wifi,
} from "lucide-react";
import { useHud } from "@/game/hud-store";
import { requestStrike, setNight, setWireframe, sim } from "@/game/sim";
import { DroneGlyph } from "./tryzub";
import { Minimap } from "./minimap";
import { Mark } from "./hud-mark";

function fmt(n: number, d = 0) {
  return n.toFixed(d);
}

function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`hud-panel hud-corners p-3 ${className}`}>
      <span className="c-tr" />
      <span className="c-bl" />
      {title ? <Mark v={title} className="mb-2 block font-hud text-[10px] tracking-[0.22em] text-chalk-dim" /> : null}
      {children}
    </section>
  );
}

export function FlightHud() {
  const hud = useHud();
  const locked = hud.phase === "flight" && hud.lockedId;
  const secs = Math.max(0, Math.ceil(hud.timeLeft));
  const clock = `00:${String(secs).padStart(2, "0")}`;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 text-chalk">
      <header className="pointer-events-none flex items-start justify-between px-3 pt-3 md:px-5 md:pt-4">
        <div className="flex items-center gap-3">
          <div className="hidden h-8 w-8 items-center justify-center border border-line/30 font-hud text-[10px] md:flex">
            <Mark v="III" />
          </div>
          <div>
            <Mark v="ФРОНТ — FPV ДРОН" className="block font-display text-sm tracking-[0.28em] md:text-base" />
            <Mark
              v="РОЗВІДКА. УДАР. ПІДТРИМКА."
              className="block font-hud text-[9px] tracking-[0.18em] text-chalk-dim"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 font-hud text-xs md:gap-8">
          <div className="flex items-center gap-1 text-ally">
            <Skull className="size-3.5" strokeWidth={1.5} />
            <Mark v={String(hud.kills)} />
          </div>
          <div className="text-center">
            <Mark v={clock} className="block font-display text-lg tabular-nums tracking-widest md:text-2xl" />
            <Mark v="ЧАС" className="block text-[9px] tracking-[0.3em] text-chalk-dim" />
          </div>
          <div className="flex items-center gap-1 text-strike">
            <Mark v={String(hud.remaining)} />
            <Skull className="size-3.5" strokeWidth={1.5} />
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2 font-hud text-[10px] tracking-widest text-chalk-dim">
          <button
            type="button"
            className={`border px-2 py-1 ${hud.wireframe ? "border-chalk text-chalk" : "border-line/30"}`}
            onPointerDown={(e) => {
              e.preventDefault();
              setWireframe(!sim.wireframe);
            }}
          >
            <Mark v="КАРКАС" />
          </button>
          <button
            type="button"
            className={`border px-2 py-1 ${hud.night ? "border-chalk text-chalk" : "border-line/30"}`}
            onPointerDown={(e) => {
              e.preventDefault();
              setNight(!sim.night);
            }}
          >
            <Mark v={hud.night ? "НІЧ" : "ДЕНЬ"} />
          </button>
          <span className="hidden items-center gap-1 md:flex">
            <Battery className="size-3.5" strokeWidth={1.5} />
            <Mark v={`${hud.battery}%`} />
          </span>
          <span className="hidden items-center gap-1 md:flex">
            <Wifi className="size-3.5" strokeWidth={1.5} />
            <Mark v={`${hud.ping} МС`} />
          </span>
        </div>
      </header>

      <div className="absolute top-16 left-3 hidden w-[220px] flex-col gap-2 md:top-20 md:left-5 md:flex">
        <Panel title="FPV ДРОН / СТАТУС">
          <div className="flex gap-3">
            <DroneGlyph className="h-14 w-16 shrink-0 text-chalk" />
            <ul className="font-hud text-[10px] leading-relaxed tracking-wide text-chalk-dim">
              <li>
                <Mark v="МОДЕЛЬ: FPV-КАМІКАДЗЕ" />
              </li>
              <li>
                <Mark v="КЛАС: УДАРНИЙ" />
              </li>
              <li>
                <Mark v={`ВИСОТА: ${fmt(hud.altitude, 0)} М`} />
              </li>
              <li>
                <Mark v={`ШВИДКІСТЬ: ${fmt(hud.speedKmh, 0)} КМ/Г`} />
              </li>
            </ul>
          </div>
          <div className="mt-2 h-1.5 w-full bg-ink-2">
            <div className="h-full bg-chalk" style={{ width: `${hud.battery}%` }} />
          </div>
          <Mark v="СИГНАЛ: СТАБІЛЬНИЙ" className="mt-1 block font-hud text-[10px] text-ok" />
        </Panel>
        <Panel title="НАВАНТАЖЕННЯ">
          <Mark v="ОСК. ×2   БК ×3" className="block font-hud text-[11px] tracking-wider" />
        </Panel>
        <Panel title="РАДІОЗВ'ЯЗОК">
          <ul className="space-y-1.5 font-hud text-[10px] leading-snug text-chalk-dim">
            {hud.radio.map((m, i) => (
              <li key={`${m.who}-${i}`}>
                <Mark v={`[${m.who}] ${m.text}`} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="absolute top-16 right-3 hidden w-[220px] flex-col gap-2 md:top-20 md:right-5 md:flex">
        <Minimap />
        <Panel title="КОНТАКТИ / ТЕХНІКА">
          <Mark
            v={`ПІХОТА ${hud.infantryAlive}  ·  ТЕХНІКА ${hud.vehicleAlive}`}
            className="mb-2 block font-hud text-[10px] tracking-wider text-chalk-dim"
          />
          <ul className="space-y-1.5 font-hud text-[10px]">
            {hud.contacts.map((t) => (
              <li
                key={t.id}
                className={`flex items-center justify-between gap-2 ${
                  hud.lockedId === t.id ? "text-strike" : "text-chalk-dim"
                }`}
              >
                <Mark v={`${t.name} ${t.kind}`} />
                <Mark v={`${fmt(t.dist, 0)} М ${t.grid}`} className="tabular-nums" />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="ТЕЛЕМЕТРІЯ">
          <ul className="space-y-1 font-hud text-[10px] text-chalk-dim">
            <li className="flex justify-between">
              <Mark v="ВИСОТА" />
              <Mark v={`${fmt(hud.altitude, 1)} М`} className="text-chalk tabular-nums" />
            </li>
            <li className="flex justify-between">
              <Mark v="ШВИДКІСТЬ" />
              <Mark v={`${fmt(hud.speedKmh, 0)} КМ/Г`} className="text-chalk tabular-nums" />
            </li>
            <li className="flex justify-between">
              <Mark v="КУРС" />
              <Mark v={`${fmt(hud.heading, 0)}°`} className="text-chalk tabular-nums" />
            </li>
            <li className="flex justify-between">
              <Mark v="КЛІТИНА" />
              <Mark v={hud.grid} className="text-chalk" />
            </li>
          </ul>
        </Panel>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className={`crosshair relative ${locked ? "locked" : ""}`}>
          <span className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 border border-current" />
          <span className="absolute top-0 left-1/2 h-2 w-px -translate-x-1/2 bg-current" />
          <span className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-current" />
          <span className="absolute top-1/2 left-0 h-px w-2 -translate-y-1/2 bg-current" />
          <span className="absolute top-1/2 right-0 h-px w-2 -translate-y-1/2 bg-current" />
        </div>
      </div>

      <div className="absolute bottom-28 left-1/2 z-10 w-[min(280px,80vw)] -translate-x-1/2 text-center md:bottom-32">
        <div className={`border border-strike bg-ink/70 px-4 py-2 ${secs <= 5 ? "pulse-strike" : ""}`}>
          <Mark v="УДАР ЧЕРЕЗ" className="block font-hud text-[10px] tracking-[0.28em] text-strike" />
          <Mark
            v={clock}
            className="block font-display text-4xl leading-none tracking-widest text-strike py-1 md:text-5xl"
          />
          <Mark v={`${secs} СЕК`} className="block font-hud text-[10px] tracking-[0.3em] text-strike" />
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 items-stretch gap-2 md:flex">
        <ModeChip icon={<Eye className="size-3.5" strokeWidth={1.5} />} label="СПОСТЕРЕЖЕННЯ" />
        <ModeChip icon={<Crosshair className="size-3.5" strokeWidth={1.5} />} label="ЦІЛЬ" active={!!locked} />
        <button
          type="button"
          className="pointer-events-auto flex min-w-[140px] items-center justify-center gap-2 border border-strike bg-strike/15 px-4 py-3 font-display text-sm tracking-[0.22em] text-strike"
          onPointerDown={(e) => {
            e.preventDefault();
            requestStrike();
          }}
        >
          <Mark v="УДАР FPV" />
        </button>
        <ModeChip icon={<Mountain className="size-3.5" strokeWidth={1.5} />} label="СУПРОВІД" />
        <ModeChip icon={<Home className="size-3.5" strokeWidth={1.5} />} label="БАЗА" />
      </div>

      <Mark
        v={`${hud.lat.toFixed(4)} N  ${hud.lon.toFixed(4)} E`}
        className="absolute bottom-3 left-3 hidden font-hud text-[10px] tracking-widest text-chalk-dim md:block"
      />
      <Mark
        v="МАСШТАБ 1.0X"
        className="absolute right-3 bottom-3 hidden font-hud text-[10px] tracking-widest text-chalk-dim md:block"
      />

      <div className="absolute top-16 left-3 right-3 flex justify-between font-hud text-[10px] text-chalk-dim md:hidden">
        <Mark v={`${fmt(hud.altitude, 0)} М`} />
        <Mark v={`${fmt(hud.speedKmh, 0)} КМ/Г`} />
        <span>
          <Sun className="mr-1 inline size-3" strokeWidth={1.5} />
          <Mark v={`${hud.battery}%`} />
        </span>
      </div>
    </div>
  );
}

function ModeChip({
  icon,
  label,
  active,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex min-w-[110px] items-center justify-center gap-2 border px-3 py-3 font-hud text-[10px] tracking-[0.18em] ${
        active ? "border-chalk text-chalk" : "border-line/25 text-chalk-dim"
      }`}
    >
      {icon}
      <Mark v={label} />
    </div>
  );
}
