import { create } from "zustand";
import { DEFAULT_STATS, LINES, SQUAD, UNITS, isUnitId, originsForPath } from "./data";
import type {
  Channel,
  ChatMsg,
  GearId,
  HqTab,
  Lang,
  Origin,
  PathId,
  RoleId,
  Screen,
  Stats,
  UnitId,
} from "./types";

const KEY = "army-now-ua-v1";

export type ArmyState = {
  screen: Screen;
  hqTab: HqTab;
  lang: Lang;
  callsign: string;
  role: RoleId;
  path: PathId;
  unit: UnitId | null;
  gear: Record<GearId, Origin>;
  stats: Stats;
  onboarded: boolean;
  howStep: number;
  channel: Channel;
  messages: ChatMsg[];
  muted: boolean;
  ptt: boolean;
  missionIndex: number;
  lastOutcome: string | null;
  mail: number;
  clock: string;
};

type Actions = {
  setLang: (lang: Lang) => void;
  setCallsign: (v: string) => void;
  setRole: (role: RoleId) => void;
  setPath: (path: PathId) => void;
  setUnit: (unit: UnitId) => void;
  setGear: (id: GearId, origin: Origin) => void;
  go: (screen: Screen) => void;
  setTab: (tab: HqTab) => void;
  finishOnboard: () => void;
  applyDelta: (d: Partial<Stats>) => void;
  setOutcome: (s: string | null) => void;
  nextMission: () => void;
  resetMissions: () => void;
  setHow: (n: number) => void;
  setChannel: (c: Channel) => void;
  pushMsg: (msg: Omit<ChatMsg, "id" | "at">) => void;
  tickNet: () => void;
  setPtt: (v: boolean) => void;
  toggleMute: () => void;
  resetProfile: () => void;
};

function stamp(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

const seedMsgs = (): ChatMsg[] => {
  const lines = ["ПРИЙОМ", "ТРИМАЄМО ПОЗИЦІЮ", "ПОТРІБНА ЕВАКУАЦІЯ", "БАЧУ ДРОН", "ЙДУ НА ЗВ'ЯЗОК", "ПРИЙНЯВ"];
  const channels: Channel[] = ["platoon", "platoon", "medic", "platoon", "platoon", "platoon"];
  return SQUAD.map((s, i) => ({
    ...s,
    id: `s${i}`,
    text: lines[i] ?? "ПРИЙОМ",
    at: `12:${31 + i}`,
    channel: channels[i] ?? "platoon",
  }));
};

const initial = (): ArmyState => ({
  screen: "boot",
  hqTab: "situation",
  lang: "ua",
  callsign: "",
  role: "fighter",
  path: "volunteer",
  unit: null,
  gear: originsForPath("volunteer", "fighter"),
  stats: { ...DEFAULT_STATS },
  onboarded: false,
  howStep: 0,
  channel: "platoon",
  messages: seedMsgs(),
  muted: false,
  ptt: false,
  missionIndex: 0,
  lastOutcome: null,
  mail: 1,
  clock: stamp(),
});

function load(): ArmyState {
  const base = initial();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<ArmyState> & { unit?: unknown };
    const legacy: Record<string, ArmyState["unit"]> = {
      assault: "infantry",
      bpla: "drone",
      other: "artillery",
    };
    let unit = p.unit;
    if (typeof unit === "string" && unit in legacy) unit = legacy[unit];
    if (!isUnitId(unit)) unit = null;
    return { ...base, ...p, unit, screen: "boot", ptt: false, lastOutcome: null, clock: stamp() };
  } catch {
    return base;
  }
}

export const useArmy = create<ArmyState & Actions>((set, get) => ({
  ...load(),
  setLang: (lang) => set({ lang }),
  setCallsign: (callsign) => set({ callsign: callsign.slice(0, 16).toUpperCase() }),
  setRole: (role) => set({ role, gear: originsForPath(get().path, role) }),
  setPath: (path) => set({ path, gear: originsForPath(path, get().role) }),
  setUnit: (unit) => {
    const spec = UNITS.find((u) => u.id === unit);
    const role = spec?.role ?? get().role;
    set({ unit, role, gear: originsForPath(get().path, role) });
  },
  setGear: (id, origin) => set({ gear: { ...get().gear, [id]: origin } }),
  go: (screen) => set({ screen }),
  setTab: (hqTab) => set((s) => ({ hqTab, mail: hqTab === "mission" ? 0 : s.mail })),
  finishOnboard: () => set({ onboarded: true, screen: "front", hqTab: "situation" }),
  applyDelta: (d) =>
    set((s) => {
      const stats = { ...s.stats };
      (Object.keys(d) as (keyof Stats)[]).forEach((k) => {
        const v = d[k];
        if (typeof v === "number") stats[k] = Math.max(0, Math.min(99, stats[k] + v));
      });
      return { stats };
    }),
  setOutcome: (lastOutcome) => set({ lastOutcome }),
  nextMission: () => set((s) => ({ missionIndex: s.missionIndex + 1, lastOutcome: null })),
  resetMissions: () => set({ missionIndex: 0, lastOutcome: null, mail: 1 }),
  setHow: (howStep) => set({ howStep }),
  setChannel: (channel) => set({ channel }),
  pushMsg: (msg) =>
    set((s) => ({
      messages: [...s.messages.slice(-40), { ...msg, id: uid(), at: stamp() }],
    })),
  tickNet: () => {
    const s = get();
    if (s.screen !== "hq") return;
    const pool = LINES[s.channel];
    const who = SQUAD[Math.floor(Math.random() * SQUAD.length)];
    const text = pool[Math.floor(Math.random() * pool.length)];
    get().pushMsg({
      who: who.who,
      role: who.role,
      text,
      channel: s.channel,
      entry: who.entry,
      originEarned: who.originEarned,
      originBought: who.originBought,
      originBoosted: who.originBoosted,
    });
    set({ clock: stamp() });
  },
  setPtt: (ptt) => set({ ptt }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  resetProfile: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(KEY);
      } catch {
        /* ignore */
      }
    }
    set({ ...initial(), messages: seedMsgs() });
  },
}));

useArmy.subscribe((s) => {
  if (typeof window === "undefined") return;
  const snap: ArmyState = {
    screen: s.screen,
    hqTab: s.hqTab,
    lang: s.lang,
    callsign: s.callsign,
    role: s.role,
    path: s.path,
    unit: s.unit,
    gear: s.gear,
    stats: s.stats,
    onboarded: s.onboarded,
    howStep: s.howStep,
    channel: s.channel,
    messages: s.messages,
    muted: s.muted,
    ptt: false,
    missionIndex: s.missionIndex,
    lastOutcome: s.lastOutcome,
    mail: s.mail,
    clock: s.clock,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(snap));
  } catch {
    /* ignore */
  }
});
