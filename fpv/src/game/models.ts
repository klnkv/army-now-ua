import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type RGB = [number, number, number];

function paintedBox(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  rgb: RGB,
  rotY = 0,
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rotY) g.rotateY(rotY);
  g.translate(x, y, z);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    col[i * 3] = rgb[0];
    col[i * 3 + 1] = rgb[1];
    col[i * 3 + 2] = rgb[2];
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}

function paintedCyl(
  rt: number,
  rb: number,
  h: number,
  segs: number,
  x: number,
  y: number,
  z: number,
  rgb: RGB,
  rotX = 0,
  rotZ = 0,
): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(rt, rb, h, segs);
  if (rotX) g.rotateX(rotX);
  if (rotZ) g.rotateZ(rotZ);
  g.translate(x, y, z);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    col[i * 3] = rgb[0];
    col[i * 3 + 1] = rgb[1];
    col[i * 3 + 2] = rgb[2];
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}

function merge(parts: THREE.BufferGeometry[], yaw = Math.PI): THREE.BufferGeometry {
  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  if (!merged) throw new Error("mergeGeometries failed");
  if (yaw) merged.rotateY(yaw);
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

const UNI: RGB = [0.3, 0.3, 0.28];
const HELM: RGB = [0.16, 0.16, 0.15];
const SKIN: RGB = [0.46, 0.38, 0.32];
const GUN: RGB = [0.1, 0.1, 0.1];
const RED: RGB = [0.86, 0.14, 0.1];
const HULL: RGB = [0.4, 0.4, 0.38];
const HULL2: RGB = [0.22, 0.22, 0.2];
const TRACK: RGB = [0.1, 0.1, 0.09];
const CAB: RGB = [0.34, 0.34, 0.32];
const GLASS: RGB = [0.12, 0.14, 0.14];
const WHEEL: RGB = [0.08, 0.08, 0.07];

const CHALK: RGB = [0.97, 0.95, 0.9];
const CHALK2: RGB = [0.84, 0.81, 0.75];
const STAIN: RGB = [0.68, 0.64, 0.58];
const PINK: RGB = [0.94, 0.82, 0.83];
const PINK2: RGB = [0.78, 0.64, 0.66];
const STAINT: RGB = [0.64, 0.52, 0.54];
const FLOOR: RGB = [0.045, 0.045, 0.05];
const BAG: RGB = [0.42, 0.4, 0.36];
const BAG2: RGB = [0.34, 0.32, 0.28];
const STEEL: RGB = [0.38, 0.38, 0.36];
const STEEL2: RGB = [0.24, 0.24, 0.22];
const PICKUP: RGB = [0.78, 0.78, 0.76];
const PICKUP2: RGB = [0.52, 0.52, 0.5];
const RUBBLE: RGB = [0.48, 0.46, 0.44];
const RUBBLE2: RGB = [0.32, 0.31, 0.3];
const BEAM: RGB = [0.16, 0.15, 0.14];

export function buildSoldierGeometry(): THREE.BufferGeometry {
  return merge([
    paintedBox(0.44, 0.58, 0.3, 0, 1.1, 0, UNI),
    paintedBox(0.32, 0.34, 0.18, 0, 1.14, -0.2, HULL2),
    paintedBox(0.24, 0.24, 0.24, 0, 1.48, 0.02, SKIN),
    paintedBox(0.32, 0.14, 0.32, 0, 1.62, 0.02, HELM),
    paintedBox(0.18, 0.07, 0.18, 0, 1.72, 0.02, RED),
    paintedBox(0.05, 0.85, 0.05, -0.08, 2.05, -0.04, RED),
    paintedBox(0.16, 0.52, 0.18, -0.13, 0.5, 0, UNI),
    paintedBox(0.16, 0.52, 0.18, 0.13, 0.5, 0, UNI),
    paintedBox(0.13, 0.5, 0.13, -0.32, 1.1, 0.04, UNI),
    paintedBox(0.13, 0.5, 0.13, 0.32, 1.04, 0.18, UNI),
    paintedBox(0.06, 0.08, 1.05, 0.3, 1.04, 0.48, GUN),
    paintedBox(0.09, 0.12, 0.14, 0.3, 1.1, 0.12, GUN),
  ]);
}

export function buildTankGeometry(): THREE.BufferGeometry {
  return merge([
    paintedBox(2.25, 0.98, 3.9, 0, 0.86, 0, HULL),
    paintedBox(0.44, 0.48, 4.15, 1.12, 0.4, 0, TRACK),
    paintedBox(0.44, 0.48, 4.15, -1.12, 0.4, 0, TRACK),
    paintedBox(1.7, 0.74, 1.75, 0, 1.58, -0.12, HULL2),
    paintedCyl(0.13, 0.13, 2.9, 6, 0, 1.58, 1.62, GUN, Math.PI / 2),
    paintedBox(0.72, 0.16, 0.72, 0, 2.02, -0.12, RED),
  ]);
}

export function buildApcGeometry(): THREE.BufferGeometry {
  return merge([
    paintedBox(2.1, 1.28, 4.4, 0, 1.06, 0, HULL),
    paintedBox(1.25, 0.55, 1.25, 0, 1.88, 0.15, HULL2),
    paintedCyl(0.09, 0.09, 1.5, 5, 0, 1.88, 1.05, GUN, Math.PI / 2),
    paintedBox(0.58, 0.12, 0.58, 0, 2.22, 0.15, RED),
    paintedCyl(0.4, 0.4, 0.34, 8, 1.08, 0.4, -1.45, WHEEL, 0, Math.PI / 2),
    paintedCyl(0.4, 0.4, 0.34, 8, 1.08, 0.4, 0.1, WHEEL, 0, Math.PI / 2),
    paintedCyl(0.4, 0.4, 0.34, 8, 1.08, 0.4, 1.55, WHEEL, 0, Math.PI / 2),
    paintedCyl(0.4, 0.4, 0.34, 8, -1.08, 0.4, -1.45, WHEEL, 0, Math.PI / 2),
    paintedCyl(0.4, 0.4, 0.34, 8, -1.08, 0.4, 0.1, WHEEL, 0, Math.PI / 2),
    paintedCyl(0.4, 0.4, 0.34, 8, -1.08, 0.4, 1.55, WHEEL, 0, Math.PI / 2),
  ]);
}

export function buildTruckGeometry(): THREE.BufferGeometry {
  return merge(
    [
      paintedBox(1.55, 1.35, 1.85, -1.55, 1.35, 0, CAB),
      paintedBox(1.35, 0.55, 1.7, -1.55, 1.55, 0.08, GLASS),
      paintedBox(3.15, 1.15, 1.9, 0.85, 1.2, 0, HULL),
      paintedBox(3.05, 0.12, 1.8, 0.85, 1.82, 0, HULL2),
      paintedBox(0.5, 0.12, 0.5, 0.85, 1.95, 0, RED),
      paintedCyl(0.42, 0.42, 0.34, 8, -1.45, 0.42, 0.95, WHEEL, Math.PI / 2),
      paintedCyl(0.42, 0.42, 0.34, 8, -1.45, 0.42, -0.95, WHEEL, Math.PI / 2),
      paintedCyl(0.42, 0.42, 0.34, 8, 1.35, 0.42, 0.95, WHEEL, Math.PI / 2),
      paintedCyl(0.42, 0.42, 0.34, 8, 1.35, 0.42, -0.95, WHEEL, Math.PI / 2),
    ],
    -Math.PI / 2,
  );
}

function wallAlongX(
  parts: THREE.BufferGeometry[],
  cx: number,
  cz: number,
  length: number,
  height: number,
  thick: number,
  rgb: RGB,
  stain: RGB,
  nWin: number,
  doorIndex = -1,
) {
  const sillH = 1.35;
  const lintelH = Math.min(1.15, height * 0.16);
  const stainH = Math.min(1.5, height * 0.2);
  const nPillars = nWin + 1;
  const pillarW = Math.max(0.62, length * 0.1);
  const holeW = (length - pillarW * nPillars) / nWin;
  parts.push(paintedBox(length, lintelH, thick, cx, height - lintelH / 2, cz, rgb));
  let x = cx - length / 2;
  for (let i = 0; i < nWin; i++) {
    const px = x + pillarW / 2;
    const upperH = Math.max(0.4, height - lintelH - stainH);
    parts.push(paintedBox(pillarW, stainH, thick, px, stainH / 2, cz, stain));
    parts.push(paintedBox(pillarW, upperH, thick, px, stainH + upperH / 2, cz, rgb));
    x += pillarW;
    if (i !== doorIndex) {
      parts.push(paintedBox(holeW, sillH, thick, x + holeW / 2, sillH / 2, cz, stain));
      if (holeW > 1.6 && height > 7) {
        parts.push(paintedBox(0.1, Math.max(0.8, height - lintelH - sillH - 0.4), 0.08, x + holeW / 2, sillH + 1.2, cz, rgb));
      }
    }
    x += holeW;
  }
  const px = x + pillarW / 2;
  const upperH = Math.max(0.4, height - lintelH - stainH);
  parts.push(paintedBox(pillarW, stainH, thick, px, stainH / 2, cz, stain));
  parts.push(paintedBox(pillarW, upperH, thick, px, stainH + upperH / 2, cz, rgb));
}

function wallAlongZ(
  parts: THREE.BufferGeometry[],
  cx: number,
  cz: number,
  length: number,
  height: number,
  thick: number,
  rgb: RGB,
  stain: RGB,
  nWin: number,
  doorIndex = -1,
) {
  const sillH = 1.35;
  const lintelH = Math.min(1.15, height * 0.16);
  const stainH = Math.min(1.5, height * 0.2);
  const nPillars = nWin + 1;
  const pillarW = Math.max(0.62, length * 0.1);
  const holeW = (length - pillarW * nPillars) / nWin;
  parts.push(paintedBox(thick, lintelH, length, cx, height - lintelH / 2, cz, rgb));
  let z = cz - length / 2;
  for (let i = 0; i < nWin; i++) {
    const pz = z + pillarW / 2;
    const upperH = Math.max(0.4, height - lintelH - stainH);
    parts.push(paintedBox(thick, stainH, pillarW, cx, stainH / 2, pz, stain));
    parts.push(paintedBox(thick, upperH, pillarW, cx, stainH + upperH / 2, pz, rgb));
    z += pillarW;
    if (i !== doorIndex) {
      parts.push(paintedBox(thick, sillH, holeW, cx, sillH / 2, z + holeW / 2, stain));
    }
    z += holeW;
  }
  const pz = z + pillarW / 2;
  const upperH = Math.max(0.4, height - lintelH - stainH);
  parts.push(paintedBox(thick, stainH, pillarW, cx, stainH / 2, pz, stain));
  parts.push(paintedBox(thick, upperH, pillarW, cx, stainH + upperH / 2, pz, rgb));
}

export function buildRuinGeometry(variant: number): THREE.BufferGeometry {
  const specs = [
    { w: 16.5, d: 13.2, h: 13.8, skip: "s", win: 3, pink: false, door: 1, inner: true },
    { w: 13.4, d: 13.4, h: 11.2, skip: "", win: 2, pink: true, door: 0, inner: true },
    { w: 9.8, d: 9.6, h: 8.8, skip: "w", win: 2, pink: true, door: -1, inner: false },
    { w: 18.2, d: 10.4, h: 12.4, skip: "n", win: 3, pink: false, door: 0, inner: true },
  ][variant] ?? { w: 12, d: 10, h: 9, skip: "", win: 2, pink: false, door: 0, inner: false };

  const rgb = specs.pink ? PINK : CHALK;
  const rgb2 = specs.pink ? PINK2 : CHALK2;
  const stain = specs.pink ? STAINT : STAIN;
  const t = 0.7;
  const parts: THREE.BufferGeometry[] = [];
  parts.push(paintedBox(specs.w - 0.5, 0.18, specs.d - 0.5, 0, 0.09, 0, FLOOR));
  if (specs.h > 9) {
    parts.push(paintedBox(specs.w * 0.62, 0.14, specs.d * 0.5, 0.6, specs.h * 0.46, -0.4, FLOOR));
  }

  if (specs.skip !== "n") {
    wallAlongX(parts, 0, -specs.d / 2, specs.w, specs.h, t, rgb, stain, specs.win, specs.door);
  } else {
    wallAlongX(parts, -specs.w * 0.18, -specs.d / 2, specs.w * 0.55, specs.h * 0.48, t, rgb2, stain, 1, -1);
  }
  if (specs.skip !== "s") {
    wallAlongX(parts, 0, specs.d / 2, specs.w, specs.h * (specs.skip === "s" ? 0.58 : 1), t, rgb, stain, specs.win, -1);
  } else {
    wallAlongX(parts, specs.w * 0.2, specs.d / 2, specs.w * 0.5, specs.h * 0.44, t, rgb2, stain, 1, -1);
  }
  if (specs.skip !== "w") {
    wallAlongZ(parts, -specs.w / 2, 0, specs.d, specs.h, t, rgb, stain, Math.max(2, specs.win - 1), -1);
  } else {
    wallAlongZ(parts, -specs.w / 2, specs.d * 0.15, specs.d * 0.55, specs.h * 0.52, t, rgb2, stain, 1, -1);
  }
  if (specs.skip !== "e") {
    wallAlongZ(parts, specs.w / 2, 0, specs.d, specs.h, t, rgb, stain, Math.max(2, specs.win - 1), specs.door === 0 ? 0 : -1);
  }

  if (specs.inner) {
    parts.push(paintedBox(t, specs.h * 0.7, specs.d * 0.42, -1.6, specs.h * 0.35, -1.1, rgb2));
    parts.push(paintedBox(specs.w * 0.32, specs.h * 0.52, t, 2.4, specs.h * 0.26, 1.0, rgb2));
  }

  parts.push(paintedBox(specs.w * 0.55, 0.22, 0.28, 0.4, specs.h + 0.2, -specs.d * 0.18, BEAM));
  parts.push(paintedBox(0.28, 0.22, specs.d * 0.4, specs.w * 0.22, specs.h + 0.18, 0.2, BEAM));
  parts.push(paintedBox(1.25, specs.h * 0.18, 1.25, specs.w * 0.28, specs.h + specs.h * 0.06, -specs.d * 0.28, rgb2));

  const teeth = 5;
  for (let i = 0; i < teeth; i++) {
    const u = (i + 0.5) / teeth - 0.5;
    const hh = 0.35 + ((i * 17 + variant * 9) % 5) * 0.22;
    if ((i + variant) % 3 === 0) continue;
    parts.push(paintedBox(specs.w * 0.12, hh, t, u * specs.w * 0.85, specs.h + hh * 0.5, -specs.d / 2, rgb2));
  }

  if (specs.skip) {
    const sx = specs.skip === "e" ? specs.w * 0.42 : specs.skip === "w" ? -specs.w * 0.42 : 0;
    const sz = specs.skip === "n" ? -specs.d * 0.42 : specs.skip === "s" ? specs.d * 0.42 : 0;
    parts.push(paintedBox(2.6, 0.75, 1.7, sx, 0.38, sz, RUBBLE));
    parts.push(paintedBox(1.6, 1.2, 1.3, sx + 0.8, 0.6, sz + 0.4, RUBBLE2));
    parts.push(paintedBox(1.2, 0.55, 1.9, sx - 0.6, 0.28, sz - 0.3, RUBBLE));
    parts.push(paintedBox(0.9, 0.7, 0.8, sx + 0.2, 0.9, sz - 0.5, CHALK2));
  }

  return merge(parts, 0);
}

export function buildSandbagGeometry(): THREE.BufferGeometry {
  return merge(
    [
      paintedBox(1.85, 0.34, 0.72, 0, 0.17, 0, BAG),
      paintedBox(1.55, 0.34, 0.7, 0.06, 0.5, 0.04, BAG2),
      paintedBox(1.15, 0.32, 0.64, -0.04, 0.82, 0, BAG),
      paintedBox(0.7, 0.28, 0.55, 0.02, 1.1, 0.02, BAG2),
    ],
    0,
  );
}

export function buildBarrelGeometry(): THREE.BufferGeometry {
  return merge(
    [
      paintedCyl(0.4, 0.42, 0.95, 8, 0, 0.48, 0, STEEL),
      paintedCyl(0.44, 0.44, 0.08, 8, 0, 0.94, 0, STEEL2),
      paintedCyl(0.44, 0.44, 0.08, 8, 0, 0.08, 0, STEEL2),
      paintedCyl(0.41, 0.41, 0.06, 8, 0, 0.55, 0, STEEL2),
    ],
    0,
  );
}

export function buildRubbleGeometry(): THREE.BufferGeometry {
  return merge(
    [
      paintedBox(2.6, 0.7, 2.2, 0, 0.35, 0, RUBBLE),
      paintedBox(1.4, 1.15, 1.1, 0.55, 0.7, 0.3, RUBBLE2),
      paintedBox(1.1, 0.55, 1.6, -0.7, 0.4, -0.4, RUBBLE),
      paintedBox(0.8, 0.9, 0.7, 0.1, 1.1, -0.5, CHALK2),
      paintedBox(0.6, 0.45, 0.9, -0.2, 0.55, 0.8, RUBBLE2),
    ],
    0,
  );
}

export function buildPickupGeometry(): THREE.BufferGeometry {
  return merge(
    [
      paintedBox(1.7, 1.15, 1.7, -1.35, 1.15, 0, PICKUP),
      paintedBox(1.5, 0.45, 1.55, -1.35, 1.35, 0.08, GLASS),
      paintedBox(2.6, 0.55, 1.75, 0.85, 0.95, 0, PICKUP2),
      paintedBox(2.5, 0.12, 1.65, 0.85, 1.28, 0, PICKUP),
      paintedBox(2.45, 0.35, 0.08, 0.85, 1.42, 0.84, PICKUP),
      paintedBox(2.45, 0.35, 0.08, 0.85, 1.42, -0.84, PICKUP),
      paintedCyl(0.38, 0.38, 0.32, 8, -1.2, 0.38, 0.9, WHEEL, Math.PI / 2),
      paintedCyl(0.38, 0.38, 0.32, 8, -1.2, 0.38, -0.9, WHEEL, Math.PI / 2),
      paintedCyl(0.38, 0.38, 0.32, 8, 1.15, 0.38, 0.9, WHEEL, Math.PI / 2),
      paintedCyl(0.38, 0.38, 0.32, 8, 1.15, 0.38, -0.9, WHEEL, Math.PI / 2),
    ],
    -Math.PI / 2,
  );
}
