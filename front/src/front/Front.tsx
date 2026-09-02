import { useEffect, useRef, useState } from "react";
import { FrontGame } from "./engine";
import { useArmy } from "@/army/store";
import { unlockAudio } from "@/army/audio";

const HUD = {
  menu: 0,
  help: 1,
  nade: 2,
  pause: 3,
  soldier: 4,
  lamp: 5,
  plus: 6,
  radio: 7,
} as const;

function HudIco({ id, px = 20 }: { id: keyof typeof HUD; px?: number }) {
  const i = HUD[id];
  const col = i % 4;
  const row = Math.floor(i / 4);
  return (
    <span
      className="inline-block shrink-0"
      style={{
        width: px,
        height: px,
        backgroundImage: "url(/sprites/hud-sheet.png)",
        backgroundRepeat: "no-repeat",
        backgroundSize: `${px * 4}px ${px * 2}px`,
        backgroundPosition: `${-col * px}px ${-row * px}px`,
      }}
    />
  );
}

type Hud = {
  score: number;
  wave: number;
  lives: number;
  paused: boolean;
  over: boolean;
  mag: number;
  magMax: number;
  helm: number;
  vis: number;
  clock: string;
};

export function Front() {
  const ref = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<FrontGame | null>(null);
  const lang = useArmy((s) => s.lang);
  const go = useArmy((s) => s.go);
  const unit = useArmy((s) => s.unit) ?? "infantry";
  const path = useArmy((s) => s.path);
  const gear = useArmy((s) => s.gear);
  const gearRef = useRef(gear);
  gearRef.current = gear;
  const [hud, setHud] = useState<Hud>({
    score: 0,
    wave: 1,
    lives: 3,
    paused: false,
    over: false,
    mag: 12,
    magMax: 60,
    helm: 62,
    vis: 100,
    clock: "00:00",
  });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    unlockAudio();
    const game = new FrontGame(canvas, {
      lang,
      unit,
      path,
      gear: () => gearRef.current,
      onHq: () => go("hq"),
    });
    gameRef.current = game;
    void game.start();
    const id = window.setInterval(() => {
      setHud(game.snapshot());
    }, 120);
    return () => {
      window.clearInterval(id);
      game.destroy();
      gameRef.current = null;
    };
  }, [lang, go, unit, path]);

  const ua = lang === "ua" || lang === "ru";
  const magFill = Math.max(0, Math.min(1, hud.mag / hud.magMax));

  return (
    <div className="relative h-full w-full bg-black">
      <canvas
        ref={ref}
        className="block h-full w-full touch-none"
        style={{ touchAction: "none", WebkitUserSelect: "none" }}
      />
      <div className="pointer-events-none absolute inset-0 select-none text-[#efe8d8]">
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent pt-[max(0.4rem,env(safe-area-inset-top))] pb-8">
          <p className="text-center text-[9px] tracking-[0.38em] text-white/50 uppercase">Army Now</p>
          <h1 className="text-center text-2xl font-semibold tracking-[0.28em] uppercase">{ua ? "Фронт" : "Front"}</h1>
          <p className="mt-1 text-center text-3xl font-semibold tabular-nums">{hud.score}</p>
          <p className="text-center text-sm tracking-[0.2em] text-white/70">{hud.clock}</p>
          <p className="text-center text-[10px] tracking-[0.22em] text-white/45 uppercase">
            {ua ? "Хвиля" : "Wave"} {hud.wave} · {hud.score > 0 ? hud.score : 600}
          </p>
        </div>

        <button
          type="button"
          className="pointer-events-auto absolute top-[max(0.55rem,env(safe-area-inset-top))] left-3 flex size-10 items-center justify-center border border-white/25 bg-black/40"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => go("hq")}
        >
          <HudIco id="menu" px={20} />
        </button>
        <button
          type="button"
          className="pointer-events-auto absolute top-[max(0.55rem,env(safe-area-inset-top))] left-14 flex size-10 items-center justify-center border border-white/25 bg-black/40"
          onMouseDown={(e) => e.preventDefault()}
        >
          <HudIco id="help" px={20} />
        </button>

        <div className="absolute top-[max(0.55rem,env(safe-area-inset-top))] right-3 w-[42%] max-w-[11rem] border border-white/20 bg-black/45 px-2 py-1.5">
          <p className="flex items-center gap-1.5 text-[9px] tracking-[0.22em] text-white/55 uppercase">
            <HudIco id="radio" px={14} />
            {ua ? "Рація" : "Radio"}
          </p>
          <p className="mt-1 text-[10px] tracking-wider text-white/35 uppercase">{ua ? "Написати…" : "Write…"}</p>
        </div>

        <div className="pointer-events-auto absolute top-1/3 right-3 flex flex-col gap-2">
          {(
            [
              ["nade", null],
              ["pause", "pause"],
              ["soldier", "hq"],
              ["lamp", null],
            ] as const
          ).map(([icon, act]) => (
            <button
              key={icon}
              type="button"
              className="flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/45"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (act === "pause") gameRef.current?.togglePause();
                if (act === "hq") go("hq");
              }}
            >
              <HudIco id={icon} px={24} />
            </button>
          ))}
        </div>

        <div className="absolute right-3 bottom-28 flex size-16 items-center justify-center rounded-full border border-white/30 bg-black/30">
          <HudIco id="plus" px={32} />
        </div>

        <div className="absolute inset-x-16 bottom-[max(1.1rem,env(safe-area-inset-bottom))] flex items-end gap-2">
          <div className="flex-1 border border-white/20 bg-black/55 px-2 py-1.5">
            <p className="text-[10px] text-white/50">1</p>
            <p className="text-xs">0/0</p>
            <div className="mt-1 h-1.5 w-full bg-white/15" />
          </div>
          <div className="flex-1 border border-white/20 bg-black/55 px-2 py-1.5">
            <p className="text-[10px] text-white/50">2</p>
            <p className="text-xs">
              {hud.mag}/{hud.magMax}
            </p>
            <div className="mt-1 h-1.5 w-full bg-white/15">
              <div className="h-full bg-amber-400" style={{ width: `${magFill * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-16 bottom-[max(4.6rem,calc(env(safe-area-inset-bottom)+3.5rem))] flex items-center gap-2 border border-white/20 bg-black/55 px-2 py-1 text-[10px] tracking-wider uppercase">
          <span>{ua ? "Шолом" : "Helm"} {hud.helm}%</span>
          <span className="h-1.5 flex-1 bg-white/15">
            <span className="block h-full bg-sky-500" style={{ width: `${hud.helm}%` }} />
          </span>
          <span>{ua ? "Вис" : "Vis"} {hud.vis}%</span>
        </div>
      </div>
    </div>
  );
}
