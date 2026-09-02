import { create } from "zustand";
import { FLIGHT_SECONDS, RADIO_LINES } from "./constants";

export type HudContact = {
  id: string;
  name: string;
  kind: string;
  dist: number;
  grid: string;
  vehicle: boolean;
};

export type HudSnapshot = {
  phase: "brief" | "flight" | "strike" | "result";
  result: "hit" | "miss" | "crash" | "timeout" | null;
  altitude: number;
  speedKmh: number;
  battery: number;
  heading: number;
  timeLeft: number;
  grid: string;
  lat: number;
  lon: number;
  wireframe: boolean;
  night: boolean;
  lockedId: string | null;
  ping: number;
  radio: { who: string; text: string }[];
  targets: { id: string; name: string; kind: string; dist: number; grid: string }[];
  contacts: HudContact[];
  kills: number;
  infantryAlive: number;
  vehicleAlive: number;
  remaining: number;
  shake: number;
};

const empty: HudSnapshot = {
  phase: "brief",
  result: null,
  altitude: 36,
  speedKmh: 0,
  battery: 76,
  heading: 0,
  timeLeft: FLIGHT_SECONDS,
  grid: "F8",
  lat: 48.3792,
  lon: 37.8021,
  wireframe: false,
  night: false,
  lockedId: null,
  ping: 36,
  radio: RADIO_LINES.slice(0, 2).map(({ who, text }) => ({ who, text })),
  targets: [],
  contacts: [],
  kills: 0,
  infantryAlive: 0,
  vehicleAlive: 0,
  remaining: 0,
  shake: 0,
};

export const useHud = create<HudSnapshot>(() => empty);

export function setHud(partial: Partial<HudSnapshot>) {
  useHud.setState(partial);
}

export function flushHud() {
  // Filled from sim at runtime to avoid a circular import at module init.
  flushHudImpl?.();
}

let flushHudImpl: (() => void) | null = null;

export function registerFlush(fn: () => void) {
  flushHudImpl = fn;
}
