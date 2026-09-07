import { heightAt, gridLabel } from "./terrain";
import { WATER_LEVEL } from "./constants";

export type UnitKind = "infantry" | "tank" | "apc" | "truck";

export type Unit = {
  id: string;
  kind: UnitKind;
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  alive: boolean;
  speed: number;
  path: { x: number; z: number }[];
  pathI: number;
  bob: number;
};

function loop(cx: number, cz: number, rx: number, rz: number, n: number, rot = 0): { x: number; z: number }[] {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    out.push({ x: cx + Math.cos(a) * rx, z: cz + Math.sin(a) * rz });
  }
  return out;
}

function groundY(kind: UnitKind, x: number, z: number): number {
  const h = heightAt(x, z);
  if (kind === "infantry") return h;
  return h;
}

function pushSoldier(
  units: Unit[],
  id: string,
  name: string,
  x: number,
  z: number,
  path: { x: number; z: number }[],
  speed: number,
  yaw = 0,
) {
  if (heightAt(x, z) < WATER_LEVEL + 1.2) return;
  units.push({
    id,
    kind: "infantry",
    name,
    x,
    y: groundY("infantry", x, z),
    z,
    yaw,
    alive: true,
    speed,
    path,
    pathI: 0,
    bob: Math.random() * Math.PI * 2,
  });
}

function pushVehicle(
  units: Unit[],
  kind: Exclude<UnitKind, "infantry">,
  id: string,
  name: string,
  x: number,
  z: number,
  path: { x: number; z: number }[],
  speed: number,
  yaw = 0,
) {
  if (heightAt(x, z) < WATER_LEVEL + 1.2) return;
  units.push({
    id,
    kind,
    name,
    x,
    y: groundY(kind, x, z),
    z,
    yaw,
    alive: true,
    speed,
    path,
    pathI: 0,
    bob: 0,
  });
}

export function spawnUnits(): Unit[] {
  const units: Unit[] = [];

  const sq1 = loop(-18, -22, 11, 8, 8);
  for (let i = 0; i < 8; i++) {
    const p = sq1[i];
    pushSoldier(units, `inf-a${i}`, `ПІХ-${i + 1}`, p.x, p.z, sq1, 1.45);
  }

  const sq2 = loop(38, 8, 9, 7, 6, 0.4);
  for (let i = 0; i < 6; i++) {
    const p = sq2[i];
    pushSoldier(units, `inf-b${i}`, `ПІХ-${i + 9}`, p.x, p.z, sq2, 1.35);
  }

  const sq3 = loop(-72, -58, 7, 6, 5, 1.1);
  for (let i = 0; i < 4; i++) {
    const p = sq3[i];
    pushSoldier(units, `inf-c${i}`, `ПІХ-${i + 15}`, p.x, p.z, sq3, 1.2);
  }

  const sq4 = loop(14, -96, 8, 6, 6);
  for (let i = 0; i < 4; i++) {
    const p = sq4[i];
    pushSoldier(units, `inf-d${i}`, `ПІХ-${i + 19}`, p.x, p.z, sq4, 1.1);
  }

  const sq5 = loop(8, 18, 7, 6, 5, 0.8);
  for (let i = 0; i < 5; i++) {
    const p = sq5[i];
    pushSoldier(units, `inf-e${i}`, `ПІХ-${i + 23}`, p.x, p.z, sq5, 1.4);
  }

  const road = [
    { x: -8, z: 120 },
    { x: -4, z: 70 },
    { x: 4, z: 20 },
    { x: 18, z: -18 },
    { x: 48, z: -40 },
    { x: 62, z: -48 },
    { x: 40, z: -70 },
    { x: 8, z: -40 },
    { x: -10, z: 10 },
    { x: -8, z: 70 },
  ];

  pushVehicle(units, "truck", "trk-1", "УРАЛ-1", -6, 90, road, 8.5, 0);
  pushVehicle(units, "truck", "trk-2", "УРАЛ-2", 10, 30, [...road].reverse(), 7.4, Math.PI);
  pushVehicle(units, "truck", "trk-3", "УРАЛ-3", 20, -88, loop(18, -90, 16, 10, 6), 6.2);

  const armorLoop = loop(62, -48, 22, 16, 7, 0.2);
  pushVehicle(units, "tank", "tnk-1", "ТАНК-1", 62, -48, armorLoop, 5.2);
  pushVehicle(units, "tank", "tnk-2", "ТАНК-2", -38, -12, loop(-40, -8, 18, 14, 6), 4.6);
  pushVehicle(units, "apc", "apc-1", "БТР-1", 50, -36, armorLoop, 6.8);
  pushVehicle(units, "apc", "apc-2", "БТР-2", -68, -50, loop(-70, -52, 14, 10, 5), 6.1);
  pushVehicle(units, "apc", "apc-3", "БТР-3", 8, -8, road, 7.2);

  return units;
}

export function resetUnits(units: Unit[], template: Unit[]) {
  for (let i = 0; i < units.length; i++) {
    const src = template[i];
    const u = units[i];
    u.x = src.x;
    u.z = src.z;
    u.y = groundY(u.kind, src.x, src.z);
    u.yaw = src.yaw;
    u.alive = true;
    u.pathI = src.pathI;
    u.bob = src.bob;
  }
}

export function stepUnits(units: Unit[], dt: number) {
  for (const u of units) {
    if (!u.alive || u.path.length < 2) continue;
    const wp = u.path[u.pathI % u.path.length];
    const dx = wp.x - u.x;
    const dz = wp.z - u.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 1.4) {
      u.pathI = (u.pathI + 1) % u.path.length;
      continue;
    }
    const inv = 1 / dist;
    const step = u.speed * dt;
    u.x += dx * inv * step;
    u.z += dz * inv * step;
    u.yaw = Math.atan2(-dx, -dz);
    u.bob += dt * (u.kind === "infantry" ? 7.5 : 4);
    const bob = u.kind === "infantry" ? Math.abs(Math.sin(u.bob)) * 0.07 : 0;
    u.y = groundY(u.kind, u.x, u.z) + bob;
  }
}

export function unitRadius(kind: UnitKind): number {
  if (kind === "infantry") return 5.2;
  if (kind === "truck") return 8.5;
  if (kind === "apc") return 9.2;
  return 10.5;
}

export function unitScale(kind: UnitKind): number {
  if (kind === "infantry") return 2.55;
  if (kind === "truck") return 1.32;
  if (kind === "apc") return 1.28;
  return 1.35;
}

export function unitGrid(u: Unit): string {
  return gridLabel(u.x, u.z);
}

export function kindLabel(kind: UnitKind): string {
  if (kind === "infantry") return "ПІХОТА";
  if (kind === "truck") return "ВАНТАЖІВКА";
  if (kind === "apc") return "БТР";
  return "ТАНК";
}
