import { Tryzub } from "./tryzub";
import { retry, startFlight } from "@/game/sim";
import { useHud } from "@/game/hud-store";
import { Mark } from "./hud-mark";

export function Briefing({ onStart }: { onStart: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-x-hidden p-3 md:p-8">
      <div className="pointer-events-auto hud-panel hud-corners max-h-full w-full min-w-0 max-w-xl overflow-hidden bg-ink/88 p-5 md:p-8">
        <span className="c-tr" />
        <span className="c-bl" />
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <Tryzub className="h-14 w-10 shrink-0 text-chalk md:h-20 md:w-14" />
          <div className="min-w-0">
            <Mark v="ARMY NOW UA" className="block font-hud text-[10px] tracking-[0.32em] text-chalk-dim" />
            <Mark v="FPV ДРОН" className="block font-display text-3xl tracking-[0.18em] md:text-4xl" />
            <Mark
              v="НИЗЬКОПОЛІГОНАЛЬНИЙ ФРОНТ"
              className="mt-1 block font-hud text-[11px] tracking-[0.12em] text-chalk-dim"
            />
            <Mark v="15 СЕК УДАРУ" className="block font-hud text-[11px] tracking-[0.12em] text-chalk-dim" />
          </div>
        </div>

        <blockquote className="mt-5 min-w-0 overflow-hidden border-l border-line/40 pl-3 font-display text-sm leading-snug text-chalk-dim">
          <Mark v="«Дисципліна вирішує там," className="block" />
          <Mark v="де сила виснажується.»" className="block" />
          <Mark v="— ВАЛЕРІЙ ЗАЛУЖНИЙ" className="mt-1 block font-hud text-[10px] tracking-[0.2em]" />
        </blockquote>

        <div className="mt-5 grid min-w-0 gap-4 font-hud text-[11px] tracking-wide text-chalk-dim md:grid-cols-2">
          <div className="min-w-0">
            <Mark v="ЗАВДАННЯ" className="mb-1 block text-chalk" />
            <Mark
              v="Вивести ударний FPV над руїнами сектора Б-12."
              className="block leading-snug tracking-normal"
            />
            <Mark
              v="Піхота і техніка між остовами будинків."
              className="mt-1 block leading-snug tracking-normal"
            />
            <Mark
              v="Захопити ціль у прицілі і підтвердити удар."
              className="mt-1 block leading-snug tracking-normal"
            />
          </div>
          <div className="min-w-0">
            <Mark v="КЕРУВАННЯ" className="mb-1 block text-chalk" />
            <ul className="space-y-0.5">
              <li>
                <Mark v="МИША — ПРИЦІЛ" />
              </li>
              <li>
                <Mark v="W / S — ГАЗ" />
              </li>
              <li>
                <Mark v="A / D — РИСКАННЯ ЛІВО / ПРАВО" />
              </li>
              <li>
                <Mark v="SHIFT — ПРИСКОРЕННЯ" />
              </li>
              <li>
                <Mark v="SPACE / C — ВИСОТА" />
              </li>
              <li>
                <Mark v="F — УДАР · V — КАРКАС" className="block" />
              </li>
              <li>
                <Mark v="N — ДЕНЬ / НІЧ" className="block" />
              </li>
            </ul>
          </div>
        </div>

        <Mark
          v="НА ТЕЛЕФОНІ: ТОРКНИСЬ ЛІВОРУЧ — ГАЗ,"
          className="mt-4 block font-hud text-[10px] leading-snug tracking-normal text-chalk-mute md:hidden"
        />
        <Mark
          v="ПРАВОРУЧ — ПРИЦІЛ. СТИК З'ЯВЛЯЄТЬСЯ ПІД ПАЛЬЦЕМ."
          className="block font-hud text-[10px] leading-snug tracking-normal text-chalk-mute md:hidden"
        />

        <button
          type="button"
          aria-label="Start"
          onPointerDown={(e) => {
            e.preventDefault();
            startFlight();
            onStart();
          }}
          className="mt-6 flex w-full min-w-0 items-center justify-between gap-3 border border-strike bg-strike/10 px-4 py-3 font-display text-lg tracking-[0.28em] text-strike"
        >
          Start
          <Mark v="ПОЧАТИ ВИЛІТ →" className="shrink font-hud text-[11px] tracking-[0.2em]" />
        </button>
      </div>
    </div>
  );
}

export function ResultOverlay() {
  const result = useHud((s) => s.result);
  const phase = useHud((s) => s.phase);
  const kills = useHud((s) => s.kills);
  if (phase !== "result" && phase !== "strike") return null;

  const copy =
    result === "hit"
      ? { title: "ЦІЛЬ УРАЖЕНО", sub: "УДАР ПІДТВЕРДЖЕНО." }
      : result === "crash"
        ? { title: "ДРОН ВТРАЧЕНО", sub: "ЗІТКНЕННЯ З РЕЛЬЄФОМ." }
        : result === "timeout"
          ? { title: "ЧАС ВИЙШОВ", sub: "ВІКНО УДАРУ ЗАКРИТО." }
          : { title: "ПРОМАХ", sub: "ЦІЛЬ НЕ В ЗАХОПЛЕННІ." };

  const show = phase === "result";

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4">
      {result === "hit" ? <div className="flash-hit pointer-events-none absolute inset-0" /> : null}
      {show ? (
        <div className="pointer-events-auto hud-panel hud-corners w-full max-w-md bg-ink/90 p-6 text-center">
          <span className="c-tr" />
          <span className="c-bl" />
          <Mark v="РЕЗУЛЬТАТ ВИЛЬОТУ" className="block font-hud text-[10px] tracking-[0.3em] text-chalk-dim" />
          <Mark
            v={copy.title}
            className={`mt-2 block font-display text-3xl tracking-[0.18em] ${
              result === "hit" ? "text-ok" : "text-strike"
            }`}
          />
          <Mark v={copy.sub} className="mt-2 block font-hud text-xs tracking-[0.16em] text-chalk-dim" />
          <Mark
            v={`ЗНИЩЕНО ${kills} ОД.`}
            className="mt-3 block font-hud text-[11px] tracking-[0.2em] text-chalk"
          />
          <button
            type="button"
            aria-label="Retry"
            onPointerDown={(e) => {
              e.preventDefault();
              retry();
            }}
            className="mt-6 w-full border border-chalk px-4 py-3 font-display tracking-[0.24em]"
          >
            ЩЕ РАЗ
          </button>
        </div>
      ) : null}
    </div>
  );
}
