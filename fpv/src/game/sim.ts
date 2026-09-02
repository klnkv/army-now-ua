import {
  ACCEL,
  BOOST_SPEED,
  CLIMB_RATE,
  CRASH_IMPACT,
  CRASH_VY,
  CRUISE_SPEED,
  FLIGHT_SECONDS,
  KAMIKAZE_RANGE,
  LOCK_DOT,
  LOCK_RANGE,
  MIN_ALT,
  MOUSE_SENS,
  START,
  STRIKE_RANGE,
  SPLASH_RADIUS,
  TIMEOUT_RANGE,
  TOUCH_LOOK,
  WORLD,
  YAW_RATE,
} from "./constants";
import { gridLabel, heightAt, placedTargets, type PlacedTarget } from "./terrain";
import { flushHud } from "./hud-store";
import { resetUnits, spawnUnits, stepUnits, unitRadius, type Unit } from "./units";

export type Phase = "brief" | "flight" | "strike" | "result";
export type Result = "hit" | "miss" | "crash" | "timeout" | null;

type Explosion = {
  active: boolean;
  x: number;
  y: number;
  z: number;
  t: number;
};

export const sim = {
  phase: "brief" as Phase,
  result: null as Result,
  x: START.x,
  y: START.y,
  z: START.z,
  yaw: START.yaw,
  pitch: START.pitch,
  roll: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  speed: 0,
  timeLeft: FLIGHT_SECONDS,
  flightAge: 0,
  wireframe: false,
  night: false,
  alive: true,
  lockedId: null as string | null,
  shake: 0,
  strikeArmed: false,
  targets: [] as PlacedTarget[],
  units: [] as Unit[],
  kills: 0,
  explosion: { active: false, x: 0, y: 0, z: 0, t: 0 } as Explosion,
  fx: 0,
  fy: 0,
  fz: -1,
};

const keys = new Set<string>();
let qaKeys: string[] | null = null;
let steerOverride: number | null = null;
let lookDx = 0;
let lookDy = 0;
let touchMoveX = 0;
let touchMoveY = 0;
let touchLookX = 0;
let touchLookY = 0;
let touchClimb = 0;
let strikeQueued = false;
let toggleWire = false;
let toggleNight = false;
let listenersBound = false;
let audio: {
  ctx: AudioContext;
  osc: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
} | null = null;

export const touchState = {
  moveX: 0,
  moveY: 0,
  lookX: 0,
  lookY: 0,
  setMove(x: number, y: number) {
    touchMoveX = x;
    touchMoveY = y;
    this.moveX = x;
    this.moveY = y;
  },
  setLook(x: number, y: number) {
    touchLookX = x;
    touchLookY = y;
    this.lookX = x;
    this.lookY = y;
  },
  setClimb(v: number) {
    touchClimb = v;
  },
  queueStrike() {
    strikeQueued = true;
  },
};

function activeCodes(): Set<string> {
  if (qaKeys) return new Set(qaKeys);
  return keys;
}

function radialDeadzone(x: number, y: number, dz = 0.16): { x: number; y: number } {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

function pollGamepad(
  throttle: { v: number },
  steer: { v: number },
  climb: { v: number },
  boost: { v: boolean },
) {
  const pads = typeof navigator !== "undefined" ? navigator.getGamepads() : [];
  const gp = pads[0];
  if (!gp) return;
  const stick = radialDeadzone(gp.axes[0] ?? 0, gp.axes[1] ?? 0);
  throttle.v += -stick.y;
  steer.v += -stick.x;
  const look = radialDeadzone(gp.axes[2] ?? 0, gp.axes[3] ?? 0, 0.12);
  lookDx += look.x * 14;
  lookDy += look.y * 14;
  if (gp.buttons[6]?.pressed || gp.buttons[7]?.pressed) boost.v = true;
  if (gp.buttons[0]?.pressed) climb.v += 1;
  if (gp.buttons[1]?.pressed) climb.v -= 1;
  if (gp.buttons[2]?.pressed) strikeQueued = true;
}

export function getActions() {
  const k = activeCodes();
  const throttle = { v: 0 };
  const steer = { v: 0 };
  const climb = { v: 0 };
  const boost = { v: false };

  if (k.has("KeyW") || k.has("ArrowUp")) throttle.v += 1;
  if (k.has("KeyS") || k.has("ArrowDown")) throttle.v -= 1;
  throttle.v += -touchMoveY;

  if (steerOverride !== null) {
    steer.v = steerOverride;
  } else {
    if (k.has("KeyA") || k.has("ArrowLeft")) steer.v += 1;
    if (k.has("KeyD") || k.has("ArrowRight")) steer.v -= 1;
    steer.v += -touchMoveX;
  }

  if (k.has("Space") || k.has("KeyE")) climb.v += 1;
  if (k.has("KeyC") || k.has("KeyQ") || k.has("ControlLeft")) climb.v -= 1;
  climb.v += touchClimb;

  if (k.has("ShiftLeft") || k.has("ShiftRight")) boost.v = true;

  pollGamepad(throttle, steer, climb, boost);

  return {
    throttle: Math.max(-1, Math.min(1, throttle.v)),
    steer: Math.max(-1, Math.min(1, steer.v)),
    climb: Math.max(-1, Math.min(1, climb.v)),
    boost: boost.v,
    lookMx: lookDx + touchLookX * 18,
    lookMy: lookDy + touchLookY * 18,
  };
}

const GAME_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "Space",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ShiftLeft",
  "ShiftRight",
  "ControlLeft",
  "KeyQ",
  "KeyE",
  "KeyC",
  "KeyF",
  "KeyV",
  "KeyN",
]);

function onKeyDown(e: KeyboardEvent) {
  if (e.repeat) {
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    return;
  }
  keys.add(e.code);
  if (GAME_KEYS.has(e.code)) e.preventDefault();
  if (e.code === "KeyV") toggleWire = true;
  if (e.code === "KeyN") toggleNight = true;
  if (e.code === "KeyF") strikeQueued = true;
}

function onKeyUp(e: KeyboardEvent) {
  keys.delete(e.code);
}

function onBlur() {
  keys.clear();
  lookDx = 0;
  lookDy = 0;
}

function onMouseMove(e: MouseEvent) {
  if (typeof document === "undefined") return;
  if (document.pointerLockElement) {
    lookDx += e.movementX;
    lookDy += e.movementY;
  }
}

function onMouseDown(e: MouseEvent) {
  if (sim.phase !== "flight") return;
  if (e.button !== 0) return;
  if (typeof document !== "undefined" && document.pointerLockElement) {
    strikeQueued = true;
  }
}

export function bindInput() {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onBlur);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mousedown", onMouseDown);
}

export function unbindInput() {
  if (!listenersBound || typeof window === "undefined") return;
  listenersBound = false;
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("blur", onBlur);
  document.removeEventListener("visibilitychange", onBlur);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mousedown", onMouseDown);
}

let spawnTemplate: Unit[] = [];

export function initWorld() {
  spawnTemplate = spawnUnits();
  sim.units = spawnUnits();
  sim.targets = placedTargets();
  resetDrone();
  sim.phase = "brief";
  sim.result = null;
  flushHud();
}

export function resetDrone(opts?: { keepUnits?: boolean }) {
  sim.x = START.x;
  sim.y = START.y;
  sim.z = START.z;
  sim.yaw = START.yaw;
  sim.pitch = START.pitch;
  sim.roll = 0;
  sim.vx = 0;
  sim.vy = 0;
  sim.vz = 0;
  sim.speed = 0;
  sim.timeLeft = FLIGHT_SECONDS;
  sim.flightAge = 0;
  sim.alive = true;
  sim.lockedId = null;
  sim.shake = 0;
  sim.explosion.active = false;
  sim.fx = -Math.sin(sim.yaw);
  sim.fy = 0;
  sim.fz = -Math.cos(sim.yaw);
  if (!opts?.keepUnits && spawnTemplate.length) {
    resetUnits(sim.units, spawnTemplate);
    sim.kills = 0;
  }
}

export function startFlight() {
  resetDrone({ keepUnits: true });
  sim.phase = "flight";
  sim.result = null;
  sim.strikeArmed = true;
  startAudio();
  flushHud();
}

export function retry() {
  resetDrone();
  sim.phase = "brief";
  sim.result = null;
  stopAudio();
  flushHud();
}

function finish(result: Exclude<Result, null>, explodeAt?: { x: number; y: number; z: number }) {
  if (sim.phase === "strike" || sim.phase === "result") return;
  sim.result = result;
  sim.phase = "strike";
  sim.alive = result !== "crash";
  sim.shake = result === "hit" ? 1.2 : 0.7;
  const p = explodeAt ?? { x: sim.x, y: sim.y, z: sim.z };
  sim.explosion = { active: true, x: p.x, y: p.y, z: p.z, t: 0 };
  stopAudio();
  flushHud();
}

export function requestStrike() {
  strikeQueued = true;
}

function destroyAround(x: number, y: number, z: number): number {
  let n = 0;
  for (const u of sim.units) {
    if (!u.alive) continue;
    const d = Math.hypot(u.x - x, u.y - y, u.z - z);
    const r = SPLASH_RADIUS + (u.kind === "infantry" ? 0 : 6);
    if (d <= r) {
      u.alive = false;
      n += 1;
    }
  }
  sim.kills += n;
  return n;
}

function tryStrike() {
  if (sim.phase !== "flight" || !sim.strikeArmed) return;
  sim.strikeArmed = false;
  const lockedU = sim.units.find((u) => u.id === sim.lockedId && u.alive);
  if (lockedU) {
    const dist = Math.hypot(lockedU.x - sim.x, lockedU.y - sim.y, lockedU.z - sim.z);
    if (dist <= STRIKE_RANGE) {
      destroyAround(lockedU.x, lockedU.y, lockedU.z);
      finish("hit", { x: lockedU.x, y: lockedU.y, z: lockedU.z });
      return;
    }
  }
  const lockedT = sim.targets.find((t) => t.id === sim.lockedId);
  if (lockedT) {
    const dist = Math.hypot(lockedT.x - sim.x, lockedT.y - sim.y, lockedT.z - sim.z);
    if (dist <= STRIKE_RANGE) {
      destroyAround(lockedT.x, lockedT.y, lockedT.z);
      finish("hit", { x: lockedT.x, y: lockedT.y, z: lockedT.z });
      return;
    }
  }
  finish("miss");
}

function updateLock() {
  const lookX = -Math.sin(sim.yaw) * Math.cos(sim.pitch);
  const lookY = Math.sin(sim.pitch);
  const lookZ = -Math.cos(sim.yaw) * Math.cos(sim.pitch);
  let bestId: string | null = null;
  let bestDot = LOCK_DOT;
  for (const u of sim.units) {
    if (!u.alive) continue;
    const dx = u.x - sim.x;
    const dy = u.y + (u.kind === "infantry" ? 1.2 : 1.4) - sim.y;
    const dz = u.z - sim.z;
    const dist = Math.hypot(dx, dy, dz);
    if (dist > LOCK_RANGE || dist < 0.01) continue;
    const dot = (dx * lookX + dy * lookY + dz * lookZ) / dist;
    if (dot > bestDot) {
      bestDot = dot;
      bestId = u.id;
    }
  }
  if (!bestId) {
    for (const t of sim.targets) {
      const dx = t.x - sim.x;
      const dy = t.y - sim.y;
      const dz = t.z - sim.z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist > LOCK_RANGE || dist < 0.01) continue;
      const dot = (dx * lookX + dy * lookY + dz * lookZ) / dist;
      if (dot > bestDot) {
        bestDot = dot;
        bestId = t.id;
      }
    }
  }
  sim.lockedId = bestId;
}

export function step(dt: number) {
  if (toggleWire) {
    sim.wireframe = !sim.wireframe;
    toggleWire = false;
  }
  if (toggleNight) {
    sim.night = !sim.night;
    toggleNight = false;
  }

  stepUnits(sim.units, dt);

  if (sim.explosion.active) {
    sim.explosion.t += dt;
    if (sim.explosion.t > 1.15 && sim.phase === "strike") {
      sim.phase = "result";
    }
  }
  sim.shake = Math.max(0, sim.shake - dt * 2.4);

  if (sim.phase !== "flight") {
    lookDx = 0;
    lookDy = 0;
    return;
  }

  const a = getActions();
  lookDx = 0;
  lookDy = 0;

  sim.yaw += a.steer * YAW_RATE * dt;
  sim.yaw -= a.lookMx * MOUSE_SENS;
  sim.pitch -= a.lookMy * MOUSE_SENS;
  sim.pitch += touchLookY * -TOUCH_LOOK * dt;
  sim.pitch = Math.max(-1.2, Math.min(0.85, sim.pitch));
  sim.roll += (a.steer * 0.38 - sim.roll) * Math.min(1, dt * 8);

  const target = a.throttle * (a.boost ? BOOST_SPEED : CRUISE_SPEED);
  const k = 1 - Math.exp(-ACCEL * dt / Math.max(8, Math.abs(target) + 8));
  sim.speed += (target - sim.speed) * k;

  const cy = Math.cos(sim.pitch);
  const fx = -Math.sin(sim.yaw) * cy;
  const fy = Math.sin(sim.pitch);
  const fz = -Math.cos(sim.yaw) * cy;
  sim.fx = fx;
  sim.fy = fy;
  sim.fz = fz;

  sim.x += fx * sim.speed * dt;
  sim.z += fz * sim.speed * dt;
  sim.y += fy * sim.speed * dt + a.climb * CLIMB_RATE * dt;

  const half = WORLD * 0.48;
  sim.x = Math.max(-half, Math.min(half, sim.x));
  sim.z = Math.max(-half, Math.min(half, sim.z));

  const ground = heightAt(sim.x, sim.z);
  const floor = ground + MIN_ALT;
  if (sim.y < floor) {
    const impact = Math.hypot(sim.speed, Math.min(0, fy * sim.speed));
    if (fy * sim.speed < CRASH_VY || impact > CRASH_IMPACT) {
      sim.y = floor;
      finish("crash");
      return;
    }
    sim.y = floor;
    sim.speed *= 0.45;
    sim.pitch = Math.max(sim.pitch, -0.08);
  }

  sim.y = Math.min(220, sim.y);

  updateLock();

  for (const u of sim.units) {
    if (!u.alive) continue;
    const d = Math.hypot(u.x - sim.x, u.y - sim.y, u.z - sim.z);
    if (d < unitRadius(u.kind) + 1.5) {
      destroyAround(u.x, u.y, u.z);
      finish("hit", { x: u.x, y: u.y, z: u.z });
      return;
    }
  }

  for (const t of sim.targets) {
    const d = Math.hypot(t.x - sim.x, t.y - sim.y, t.z - sim.z);
    if (d < KAMIKAZE_RANGE) {
      destroyAround(t.x, t.y, t.z);
      finish("hit", { x: t.x, y: t.y, z: t.z });
      return;
    }
  }

  if (strikeQueued) {
    strikeQueued = false;
    tryStrike();
    if (sim.phase !== "flight") return;
  }

  sim.flightAge += dt;
  sim.timeLeft = Math.max(0, FLIGHT_SECONDS - sim.flightAge);
  if (sim.timeLeft <= 0) {
    const lockedU = sim.units.find((u) => u.id === sim.lockedId && u.alive);
    if (lockedU) {
      const d = Math.hypot(lockedU.x - sim.x, lockedU.y - sim.y, lockedU.z - sim.z);
      if (d <= TIMEOUT_RANGE) {
        destroyAround(lockedU.x, lockedU.y, lockedU.z);
        finish("hit", { x: lockedU.x, y: lockedU.y, z: lockedU.z });
        return;
      }
    }
    const locked = sim.targets.find((t) => t.id === sim.lockedId);
    if (locked) {
      const d = Math.hypot(locked.x - sim.x, locked.y - sim.y, locked.z - sim.z);
      if (d <= TIMEOUT_RANGE) {
        destroyAround(locked.x, locked.y, locked.z);
        finish("hit", { x: locked.x, y: locked.y, z: locked.z });
        return;
      }
    }
    finish("timeout");
  }
}

export function cinematicPose(elapsed: number) {
  const t = elapsed * 0.05;
  return {
    x: 14 + Math.sin(t) * 7,
    y: 21 + Math.sin(elapsed * 0.11) * 1.1,
    z: 22 + Math.cos(t) * 5,
    tx: 4,
    ty: 5.2,
    tz: -18,
  };
}

export function droneGrid(): string {
  return gridLabel(sim.x, sim.z);
}

export function attachControlsTest() {
  if (typeof window === "undefined") return;
  window.__controlsTest = {
    getYaw: () => sim.yaw,
    getSpeed: () => Math.abs(sim.speed),
    setSteer: (v: number) => {
      steerOverride = v;
    },
    setKeys: (codes: string[]) => {
      qaKeys = codes.length === 0 ? null : codes;
      if (!codes.length) steerOverride = null;
    },
    setPose: (p: { x?: number; y?: number; z?: number; yaw?: number; pitch?: number }) => {
      if (p.x != null) sim.x = p.x;
      if (p.y != null) sim.y = p.y;
      if (p.z != null) sim.z = p.z;
      if (p.yaw != null) sim.yaw = p.yaw;
      if (p.pitch != null) sim.pitch = p.pitch;
    },
    getUnits: () =>
      sim.units
        .filter((u) => u.alive)
        .map((u) => ({ id: u.id, kind: u.kind, x: u.x, y: u.y, z: u.z, yaw: u.yaw })),
    getTouch: () => ({
      mx: touchMoveX,
      my: touchMoveY,
      lx: touchLookX,
      ly: touchLookY,
    }),
  };
}

function startAudio() {
  if (typeof window === "undefined") return;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    void ctx.resume();
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 72;
    filter.type = "lowpass";
    filter.frequency.value = 380;
    gain.gain.value = 0.028;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    audio = { ctx, osc, gain, filter };
  } catch {
    audio = null;
  }
}

export function tickAudio() {
  if (!audio) return;
  const spd = Math.abs(sim.speed);
  audio.osc.frequency.setTargetAtTime(64 + spd * 2.4, audio.ctx.currentTime, 0.05);
  audio.filter.frequency.setTargetAtTime(280 + spd * 8, audio.ctx.currentTime, 0.08);
  const vol = sim.phase === "flight" ? 0.02 + spd * 0.0007 : 0;
  audio.gain.gain.setTargetAtTime(vol, audio.ctx.currentTime, 0.08);
}

function stopAudio() {
  if (!audio) return;
  const a = audio;
  audio = null;
  try {
    a.gain.gain.setTargetAtTime(0, a.ctx.currentTime, 0.04);
    setTimeout(() => {
      a.osc.stop();
      void a.ctx.close();
    }, 180);
  } catch {
    /* ignore */
  }
}

export function setWireframe(v: boolean) {
  sim.wireframe = v;
  flushHud();
}

export function setNight(v: boolean) {
  sim.night = v;
  flushHud();
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setSteer?: (v: number) => void;
      setKeys?: (codes: string[]) => void;
      setPose?: (p: { x?: number; y?: number; z?: number; yaw?: number; pitch?: number }) => void;
      getUnits?: () => { id: string; kind: string; x: number; y: number; z: number; yaw: number }[];
      getTouch?: () => { mx: number; my: number; lx: number; ly: number };
    };
    __gameReady?: boolean;
    __glStats?: () => {
      calls: number;
      triangles: number;
      points: number;
      geometries: number;
      textures: number;
      dpr: number;
      drawing: { w: number; h: number };
    };
  }
}
