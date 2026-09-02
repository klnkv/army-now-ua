import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Mail, Settings, LogOut } from "lucide-react";
import * as Ic from "@/army/icons";
import { I18N } from "@/army/i18n";
import { GEAR_IDS, QUICK, QUOTE_BY, QUOTE_UA, ROLE_GEAR, SQUAD, UNITS, heroArt, missionsFor } from "@/army/data";
import { click, rx, squelch, unlockAudio } from "@/army/audio";
import { startVoice, speechLang, VOICE_MAX_MS, type VoiceHandle } from "@/army/voice";
import { useArmy } from "@/army/store";
import { ChalkBtn, Dot, LetterMark, OriginBox, Panel, Rule, StatBar } from "@/army/ui";
import { Front } from "@/front/Front";
import { FRONT_ASSETS } from "@/front/engine";
import type { Channel, GearId, Lang, Origin, PathId, RoleId } from "@/army/types";

const GITHUB_URL = "https://github.com/klnkv/army-now-ua";
const ORIGIN_CYCLE: Origin[] = ["earned", "bought", "boosted", "none", "lost"];

const SLOT_ART: Record<GearId, string> = {
  helm: "/sprites/kit-helm.png",
  armor: "/sprites/kit-armor.png",
  radio: "/sprites/kit-radio.png",
  pack: "/sprites/kit-pack.png",
  roleItem: "/sprites/kit-medic.png",
  public: "/sprites/kit-pack.png",
};

function SlotArt({ id }: { id: GearId }) {
  return <img src={SLOT_ART[id]} alt="" className="h-10 w-10 object-contain" draggable={false} />;
}

export function ArmyApp() {
  const screen = useArmy((s) => s.screen);
  const go = useArmy((s) => s.go);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const pin = () => {
      main.style.position = "fixed";
      main.style.left = "0px";
      main.style.top = "0px";
      main.style.right = "0px";
      main.style.bottom = "0px";
      main.style.width = "100%";
      main.style.height = "100%";
      main.style.transform = "none";
    };
    pin();
    window.addEventListener("resize", pin);
    window.visualViewport?.addEventListener("resize", pin);
    return () => {
      window.removeEventListener("resize", pin);
      window.visualViewport?.removeEventListener("resize", pin);
    };
  }, []);

  useEffect(() => {
    const el = document.activeElement as HTMLElement | null;
    if (el && el.tagName === "INPUT") el.blur();
    const main = mainRef.current;
    if (main) {
      main.style.top = "0px";
      main.style.bottom = "0px";
      main.style.height = "100%";
    }
  }, [screen]);

  useEffect(() => {
    const field = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el?.closest?.("input, textarea, [contenteditable='true']");
    };
    const clear = () => {
      const ae = document.activeElement as HTMLElement | null;
      if (ae && /^(INPUT|TEXTAREA)$/.test(ae.tagName)) return;
      const sel = window.getSelection();
      if (sel && (sel.rangeCount || String(sel))) sel.removeAllRanges();
    };
    let hold = false;
    let raf = 0;
    const pulse = () => {
      clear();
      if (hold) raf = requestAnimationFrame(pulse);
    };
    const down = (e: Event) => {
      if (field(e.target)) return;
      hold = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(pulse);
      const el = e.target as HTMLElement;
      const onBtn = !!el.closest?.("button, [role='button'], a, canvas, label");
      if (onBtn && e.cancelable && e.type === "mousedown") e.preventDefault();
    };
    const up = () => {
      hold = false;
      clear();
      [0, 40, 120, 280, 480, 720].forEach((ms) => window.setTimeout(clear, ms));
    };
    const block = (e: Event) => {
      if (!field(e.target)) e.preventDefault();
    };
    const cap = { capture: true } as const;
    const capBlock = { capture: true, passive: false } as const;
    document.addEventListener("selectstart", block, capBlock);
    document.addEventListener("contextmenu", block, capBlock);
    document.addEventListener("dragstart", block, capBlock);
    document.addEventListener("copy", block, capBlock);
    document.addEventListener("gesturestart", block, capBlock);
    document.addEventListener("mousedown", down, capBlock);
    document.addEventListener("pointerdown", down, cap);
    document.addEventListener("touchstart", down, cap);
    document.addEventListener("mouseup", up, cap);
    document.addEventListener("pointerup", up, cap);
    document.addEventListener("touchend", up, cap);
    document.addEventListener("touchcancel", up, cap);
    document.addEventListener("selectionchange", clear);
    return () => {
      hold = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("selectstart", block, capBlock);
      document.removeEventListener("contextmenu", block, capBlock);
      document.removeEventListener("dragstart", block, capBlock);
      document.removeEventListener("copy", block, capBlock);
      document.removeEventListener("gesturestart", block, capBlock);
      document.removeEventListener("mousedown", down, capBlock);
      document.removeEventListener("pointerdown", down, cap);
      document.removeEventListener("touchstart", down, cap);
      document.removeEventListener("mouseup", up, cap);
      document.removeEventListener("pointerup", up, cap);
      document.removeEventListener("touchend", up, cap);
      document.removeEventListener("touchcancel", up, cap);
      document.removeEventListener("selectionchange", clear);
    };
  }, []);

  const view =
    screen === "boot" ? (
      <Boot />
    ) : screen === "register" ? (
      <Register />
    ) : screen === "gear" ? (
      <Gear />
    ) : screen === "unit" ? (
      <UnitPick />
    ) : screen === "how" ? (
      <How />
    ) : screen === "karma" ? (
      <Karma />
    ) : screen === "stats" ? (
      <StatsScreen />
    ) : screen === "front" ? (
      <Front />
    ) : (
      <Hq />
    );

  return (
    <main
      ref={mainRef}
      className="fixed inset-0 overflow-hidden bg-bg text-fg select-none"
      style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none", userSelect: "none" } as CSSProperties}
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
          e.preventDefault();
        }
      }}
    >
      {screen !== "front" && <MapParallax />}
      {screen !== "front" && <div className="grain" />}
      <svg width="0" height="0" className="absolute">
        <filter id="chalk-disp">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0.8" />
        </filter>
      </svg>
      <div className="relative z-10 h-full">{view}</div>
    </main>
  );
}

function useT() {
  const lang = useArmy((s) => s.lang);
  return I18N[lang];
}

function MapParallax() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (x: number, y: number) => {
      el.style.setProperty("--px", `${x}px`);
      el.style.setProperty("--py", `${y}px`);
    };
    const onPtr = (e: globalThis.PointerEvent) => {
      move((e.clientX / window.innerWidth - 0.5) * 28, (e.clientY / window.innerHeight - 0.5) * 20);
    };
    const onScroll = (e: Event) => {
      const t = e.target as HTMLElement;
      const y = t.scrollTop || 0;
      el.style.setProperty("--py", `${y * -0.08}px`);
    };
    window.addEventListener("pointermove", onPtr);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("pointermove", onPtr);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, []);
  return (
    <div ref={ref} className="map-parallax" aria-hidden>
      <div className="far" />
      <div className="near" />
    </div>
  );
}

function Boot() {
  const copy = useT();
  const go = useArmy((s) => s.go);
  const onboarded = useArmy((s) => s.onboarded);
  const [pct, setPct] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const urls = [...FRONT_ASSETS];
    let done = 0;
    const tick = () => {
      done += 1;
      setPct(Math.round((done / urls.length) * 100));
      if (done >= urls.length) setReady(true);
    };
    urls.forEach((src) => {
      const im = new Image();
      im.onload = tick;
      im.onerror = tick;
      im.src = src;
    });
  }, []);

  return (
    <button
      type="button"
      className="flex h-full w-full flex-col items-center justify-center px-10"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        if (!ready) return;
        click();
        go(onboarded ? "front" : "register");
      }}
    >
      <p className="text-center text-[11px] tracking-[0.38em] text-muted uppercase">{copy.brand}</p>
      <div className="mt-10 h-1.5 w-48 max-w-[70%] bg-fg/15">
        <div className="h-full bg-fg transition-[width] duration-200" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-[11px] tracking-[0.24em] text-muted uppercase">
        {copy.loading} {pct}%
      </p>
      {ready && (
        <p className="mt-8 animate-pulse text-center text-sm tracking-[0.18em] uppercase">{copy.tapContinue}</p>
      )}
    </button>
  );
}

function Register() {
  const copy = useT();
  const callsign = useArmy((s) => s.callsign);
  const lang = useArmy((s) => s.lang);
  const setCallsign = useArmy((s) => s.setCallsign);
  const setLang = useArmy((s) => s.setLang);
  const go = useArmy((s) => s.go);
  const langs: Lang[] = ["ua", "en", "ru", "pl"];
  const [kb, setKb] = useState(false);

  const next = () => {
    if (callsign.trim().length < 2) return;
    unlockAudio();
    click();
    go("gear");
  };

  return (
    <div
      className="relative z-10 h-full overflow-x-hidden overflow-y-auto px-5"
      style={{
        paddingTop: "max(3.25rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className={`mx-auto flex min-h-full w-full max-w-[22rem] flex-col ${kb ? "justify-start pt-2" : "justify-center"}`}>
        <form
          className="flex w-full flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
        <HeaderMark />
        <h1 className="mt-5 text-center text-[1.65rem] font-semibold tracking-[0.18em] uppercase">{copy.register}</h1>
        <Rule className="mx-auto mt-4 w-20" />

        <label className="relative mt-8 block">
          <span className="absolute -top-2 left-3 z-10 bg-bg px-1.5 text-[10px] tracking-[0.22em] text-muted uppercase">
            {copy.callsign}
          </span>
          <span className="flex h-12 items-center chalk-border pl-4 pr-3">
            <Ic.IconRadio size={22} className="shrink-0 text-muted" />
            <span className="relative ml-3 min-h-12 min-w-0 flex-1 self-stretch">
              {!callsign && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center text-[16px] leading-[48px] tracking-[0.16em] text-subtle"
                >
                  ————
                </span>
              )}
              <input
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                onFocus={(e) => {
                  setKb(true);
                  requestAnimationFrame(() => e.currentTarget.scrollIntoView({ block: "center", behavior: "auto" }));
                }}
                onBlur={() => setKb(false)}
                maxLength={16}
                name="cs"
                className="cs-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                enterKeyHint="done"
                inputMode="text"
              />
            </span>
          </span>
        </label>

        <button
          type="button"
          onClick={() => {
            click();
            go("gear");
          }}
          className="mt-3 flex h-12 items-center justify-between chalk-border px-4"
        >
          <span className="flex items-center gap-3">
            <Ic.IconHelm size={22} className="text-muted" />
            <span className="text-base tracking-[0.2em] uppercase">{copy.profile}</span>
          </span>
          <span className="text-xl leading-none text-muted">›</span>
        </button>

        {!kb && (
          <>
            <p className="mt-7 text-center text-[10px] tracking-[0.28em] text-muted uppercase">{copy.pickLang}</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {langs.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    click();
                    setLang(code);
                  }}
                  className={`flex h-12 items-center justify-center text-sm tracking-[0.2em] ${
                    lang === code ? "chalk-border bg-fg/5" : "border border-fg/20"
                  }`}
                >
                  {copy.langs[code]}
                </button>
              ))}
            </div>
          </>
        )}

        <ChalkBtn tone="ghost" className="mt-6 h-12 w-full text-base" disabled={callsign.trim().length < 2} onClick={next}>
          {copy.continue} →
        </ChalkBtn>
        </form>
      </div>
    </div>
  );
}

function Gear({ embedded = false }: { embedded?: boolean }) {
  const copy = useT();
  const role = useArmy((s) => s.role);
  const path = useArmy((s) => s.path);
  const gear = useArmy((s) => s.gear);
  const unit = useArmy((s) => s.unit);
  const setRole = useArmy((s) => s.setRole);
  const setPath = useArmy((s) => s.setPath);
  const setGear = useArmy((s) => s.setGear);
  const go = useArmy((s) => s.go);
  const roles: RoleId[] = ["fighter", "medic", "drone", "comms", "officer"];
  const paths: PathId[] = ["volunteer", "bought", "verified", "mobilized"];
  const kit = ROLE_GEAR[role];

  const cycle = (id: GearId) => {
    const cur = gear[id];
    const i = ORIGIN_CYCLE.indexOf(cur);
    setGear(id, ORIGIN_CYCLE[(i + 1) % ORIGIN_CYCLE.length]);
    click();
  };

  return (
    <div className="relative z-10 flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pt-[max(3.25rem,env(safe-area-inset-top))]">
        <div className="mx-auto w-full max-w-lg">
      <HeaderMark small />
      <h1 className="mt-2 text-center text-3xl font-semibold tracking-[0.16em] uppercase">{copy.gear}</h1>
      <Rule className="mx-auto mt-3 w-16" />
      <div className="mt-4 grid grid-cols-[5.4rem_minmax(0,1fr)_5.4rem] items-start gap-2">
        <div className="flex flex-col gap-2">
          <OriginBox origin={gear.helm} label={copy.gearItem.helm} onClick={() => cycle("helm")}>
            <SlotArt id="helm" />
          </OriginBox>
          <OriginBox origin={gear.armor} label={copy.gearItem.armor} onClick={() => cycle("armor")}>
            <SlotArt id="armor" />
          </OriginBox>
          <OriginBox origin={gear.radio} label={copy.gearItem.radio} onClick={() => cycle("radio")}>
            <SlotArt id="radio" />
          </OriginBox>
        </div>
        <div className="relative min-h-72">
          <KitFigure unit={unit} role={role} gear={gear} />
        </div>
        <div className="flex flex-col gap-2">
          <OriginBox origin={gear.pack} label={copy.gearItem.pack} onClick={() => cycle("pack")}>
            <SlotArt id="pack" />
          </OriginBox>
          <OriginBox origin={gear.roleItem} label={copy.gearItem.roleItem} onClick={() => cycle("roleItem")}>
            <SlotArt id="roleItem" />
          </OriginBox>
          <OriginBox origin={gear.public} label={copy.gearItem.public} onClick={() => cycle("public")}>
            <SlotArt id="public" />
          </OriginBox>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        {GEAR_IDS.filter((id) => onGear(gear[id])).map((id) => (
          <div key={id} className="flex items-center gap-2 chalk-border px-2 py-1.5">
            <img src={SLOT_ART[id]} alt="" className="h-9 w-9 shrink-0 object-contain" draggable={false} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] tracking-[0.16em] uppercase">{copy.gearItem[id]}</p>
              <p className="text-[10px] leading-tight text-muted">{copy.gearSpec[id]}</p>
            </div>
            <span
              className={`shrink-0 text-[9px] tracking-wider uppercase ${
                gear[id] === "bought" ? "text-bought" : gear[id] === "boosted" ? "text-boost" : "text-muted"
              }`}
            >
              {copy.origin[gear[id]]}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[11px] tracking-[0.22em] text-muted uppercase">{copy.recv}</p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {(["earned", "bought", "boosted", "none", "lost"] as Origin[]).map((o) => (
          <div
            key={o}
            className={`flex h-12 items-center justify-center ${
              o === "bought"
                ? "chalk-border-gold text-bought"
                : o === "boosted"
                  ? "chalk-border-red text-boost"
                  : o === "none"
                    ? "chalk-border-blue text-locked"
                    : o === "lost"
                      ? "border border-dashed border-fg/30"
                      : "chalk-border"
            }`}
          >
            <span className="px-1 text-center text-[9px] leading-tight tracking-wider uppercase">{copy.origin[o]}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[11px] tracking-[0.22em] text-muted uppercase">{copy.roleKit}</p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {roles.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              click();
              setRole(r);
            }}
            className={`flex flex-col items-center gap-1 p-2 ${role === r ? "chalk-border bg-fg/5" : "border border-fg/20"}`}
          >
            <RoleGlyph role={r} />
            <span className="text-[9px] leading-tight tracking-wider uppercase">{copy.roles[r]}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 chalk-border px-3 py-2 text-[11px] tracking-wide text-muted">
        {kit.map((id) => copy.gearItem[id]).join(" · ")}
      </div>
      <p className="mt-6 text-center text-[11px] tracking-[0.22em] text-muted uppercase">{copy.startPath}</p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {paths.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              click();
              setPath(p);
            }}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[10px] tracking-wider uppercase ${
              path === p
                ? p === "bought"
                  ? "chalk-border-gold"
                  : p === "verified"
                    ? "chalk-border-red"
                    : "chalk-border bg-fg/5"
                : "border border-fg/20"
            }`}
          >
            {copy.paths[p]}
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-xs leading-relaxed text-muted">{copy.gearNote}</p>
        </div>
      </div>
      {!embedded && (
        <div className="relative z-20 grid shrink-0 grid-cols-2 gap-3 bg-bg/90 px-4 py-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
          <ChalkBtn onClick={() => go("register")}>{copy.back}</ChalkBtn>
          <ChalkBtn
            tone="solid"
            onClick={() => {
              click();
              go("unit");
            }}
          >
            {copy.confirm}
          </ChalkBtn>
        </div>
      )}
    </div>
  );
}

function onGear(origin: Origin) {
  return origin !== "none" && origin !== "lost";
}

function KitFigure({
  unit,
  role,
  gear,
}: {
  unit: string | null;
  role: RoleId;
  gear: Record<GearId, Origin>;
}) {
  const kind = unit === "tank" ? "tank" : unit === "drone" || role === "drone" ? "drone" : "soldier";
  const on = (id: GearId) => onGear(gear[id]);
  return (
    <div className="pointer-events-none relative mx-auto h-full min-h-72 w-full max-w-[13rem]">
      {kind === "tank" ? (
        <>
          <img src="/sprites/unit-tank.png" alt="" className="absolute inset-0 h-full w-full object-contain" />
          {on("armor") && (
            <img src="/sprites/kit-tank-armor.png" alt="" className="absolute inset-[8%] object-contain opacity-95" />
          )}
          {on("radio") && (
            <img src="/sprites/kit-tank-radio.png" alt="" className="absolute top-0 right-2 h-1/3 w-1/3 object-contain" />
          )}
          {(on("pack") || on("public")) && (
            <img src="/sprites/kit-tank-pack.png" alt="" className="absolute bottom-4 left-1 h-1/4 w-1/3 object-contain" />
          )}
        </>
      ) : kind === "drone" ? (
        <>
          <img src="/sprites/unit-drone.png" alt="" className="absolute inset-0 h-full w-full object-contain" />
          {on("radio") && (
            <img src="/sprites/kit-drone-radio.png" alt="" className="absolute top-2 right-2 h-1/3 w-1/3 object-contain" />
          )}
          {on("roleItem") && (
            <img src="/sprites/kit-drone-cam.png" alt="" className="absolute bottom-6 left-1/2 h-1/4 w-1/3 -translate-x-1/2 object-contain" />
          )}
        </>
      ) : (
        <>
          <img src="/sprites/gear/sit-base.png" alt="" className="absolute inset-0 h-full w-full object-contain" />
          {on("pack") && (
            <img
              src="/sprites/wear-pack.png"
              alt=""
              className="absolute top-[46%] right-[-4%] h-[30%] w-[40%] object-contain"
            />
          )}
          {on("armor") && (
            <img
              src="/sprites/wear-armor.png"
              alt=""
              className="absolute top-[24%] left-[18%] h-[26%] w-[52%] object-contain"
            />
          )}
          {(on("helm") || on("armor")) && (
            <img
              src="/sprites/wear-boots.png"
              alt=""
              className="absolute bottom-[1%] left-[6%] h-[18%] w-[58%] object-contain"
            />
          )}
          {on("radio") && (
            <img
              src="/sprites/wear-radio.png"
              alt=""
              className="absolute top-[32%] right-[4%] h-[16%] w-[24%] object-contain"
            />
          )}
          {on("roleItem") && (
            <img
              src="/sprites/kit-medic.png"
              alt=""
              className="absolute bottom-[16%] right-[-2%] h-[22%] w-[30%] object-contain"
            />
          )}
          {on("public") && (
            <img
              src="/sprites/kit-pack.png"
              alt=""
              className="absolute bottom-[8%] left-[-6%] h-[20%] w-[28%] object-contain opacity-90"
            />
          )}
          {on("helm") && (
            <img
              src="/sprites/wear-helm.png"
              alt=""
              className="absolute top-[0%] left-[26%] h-[22%] w-[38%] object-contain"
            />
          )}
        </>
      )}
    </div>
  );
}

function RoleGlyph({ role }: { role: RoleId }) {
  if (role === "medic") return <Ic.IconMedic size={26} />;
  if (role === "drone") return <Ic.IconDrone size={26} />;
  if (role === "comms") return <Ic.IconRadio size={26} />;
  if (role === "officer") return <Ic.IconOfficer size={26} />;
  return <Ic.IconHelm size={26} />;
}

function UnitPick() {
  const copy = useT();
  const unit = useArmy((s) => s.unit);
  const path = useArmy((s) => s.path);
  const setUnit = useArmy((s) => s.setUnit);
  const go = useArmy((s) => s.go);
  return (
    <Scroll>
      <p className="text-center text-[11px] tracking-[0.3em] text-muted">5 · {copy.brand}</p>
      <h1 className="mt-3 text-center text-2xl font-semibold tracking-[0.14em] uppercase">{copy.unitTitle}</h1>
      <p className="mt-2 text-center text-sm text-muted">{copy.unitSub}</p>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-subtle">{copy.unitHint}</p>
      <div className="mt-5 flex flex-col gap-2">
        {UNITS.map((u) => {
          const meta = copy.units[u.id];
          const on = unit === u.id;
          const art = heroArt(u.id, path);
          const craft = u.id === "air" ? (path === "mobilized" ? copy.airEast : copy.airWest) : null;
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                click();
                setUnit(u.id);
              }}
              className={`flex overflow-hidden text-left ${on ? "chalk-border bg-fg/5" : "border border-fg/25"}`}
            >
              <img src={art} alt="" className="h-32 w-40 shrink-0 bg-black object-contain p-1" />
              <span className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2">
                <span className="text-sm font-semibold tracking-[0.12em] uppercase">{meta.name}</span>
                {craft && (
                  <span className="mt-0.5 text-[11px] tracking-[0.16em] text-bought uppercase">{craft}</span>
                )}
                <span className="mt-1 text-[11px] leading-snug text-muted">
                  {copy.rolesLbl}: {meta.blurb}
                </span>
                <span className="mt-1 text-[11px] text-fg/80">{meta.extra}</span>
              </span>
              <span className="flex items-center pr-3 text-xl text-muted">›</span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-[11px] tracking-wider text-subtle uppercase">{copy.daily}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 pb-4">
        <ChalkBtn onClick={() => go("gear")}>{copy.back}</ChalkBtn>
        <ChalkBtn
          tone="solid"
          disabled={!unit}
          onClick={() => {
            click();
            go("how");
          }}
        >
          {copy.continue} →
        </ChalkBtn>
      </div>
      <FooterArt />
    </Scroll>
  );
}

function How() {
  const copy = useT();
  const step = useArmy((s) => s.howStep);
  const setHow = useArmy((s) => s.setHow);
  const go = useArmy((s) => s.go);
  const glyphs = [<Ic.IconRadio key="r" />, <Ic.IconArrows key="a" />, <Ic.IconSkull key="s" />, <Ic.IconDiscipline key="d" />];
  const card = copy.how[step];
  return (
    <Scroll>
      <p className="text-center text-xs tracking-[0.28em] text-muted uppercase">{copy.howTitle}</p>
      {card && (
        <Panel className="mt-8 min-h-64">
          <p className="text-xs tracking-[0.2em] text-muted">{card[2]}</p>
          <div className="mt-6 text-fg">{glyphs[step]}</div>
          <h2 className="mt-4 text-2xl font-semibold tracking-[0.12em] uppercase">{card[0]}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{card[1]}</p>
        </Panel>
      )}
      <div className="mt-6 flex justify-center gap-2">
        {copy.how.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={String(i + 1)}
            onClick={() => setHow(i)}
            className={`size-2 rounded-full ${i === step ? "bg-fg" : "bg-fg/25"}`}
          />
        ))}
      </div>
      <ChalkBtn
        className="mt-8 h-14 w-full"
        tone="solid"
        onClick={() => {
          if (step < 3) setHow(step + 1);
          else {
            click();
            go("karma");
          }
        }}
      >
        {step < 3 ? copy.next : copy.continue} →
      </ChalkBtn>
    </Scroll>
  );
}

function Karma() {
  const copy = useT();
  const go = useArmy((s) => s.go);
  return (
    <Scroll>
      <div className="mx-auto flex max-w-md flex-col items-center px-2 py-6">
        <Ic.IconDoc size={56} />
        <h1 className="mt-4 text-3xl font-semibold tracking-[0.2em] uppercase">{copy.report}</h1>
        <Rule className="mt-5 w-full" />
        <div className="mt-6 space-y-2 text-center text-sm leading-relaxed tracking-wide">
          {copy.reportBody.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <Panel className="mt-8 w-full text-center text-sm leading-relaxed">{copy.karmaHidden}</Panel>
        <div className="mt-8 flex w-full items-center gap-3">
          <Ic.IconDiscipline size={36} className="shrink-0" />
          <p className="text-sm text-muted">{copy.paramsRank}</p>
        </div>
        <div className="mt-5 flex w-full items-center gap-3">
          <Ic.IconPeople size={36} className="shrink-0" />
          <p className="text-sm text-muted">{copy.publicTrail}</p>
        </div>
        <ChalkBtn
          className="mt-10 h-14 w-full"
          onClick={() => {
            click();
            go("stats");
          }}
        >
          {copy.show}
        </ChalkBtn>
      </div>
    </Scroll>
  );
}

function StatsScreen() {
  const copy = useT();
  const stats = useArmy((s) => s.stats);
  const finish = useArmy((s) => s.finishOnboard);
  const rows = [
    { k: copy.trust, v: stats.trust, icon: <Ic.IconHeart size={28} /> },
    { k: copy.reputation, v: stats.reputation, icon: <Ic.IconStar size={28} /> },
    { k: copy.stress, v: stats.stress, icon: <Ic.IconStress size={28} /> },
    { k: copy.authority, v: stats.authority, icon: <Ic.IconDiscipline size={28} /> },
  ];
  return (
    <Scroll>
      <p className="text-center text-xs tracking-[0.28em] text-muted uppercase">{copy.report}</p>
      <h1 className="mt-2 text-center text-3xl font-semibold tracking-[0.12em] uppercase">{copy.statsTitle}</h1>
      <Rule className="mx-auto mt-5 w-32" />
      <div className="mt-8 space-y-6">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center gap-3">
            <span className="text-fg">{r.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-sm tracking-[0.16em] uppercase">{r.k}</p>
                <p className="text-xl tabular-nums">{r.v}</p>
              </div>
              <StatBar value={r.v} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm leading-relaxed text-muted">
        {copy.reportBody.join(" ")}
      </p>
      <Panel className="mt-6 text-center text-sm">{copy.statsFoot}</Panel>
      <ChalkBtn
        className="mt-8 h-14 w-full"
        tone="solid"
        onClick={() => {
          unlockAudio();
          squelch();
          finish();
        }}
      >
        {copy.continue} →
      </ChalkBtn>
    </Scroll>
  );
}

function Hq() {
  const copy = useT();
  const tab = useArmy((s) => s.hqTab);
  const setTab = useArmy((s) => s.setTab);
  const go = useArmy((s) => s.go);
  const mail = useArmy((s) => s.mail);
  const [menu, setMenu] = useState(false);
  const tabs = ["situation", "gear", "squad", "mission", "dossier"] as const;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-fg/20 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <Ic.IconRadio size={28} className="shrink-0 text-fg" />
        <div className="min-w-0 flex-1 overflow-x-auto">
          <nav className="flex gap-1">
            {tabs.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  click();
                  setTab(id);
                }}
                className={`shrink-0 px-2 py-2 text-[11px] tracking-[0.16em] uppercase ${
                  tab === id ? "border-b-2 border-boost text-fg" : "text-muted"
                }`}
              >
                {copy.tabs[id]}
              </button>
            ))}
          </nav>
        </div>
        <button
          type="button"
          aria-label="front"
          className="flex h-10 shrink-0 items-center px-2 text-[11px] tracking-[0.16em] uppercase"
          onClick={() => {
            click();
            go("front");
          }}
        >
          {copy.toFront}
        </button>
        <button type="button" aria-label="settings" className="relative size-10 text-fg" onClick={() => setMenu((v) => !v)}>
          <Settings className="mx-auto size-4" strokeWidth={1.6} />
        </button>
        <button
          type="button"
          aria-label="mail"
          className="relative size-10 text-fg"
          onClick={() => setTab("mission")}
        >
          <Mail className="mx-auto size-4" strokeWidth={1.6} />
          {mail > 0 && <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-boost" />}
        </button>
      </header>
      {menu && <SettingsSheet onClose={() => setMenu(false)} />}
      <div className={`min-h-0 flex-1 ${tab === "radio" ? "overflow-hidden" : "overflow-y-auto overscroll-contain"}`}>
        {tab === "situation" && <Situation />}
        {tab === "gear" && <Gear embedded />}
        {tab === "squad" && <Squad />}
        {tab === "mission" && <Mission />}
        {tab === "dossier" && <Dossier />}
        {tab === "radio" && <Radio />}
      </div>
      <StatusBar />
    </div>
  );
}

function SettingsSheet({ onClose }: { onClose: () => void }) {
  const copy = useT();
  const muted = useArmy((s) => s.muted);
  const toggleMute = useArmy((s) => s.toggleMute);
  const reset = useArmy((s) => s.resetProfile);
  const go = useArmy((s) => s.go);
  return (
    <div className="absolute inset-x-0 top-12 z-20 mx-3 chalk-border bg-bg p-3">
      <ChalkBtn
        className="w-full"
        onClick={() => {
          click();
          onClose();
          go("front");
        }}
      >
        {copy.toFront}
      </ChalkBtn>
      <ChalkBtn
        className="mt-2 w-full"
        onClick={() => {
          toggleMute();
          click();
        }}
      >
        {muted ? copy.unmute : copy.mute}
      </ChalkBtn>
      <ChalkBtn
        className="mt-2 w-full"
        onClick={() => {
          reset();
          onClose();
        }}
      >
        {copy.reset}
      </ChalkBtn>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-2 flex h-10 w-full items-center justify-center text-sm tracking-[0.16em] uppercase chalk-border"
      >
        {copy.github}
      </a>
      <button type="button" className="mt-2 flex h-10 w-full items-center justify-center gap-2 text-sm text-muted" onClick={onClose}>
        <LogOut className="size-3.5" /> {copy.leave}
      </button>
    </div>
  );
}

function Situation() {
  const copy = useT();
  const messages = useArmy((s) => s.messages);
  const setTab = useArmy((s) => s.setTab);
  const go = useArmy((s) => s.go);
  const callsign = useArmy((s) => s.callsign);
  const picked = useArmy((s) => s.unit);
  const recent = messages.slice(-3);
  return (
    <div className="mx-auto grid max-w-6xl gap-3 p-3 md:grid-cols-3">
      <Panel className="min-h-52">
        <Globe />
        <p className="mt-3 text-center text-[11px] tracking-[0.2em] uppercase">{copy.map}</p>
        <div className="mt-2 flex justify-center gap-4 text-[10px] tracking-wider text-muted uppercase">
          <span>■ {copy.opsZone}</span>
          <span>⊕ {copy.lz}</span>
        </div>
      </Panel>
      <Panel>
        <div className="flex items-center justify-between">
          <p className="text-xs tracking-[0.2em] uppercase">{copy.radio}</p>
          <span className="flex items-center gap-1 text-[10px] tracking-wider text-boost">
            <span className="size-1.5 rounded-full bg-boost" /> {copy.onAir}
          </span>
        </div>
        <Ic.IconRadio size={36} className="mx-auto mt-3" />
        <Ic.IconWave className="mx-auto mt-2 h-8 w-40 text-fg/80" />
        <ul className="mt-3 space-y-2 font-mono text-xs">
          {recent.map((m) => (
            <li key={m.id} className="flex gap-2">
              <Dot tone={m.entry} />
              <span className="text-muted">{m.at}</span>
              <span className="tracking-wider">{m.who}</span>
              <span className="min-w-0 flex-1 truncate text-muted">{m.text}</span>
            </li>
          ))}
        </ul>
        <ChalkBtn className="mt-4 w-full" onClick={() => useArmy.getState().setTab("radio")}>
          {copy.openChannel}
        </ChalkBtn>
      </Panel>
      <Panel>
        <p className="text-center text-xs tracking-[0.22em] uppercase">{copy.mission}</p>
        <p className="mt-4 text-center text-sm leading-relaxed text-fg/90">“{QUOTE_UA}”</p>
        <p className="mt-2 text-center text-[11px] tracking-wider text-muted uppercase">— {QUOTE_BY}</p>
        <div className="mt-4 space-y-2 text-xs tracking-wide text-muted">
          <p className="flex items-start gap-2">
            <Ic.IconTarget size={16} />
            <span>
              {copy.goal}: {copy.units[picked ?? "infantry"].extra}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Ic.IconPin size={16} />
            <span>
              {copy.area}: {callsign || "B-12"}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Ic.IconClock size={16} />
            <span>
              {copy.time}: 04:00–06:10
            </span>
          </p>
        </div>
        <ChalkBtn className="mt-4 w-full" tone="solid" onClick={() => go("front")}>
          {copy.toFront} →
        </ChalkBtn>
      </Panel>
    </div>
  );
}

function Globe() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[16rem]">
      <svg viewBox="0 0 200 200" className="h-full w-full text-fg">
        <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        <circle cx="100" cy="100" r="52" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <line
            key={a}
            x1="100"
            y1="22"
            x2="100"
            y2="178"
            stroke="currentColor"
            strokeWidth="0.4"
            opacity="0.25"
            transform={`rotate(${a} 100 100)`}
          />
        ))}
        <ellipse cx="100" cy="100" rx="78" ry="28" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
        <ellipse cx="100" cy="100" rx="78" ry="55" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
        <path
          d="M108 78c6 1 10 6 9 12-2 8-8 12-14 14-4 1-8-2-9-6 0-6 4-14 8-18 2-1 4-2 6-2z"
          fill="currentColor"
          opacity="0.95"
        />
        <circle cx="132" cy="86" r="2.4" fill="#c4453a" />
      </svg>
    </div>
  );
}

function Radio() {
  const copy = useT();
  const lang = useArmy((s) => s.lang);
  const channel = useArmy((s) => s.channel);
  const setChannel = useArmy((s) => s.setChannel);
  const messages = useArmy((s) => s.messages);
  const ptt = useArmy((s) => s.ptt);
  const setPtt = useArmy((s) => s.setPtt);
  const pushMsg = useArmy((s) => s.pushMsg);
  const callsign = useArmy((s) => s.callsign) || copy.callsignPh;
  const role = useArmy((s) => s.role);
  const path = useArmy((s) => s.path);
  const muted = useArmy((s) => s.muted);
  const listRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<VoiceHandle | null>(null);
  const closingRef = useRef(false);
  const autoRef = useRef(0);
  const [heard, setHeard] = useState("");
  const [miss, setMiss] = useState(false);
  const chans: Channel[] = ["platoon", "medic", "commander"];
  const visible = messages.filter((m) => m.channel === channel);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [visible.length, channel]);

  const send = (text: string) => {
    const line = text.replace(/\s+/g, " ").trim();
    if (!line) return;
    unlockAudio();
    if (!muted) squelch();
    pushMsg({
      who: callsign,
      role,
      text: line.toUpperCase(),
      channel,
      entry: path === "bought" ? "bought" : path === "verified" ? "boosted" : "open",
      originEarned: path === "volunteer" || path === "mobilized",
      originBought: path === "bought",
      originBoosted: path === "verified",
      self: true,
    });
  };

  const endTalk = async () => {
    if (closingRef.current) return;
    closingRef.current = true;
    window.clearTimeout(autoRef.current);
    setPtt(false);
    const handle = voiceRef.current;
    voiceRef.current = null;
    const text = handle ? await handle.stop() : "";
    closingRef.current = false;
    if (text) {
      setMiss(false);
      setHeard("");
      send(text);
    } else {
      setMiss(true);
      setHeard("");
    }
  };

  const beginTalk = (e: PointerEvent<HTMLButtonElement>) => {
    if (voiceRef.current || closingRef.current) return;
    unlockAudio();
    const handle = startVoice(speechLang(lang), setHeard);
    voiceRef.current = handle;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* */
    }
    click();
    setMiss(false);
    setHeard("");
    setPtt(true);
    autoRef.current = window.setTimeout(() => {
      void endTalk();
    }, VOICE_MAX_MS);
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ic.IconRadio size={28} className="text-fg/80" />
          <div>
            <p className="text-[10px] tracking-[0.2em] text-muted">{copy.brand}</p>
            <h2 className="text-xl tracking-[0.16em] uppercase">{copy.sub}</h2>
          </div>
        </div>
        <button
          type="button"
          className="text-xs tracking-[0.16em] text-muted uppercase"
          onClick={() => useArmy.getState().setTab("situation")}
        >
          {copy.back}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3">
        {chans.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              click();
              setChannel(c);
            }}
            className={`h-10 text-xs tracking-[0.16em] uppercase ${
              channel === c ? "chalk-border bg-fg/5" : "border border-fg/20 text-muted"
            }`}
          >
            {copy.channels[c]}
          </button>
        ))}
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 md:grid md:grid-cols-[1fr_14rem]">
        <div ref={listRef} className="chalk-border min-h-0 flex-1 overflow-y-auto p-3">
          {visible.map((m) => (
            <div key={m.id} className="mb-4 flex gap-2">
              <div className="flex size-10 shrink-0 items-center justify-center border border-fg/30">
                <RoleGlyph role={m.role} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm tracking-[0.14em] uppercase">{m.who}</p>
                  <LetterMark kind="earn" on={m.originEarned && !m.self} />
                  <LetterMark kind="buy" on={m.originBought && !m.self} />
                  <LetterMark kind="boost" on={m.originBoosted && !m.self} />
                  <Dot tone={m.entry} />
                  <span className="ml-auto font-mono text-[10px] text-muted">{m.at}</span>
                </div>
                <p className="mt-1 inline-block border border-fg/25 px-2 py-1 text-sm tracking-wide">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
        <Panel className="hidden h-fit md:block">
          <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
            {copy.members} ({SQUAD.length})
          </p>
          <ul className="mt-2 space-y-2">
            {SQUAD.map((s) => (
              <li key={s.who} className="flex items-center gap-2 text-sm">
                <RoleGlyph role={s.role} />
                <span className="tracking-[0.12em] uppercase">{s.who}</span>
                <LetterMark kind="earn" on={s.originEarned} />
                <LetterMark kind="buy" on={s.originBought} />
                <LetterMark kind="boost" on={s.originBoosted} />
                <span className="ml-auto">
                  <Dot tone={s.entry} />
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <div className="mt-3 chalk-border flex flex-wrap items-center justify-center gap-4 px-3 py-2 text-[11px] tracking-wider uppercase">
        <span>
          Ä {copy.legendEarn} <Dot tone="open" />
        </span>
        <span className="text-bought">
          Ä {copy.legendBuy} <Dot tone="bought" />
        </span>
        <span className="text-boost">
          Ӧ {copy.legendBoost} <Dot tone="boosted" />
        </span>
      </div>
      <div className="mt-3 flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                className="border border-fg/25 px-2 py-1 text-[10px] tracking-wider"
                onClick={() => send(q)}
              >
                {q}
              </button>
            ))}
          </div>
          <Ic.IconWave className={`h-10 w-full ${ptt ? "text-fg" : "text-fg/40"}`} />
          <p className="mt-1 min-h-5 text-[11px] tracking-[0.14em] uppercase text-fg/80">
            {ptt ? heard || copy.listening : miss ? copy.voiceMiss : "\u00a0"}
          </p>
        </div>
        <button
          type="button"
          className={`flex size-20 shrink-0 flex-col items-center justify-center rounded-full border-2 touch-none select-none ${
            ptt ? "border-fg bg-fg/10" : "border-fg/50"
          }`}
          onPointerDown={beginTalk}
          onPointerUp={() => void endTalk()}
          onPointerCancel={() => void endTalk()}
          onClick={(e) => e.preventDefault()}
        >
          <Ic.IconMic size={28} />
        </button>
      </div>
      <p className="mt-1 text-center text-[10px] tracking-[0.2em] text-muted uppercase">{copy.ptt}</p>
    </div>
  );
}

function Squad() {
  const copy = useT();
  const callsign = useArmy((s) => s.callsign) || copy.callsignPh;
  const role = useArmy((s) => s.role);
  return (
    <div className="p-3">
      <Panel>
        <p className="text-xs tracking-[0.2em] uppercase">{copy.roster}</p>
        <ul className="mt-3 space-y-3">
          <li className="flex items-center gap-3">
            <RoleGlyph role={role} />
            <span className="tracking-[0.14em] uppercase">{callsign}</span>
            <span className="text-[11px] text-muted">{copy.you}</span>
          </li>
          {SQUAD.map((s) => (
            <li key={s.who} className="flex items-center gap-3">
              <RoleGlyph role={s.role} />
              <span className="tracking-[0.14em] uppercase">{s.who}</span>
              <LetterMark kind="earn" on={s.originEarned} />
              <LetterMark kind="buy" on={s.originBought} />
              <LetterMark kind="boost" on={s.originBoosted} />
              <span className="ml-auto">
                <Dot tone={s.entry} />
              </span>
            </li>
          ))}
        </ul>
      </Panel>
      <img src="/art/squad-line.jpg" alt="" className="mt-4 w-full object-contain" />
    </div>
  );
}

function Mission() {
  const copy = useT();
  const role = useArmy((s) => s.role);
  const idx = useArmy((s) => s.missionIndex);
  const last = useArmy((s) => s.lastOutcome);
  const applyDelta = useArmy((s) => s.applyDelta);
  const setOutcome = useArmy((s) => s.setOutcome);
  const nextMission = useArmy((s) => s.nextMission);
  const resetMissions = useArmy((s) => s.resetMissions);
  const list = useMemo(() => missionsFor(role), [role]);
  const m = list[idx];

  if (!m) {
    return (
      <div className="p-4">
        <Panel className="text-center">
          <Ic.IconTarget size={40} className="mx-auto" />
          <p className="mt-4 text-lg tracking-[0.14em] uppercase">{copy.complete}</p>
          <ChalkBtn className="mt-6 w-full" onClick={resetMissions}>
            {copy.newOp}
          </ChalkBtn>
        </Panel>
      </div>
    );
  }

  if (last) {
    return (
      <div className="p-4">
        <Panel className="text-center">
          <p className="text-xs tracking-[0.22em] text-muted uppercase">{copy.consequence}</p>
          <Ic.IconSkull size={48} className="mx-auto mt-4" />
          <p className="mt-4 text-sm leading-relaxed">{last}</p>
          <ChalkBtn
            className="mt-6 w-full"
            tone="solid"
            onClick={() => {
              click();
              nextMission();
            }}
          >
            {copy.next} →
          </ChalkBtn>
        </Panel>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Panel>
        <p className="text-xs tracking-[0.22em] text-muted uppercase">
          {copy.mission} · {copy.channels[m.channel]}
        </p>
        <h2 className="mt-2 text-2xl tracking-[0.14em] uppercase">{m.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{m.body}</p>
        <div className="mt-5 flex flex-col gap-2">
          {m.choices.map((c, i) => (
            <ChalkBtn
              key={c.id}
              className="h-auto min-h-12 w-full py-3 text-left"
              onClick={() => {
                unlockAudio();
                if (!useArmy.getState().muted) rx();
                applyDelta(c.delta);
                setOutcome(c.outcome);
              }}
            >
              {String.fromCharCode(65 + i)}. {c.label}
            </ChalkBtn>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Dossier() {
  const copy = useT();
  const callsign = useArmy((s) => s.callsign);
  const role = useArmy((s) => s.role);
  const unit = useArmy((s) => s.unit);
  const path = useArmy((s) => s.path);
  const gear = useArmy((s) => s.gear);
  const officer = role === "officer";
  const stats = useArmy((s) => s.stats);
  return (
    <div className="space-y-3 p-3">
      <Panel>
        <p className="text-xs tracking-[0.2em] uppercase">{copy.dossier}</p>
        <p className="mt-2 text-2xl tracking-[0.16em] uppercase">{callsign || copy.callsignPh}</p>
        <p className="mt-1 text-sm text-muted">
          {copy.roles[role]}
          {unit ? ` · ${copy.units[unit].name}` : ""}
        </p>
        <p className="mt-1 text-xs tracking-wider text-muted uppercase">{copy.paths[path]}</p>
      </Panel>
      <Panel>
        <p className="text-xs tracking-[0.18em] uppercase">{copy.publicTrail}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {GEAR_IDS.map((id) => (
            <OriginBox key={id} origin={gear[id]} label={copy.gearItem[id]}>
              <SlotArt id={id} />
            </OriginBox>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">{copy.othersSee}</p>
      </Panel>
      <Panel>
        <p className="text-xs tracking-[0.18em] uppercase">{copy.statsTitle}</p>
        {officer ? (
          <div className="mt-4 space-y-3">
            {(
              [
                [copy.trust, stats.trust],
                [copy.reputation, stats.reputation],
                [copy.stress, stats.stress],
                [copy.authority, stats.authority],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-sm">
                  <span>{k}</span>
                  <span className="tabular-nums">{v}</span>
                </div>
                <StatBar value={v} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {copy.paramsRank} {copy.youDont}
          </p>
        )}
      </Panel>
      <div className="grid grid-cols-3 gap-2">
        <Panel className="flex flex-col items-center gap-1 py-3">
          <Ic.IconReliable size={28} />
          <span className="text-[10px] tracking-wider uppercase">{copy.legendEarn}</span>
        </Panel>
        <Panel className="flex flex-col items-center gap-1 py-3">
          <Ic.IconSavior size={28} />
          <span className="text-[10px] tracking-wider uppercase">{copy.origin.earned}</span>
        </Panel>
        <Panel className="flex flex-col items-center gap-1 py-3">
          <Ic.IconRisk size={28} />
          <span className="text-[10px] tracking-wider uppercase">{copy.origin.boosted}</span>
        </Panel>
      </div>
    </div>
  );
}

function StatusBar() {
  const copy = useT();
  const stats = useArmy((s) => s.stats);
  const lvl = stats.stress > 70 ? 4 : stats.stress > 40 ? 3 : 2;
  return (
    <div className="grid grid-cols-3 gap-y-1 border-t border-fg/20 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[10px] tracking-wider text-muted uppercase sm:grid-cols-6">
      <span>
        {copy.safety}: {copy.level} {lvl}
      </span>
      <span>
        {copy.comms}: <span className="text-ok">{copy.stable}</span>
      </span>
      <span>
        {copy.roster}: 6/6
      </span>
      <span>
        {copy.state}: <span className="text-ok">{copy.ready}</span>
      </span>
      <span>{copy.kit}: 100%</span>
      <span>
        {copy.weather}: 14°
      </span>
    </div>
  );
}

function HeaderMark({ small }: { small?: boolean }) {
  const copy = useT();
  return (
    <div className="flex flex-col items-center">
      <Ic.IconRadio size={small ? 22 : 36} className="text-fg/80" />
      <p className={`mt-2 tracking-[0.32em] text-muted uppercase ${small ? "text-[10px]" : "text-xs"}`}>{copy.brand}</p>
    </div>
  );
}

function FooterArt() {
  return (
    <div className="mt-8 flex items-end justify-between px-2 pb-2">
      <img src="/art/squad-line.jpg" alt="" className="h-16 w-24 object-contain object-left opacity-80" />
      <Ic.IconWave className="h-8 w-32 text-fg/50" />
      <Ic.IconRadio size={28} className="text-fg/70" />
    </div>
  );
}

function Scroll({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 h-full overflow-x-hidden overflow-y-auto overscroll-contain px-4 pt-[max(3.25rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-lg">{children}</div>
    </div>
  );
}
