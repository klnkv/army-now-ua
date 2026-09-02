export const WORLD = 400;
export const SEGMENTS = 80;
export const WATER_LEVEL = 3.6;
export const FLIGHT_SECONDS = 15;
export const CRUISE_SPEED = 28;
export const BOOST_SPEED = 42;
export const ACCEL = 36;
export const YAW_RATE = 1.85;
export const PITCH_RATE = 1.35;
export const MOUSE_SENS = 0.00215;
export const TOUCH_LOOK = 1.55;
export const CLIMB_RATE = 18;
export const MIN_ALT = 2.4;
export const CRASH_VY = -16;
export const CRASH_IMPACT = 34;
export const LOCK_DOT = 0.93;
export const LOCK_RANGE = 210;
export const STRIKE_RANGE = 78;
export const KAMIKAZE_RANGE = 9;
export const TIMEOUT_RANGE = 110;
export const SPLASH_RADIUS = 18;

export const START = {
  x: 8,
  y: 36,
  z: 34,
  yaw: 0,
  pitch: -0.78,
};

export type TargetDef = {
  id: string;
  name: string;
  kind: string;
  x: number;
  z: number;
};

export const TARGETS: TargetDef[] = [
  { id: "t1", name: "ЦІЛЬ 1", kind: "ПІХОТА", x: -18, z: -22 },
  { id: "t2", name: "ЦІЛЬ 2", kind: "ТЕХНІКА", x: 62, z: -48 },
  { id: "t3", name: "ЦІЛЬ 3", kind: "СКЛАД", x: 14, z: -96 },
  { id: "t4", name: "ЦІЛЬ 4", kind: "ПТРК", x: -72, z: -58 },
];

export const RADIO_LINES = [
  { t: 0, who: "КОМАНДИР", text: "ДРОН В НЕБІ. ПІХОТА В СЕКТОРІ." },
  { t: 1.4, who: "РОЗВІДНИК", text: "КОЛОНА ТЕХНІКИ НА ДОРОЗІ." },
  { t: 3.2, who: "МЕДИК", text: "НУЖНА ЕВАКУАЦІЯ." },
  { t: 5.0, who: "СЕРЖАНТ", text: "ТАНК І БТР РУХАЮТЬСЯ НА В." },
  { t: 7.2, who: "СИСТЕМА", text: "БАТАРЕЯ КРИТИЧНА." },
  { t: 9.4, who: "КОМАНДИР", text: "УДАР ПО ЖИВІЙ ЦІЛІ." },
];
