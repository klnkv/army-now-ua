import * as THREE from "three";
import { SEGMENTS, TARGETS, WATER_LEVEL, WORLD, type TargetDef } from "./constants";
import { getQuality } from "./quality";

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const v00 = hash2(xi, yi);
  const v10 = hash2(xi + 1, yi);
  const v01 = hash2(xi, yi + 1);
  const v11 = hash2(xi + 1, yi + 1);
  const u = smooth(xf);
  const v = smooth(yf);
  return v00 * (1 - u) * (1 - v) + v10 * u * (1 - v) + v01 * (1 - u) * v + v11 * u * v;
}

function fbm(x: number, y: number): number {
  let a = 0.5;
  let f = 1;
  let s = 0;
  let n = 0;
  for (let i = 0; i < 5; i++) {
    s += a * valueNoise(x * f, y * f);
    n += a;
    a *= 0.5;
    f *= 2.03;
  }
  return s / n;
}

export function urbanFactor(x: number, z: number): number {
  const vx = x - 6;
  const vz = z + 10;
  return Math.exp(-(vx * vx + vz * vz) / (112 * 112));
}

export function heightAt(x: number, z: number): number {
  const nx = x / WORLD;
  const nz = z / WORLD;
  let h = 0;
  h += fbm(nx * 2.4 + 8.1, nz * 2.4 + 2.4) * 26;
  h += fbm(nx * 6.2 + 1.7, nz * 6.2) * 7.5;
  h += valueNoise(nx * 18, nz * 18) * 1.6;

  const urban = urbanFactor(x, z);

  const river = Math.abs(z + Math.sin(x * 0.02) * 36 + Math.sin(x * 0.07) * 8);
  const riverT = Math.max(0, 1 - river / 26);
  h -= riverT * riverT * 16 * (1 - urban * 0.92);

  h = h * (1 - urban * 0.9) + 6.05 * urban;
  h += valueNoise(nx * 48, nz * 48) * 0.22 * urban;

  const edge = Math.max(Math.abs(x), Math.abs(z)) / (WORLD * 0.5);
  const rim = Math.max(0, edge - 0.7) / 0.3;
  h += rim * rim * 38 * (1 - urban);

  const craterX = x - 62;
  const craterZ = z + 48;
  const crater = Math.exp(-(craterX * craterX + craterZ * craterZ) / 140);
  h -= crater * 4 * (1 - urban * 0.5);

  return Math.max(0.35, h);
}

export function slopeAt(x: number, z: number): number {
  const d = 2.4;
  const dx = heightAt(x + d, z) - heightAt(x - d, z);
  const dz = heightAt(x, z + d) - heightAt(x, z - d);
  return Math.hypot(dx, dz) / (d * 2);
}

function roadFactor(x: number, z: number): number {
  const ax = -10;
  const az = 150;
  const bx = 12;
  const bz = -20;
  const dx = bx - ax;
  const dz = bz - az;
  const len2 = dx * dx + dz * dz;
  let t = ((x - ax) * dx + (z - az) * dz) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = ax + dx * t;
  const pz = az + dz * t;
  const dist = Math.hypot(x - px, z - pz);
  return Math.max(0, 1 - dist / 8.5);
}

const _col = new THREE.Color();
const _city = new THREE.Color(0.94, 0.94, 0.95);
const _mud = new THREE.Color(0.36, 0.34, 0.3);
const _roadCol = new THREE.Color(0.22, 0.22, 0.23);

export function colorAt(x: number, z: number, y: number): THREE.Color {
  const c = _col;
  const urban = urbanFactor(x, z);
  const moist = fbm(x * 0.04 + 40, z * 0.04);
  if (y < WATER_LEVEL + 0.5) {
    c.setRGB(0.045, 0.048, 0.055);
  } else {
    const mud = 0.3 + moist * 0.08;
    c.setRGB(mud * 0.95, mud * 0.9, mud * 0.78);
    c.lerp(_mud, 0.35);
    c.lerp(_city, urban * 0.9);
  }

  const road = roadFactor(x, z);
  if (road > 0 && y > WATER_LEVEL + 0.8) {
    c.lerp(_roadCol, road * 0.55);
  }

  const d = 2.6;
  const dx = heightAt(x + d, z) - heightAt(x - d, z);
  const dz = heightAt(x, z + d) - heightAt(x, z - d);
  const nx = -dx;
  const ny = d * 2;
  const nz = -dz;
  const inv = 1 / Math.hypot(nx, ny, nz);
  const wrap = Math.max(0, nx * inv * 0.35 + ny * inv * 0.88 + nz * inv * 0.2);
  c.multiplyScalar(0.72 + wrap * 0.34);
  return c;
}

export type CobbleMaps = {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture | null;
  roughnessMap: THREE.CanvasTexture | null;
};

function wrapStamp(
  s: number,
  x: number,
  y: number,
  fn: (x: number, y: number) => void,
) {
  for (let oy = -s; oy <= s; oy += s) {
    for (let ox = -s; ox <= s; ox += s) {
      fn(x + ox, y + oy);
    }
  }
}

function texFromCanvas(
  canvas: HTMLCanvasElement,
  colorSpace: THREE.ColorSpace,
  repeat: number,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = getQuality().anisotropy;
  tex.colorSpace = colorSpace;
  tex.repeat.set(repeat, repeat);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export function makeCobbleMaps(): CobbleMaps {
  const q = getQuality();
  const s = q.cobbleSize;
  const dens = q.cobbleDensity;
  const repeat = q.mobile ? 16 : 22;
  const albedoC = document.createElement("canvas");
  albedoC.width = albedoC.height = s;
  const a = albedoC.getContext("2d", { alpha: false });
  if (!a) throw new Error("no 2d");

  const heightC = q.cobblePbr ? document.createElement("canvas") : null;
  if (heightC) {
    heightC.width = heightC.height = s;
  }
  const h = heightC ? heightC.getContext("2d", { alpha: false }) : null;

  a.fillStyle = "#0c0c0e";
  a.fillRect(0, 0, s, s);
  if (h) {
    h.fillStyle = "#1e1e1e";
    h.fillRect(0, 0, s, s);
  }

  const cols = q.mobile ? 20 : 34;
  const rows = cols;
  const cw = s / cols;
  const ch = s / rows;

  const puddles = Math.round(36 * dens);
  for (let i = 0; i < puddles; i++) {
    const px = hash2(i * 3.1, 8.2) * s;
    const py = hash2(i * 5.7, 2.4) * s;
    const rx = 22 + hash2(i, 11) * 90;
    const ry = 14 + hash2(i, 17) * 60;
    wrapStamp(s, px, py, (x, y) => {
      a.fillStyle = `rgba(4,6,8,${0.45 + hash2(i, 21) * 0.3})`;
      a.beginPath();
      a.ellipse(x, y, rx, ry, hash2(i, 4) * 1.2, 0, Math.PI * 2);
      a.fill();
    });
  }

  function stonePath(
    ctx: CanvasRenderingContext2D,
    rx: number,
    ry: number,
    seed: number,
  ) {
    ctx.beginPath();
    const n = 8;
    for (let k = 0; k < n; k++) {
      const ang = (k / n) * Math.PI * 2;
      const j = 0.78 + hash2(seed, k + 3) * 0.28;
      const px = Math.cos(ang) * rx * j;
      const py = Math.sin(ang) * ry * j;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  for (let row = 0; row < rows; row++) {
    const odd = row % 2 === 1;
    for (let col = 0; col < cols; col++) {
      const n = hash2(col * 1.73, row * 3.11);
      const n2 = hash2(col + 9.2, row + 4.4);
      const n3 = hash2(col * 0.7 + row, 19.1);
      const cx = (col + (odd ? 0.5 : 0)) * cw + (n - 0.5) * cw * 0.12;
      const cy = row * ch + (n2 - 0.5) * ch * 0.1;
      const rx = cw * (0.42 + n * 0.06);
      const ry = ch * (0.4 + n2 * 0.06);
      const rot = (n3 - 0.5) * 0.35;
      const wet = n3 > 0.72;
      const base = wet ? 16 + n * 14 : 36 + n * 28;
      const cool = (n2 - 0.5) * 8;
      const r = Math.floor(base + cool + n3 * 4);
      const g = Math.floor(base + 1);
      const b = Math.floor(base - 1 + n * 3);
      const seed = col * 13 + row * 17;

      wrapStamp(s, cx, cy, (x, y) => {
        a.save();
        a.translate(x, y);
        a.rotate(rot);
        a.fillStyle = `rgb(${r},${g},${b})`;
        stonePath(a, rx, ry, seed);
        a.fill();
        const spec = a.createRadialGradient(-rx * 0.32, -ry * 0.36, 0, 0, 0, rx);
        spec.addColorStop(0, `rgba(${wet ? 110 : 92},${wet ? 118 : 96},${wet ? 124 : 98},${wet ? 0.38 : 0.16})`);
        spec.addColorStop(0.5, `rgba(40,42,44,${wet ? 0.08 : 0.04})`);
        spec.addColorStop(1, "rgba(0,0,0,0.42)");
        a.fillStyle = spec;
        stonePath(a, rx, ry, seed);
        a.fill();
        a.strokeStyle = `rgba(6,6,8,${0.55 + n * 0.25})`;
        a.lineWidth = Math.max(1.1, cw * 0.045);
        stonePath(a, rx, ry, seed);
        a.stroke();
        a.restore();

        if (h) {
          h.save();
          h.translate(x, y);
          h.rotate(rot);
          const hg = h.createRadialGradient(-rx * 0.12, -ry * 0.14, 0, 0, 0, rx);
          hg.addColorStop(0, wet ? "#f2f2f2" : "#d0d0d0");
          hg.addColorStop(0.55, "#8a8a8a");
          hg.addColorStop(1, "#242424");
          h.fillStyle = hg;
          stonePath(h, rx, ry, seed);
          h.fill();
          h.restore();
        }
      });
    }
  }

  const chips = Math.round(90 * dens);
  for (let i = 0; i < chips; i++) {
    const n = hash2(i * 2.19, 51.3);
    const n2 = hash2(i * 4.07, 62.8);
    const cx = n * s;
    const cy = n2 * s;
    const rx = 2.2 + hash2(i, 70) * 5.5;
    const ry = 1.8 + hash2(i, 71) * 4.5;
    const rot = (hash2(i, 72) - 0.5) * 1.4;
    const base = 22 + n * 18;
    wrapStamp(s, cx, cy, (x, y) => {
      a.save();
      a.translate(x, y);
      a.rotate(rot);
      a.fillStyle = `rgb(${Math.floor(base + 6)},${Math.floor(base + 2)},${Math.floor(base)})`;
      a.beginPath();
      a.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      a.fill();
      a.restore();
    });
  }

  if (!h || !heightC || !q.cobblePbr) {
    return {
      map: texFromCanvas(albedoC, THREE.SRGBColorSpace, repeat),
      normalMap: null,
      roughnessMap: null,
    };
  }

  const grit = a.getImageData(0, 0, s, s);
  const hd = h.getImageData(0, 0, s, s);
  const roughC = document.createElement("canvas");
  roughC.width = roughC.height = s;
  const rc = roughC.getContext("2d", { alpha: false });
  if (!rc) throw new Error("no 2d");
  const rd = rc.createImageData(s, s);
  const ndc = document.createElement("canvas");
  ndc.width = ndc.height = s;
  const nc = ndc.getContext("2d", { alpha: false });
  if (!nc) throw new Error("no 2d");
  const nd = nc.createImageData(s, s);

  const H = hd.data;
  const A = grit.data;
  for (let i = 0; i < s * s; i++) {
    const o = i * 4;
    const x = i % s;
    const y = (i / s) | 0;
    const grain = (hash2(x * 0.37, y * 0.41) - 0.5) * 14;
    A[o] = Math.max(0, Math.min(255, A[o] + grain));
    A[o + 1] = Math.max(0, Math.min(255, A[o + 1] + grain * 0.9));
    A[o + 2] = Math.max(0, Math.min(255, A[o + 2] + grain * 0.8));
    const lum = (A[o] + A[o + 1] + A[o + 2]) / 3;
    const wet = lum < 32 ? 14 : 42 + lum * 0.48 + hash2(x, y) * 36;
    rd.data[o] = rd.data[o + 1] = rd.data[o + 2] = Math.max(10, Math.min(190, wet));
    rd.data[o + 3] = 255;

    const xm = (x + s - 1) % s;
    const xp = (x + 1) % s;
    const ym = (y + s - 1) % s;
    const yp = (y + 1) % s;
    const l = H[(y * s + xm) * 4];
    const rgt = H[(y * s + xp) * 4];
    const up = H[(ym * s + x) * 4];
    const dn = H[(yp * s + x) * 4];
    let dxn = (l - rgt) * 0.055;
    let dyn = (up - dn) * 0.055;
    const inv = 1 / Math.hypot(dxn, dyn, 1);
    dxn *= inv;
    dyn *= inv;
    const dz = inv;
    nd.data[o] = Math.floor((dxn * 0.5 + 0.5) * 255);
    nd.data[o + 1] = Math.floor((dyn * 0.5 + 0.5) * 255);
    nd.data[o + 2] = Math.floor((dz * 0.5 + 0.5) * 255);
    nd.data[o + 3] = 255;
  }
  a.putImageData(grit, 0, 0);
  rc.putImageData(rd, 0, 0);
  nc.putImageData(nd, 0, 0);

  return {
    map: texFromCanvas(albedoC, THREE.SRGBColorSpace, repeat),
    normalMap: texFromCanvas(ndc, THREE.NoColorSpace, repeat),
    roughnessMap: texFromCanvas(roughC, THREE.NoColorSpace, repeat),
  };
}

export function buildTerrainGeometry(segments = SEGMENTS): THREE.BufferGeometry {
  const plane = new THREE.PlaneGeometry(WORLD, WORLD, segments, segments);
  plane.rotateX(-Math.PI / 2);
  const pos = plane.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, heightAt(x, z));
  }
  const geo = plane.toNonIndexed();
  plane.dispose();
  const p = geo.attributes.position;
  const colors = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const col = colorAt(p.getX(i), p.getZ(i), p.getY(i));
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

export type PropInstance = {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  r: number;
};

export type PlacedBuilding = {
  x: number;
  y: number;
  z: number;
  rot: number;
  variant: number;
};

export function scatterBuildings(): PlacedBuilding[] {
  const lots: { x: number; z: number; rot: number; variant: number }[] = [
    { x: -24, z: -26, rot: 0.05, variant: 0 },
    { x: 16, z: -32, rot: -0.06, variant: 1 },
    { x: 4, z: -8, rot: 0.08, variant: 2 },
    { x: -22, z: 10, rot: 0.12, variant: 3 },
    { x: 30, z: 6, rot: -0.1, variant: 1 },
    { x: -8, z: -52, rot: 0.04, variant: 0 },
    { x: 38, z: -18, rot: 0.15, variant: 2 },
    { x: -42, z: -14, rot: 0.22, variant: 3 },
    { x: 10, z: 26, rot: 0.03, variant: 2 },
    { x: 50, z: -42, rot: -0.08, variant: 0 },
    { x: -58, z: -48, rot: 0.18, variant: 1 },
    { x: 22, z: -78, rot: 0.05, variant: 3 },
    { x: -12, z: 40, rot: -0.14, variant: 2 },
    { x: 54, z: 10, rot: 0.09, variant: 1 },
    { x: -38, z: 30, rot: 0.2, variant: 0 },
    { x: 8, z: -98, rot: 0.02, variant: 1 },
    { x: -70, z: -20, rot: 0.3, variant: 2 },
    { x: 28, z: 36, rot: -0.16, variant: 3 },
    { x: -8, z: -18, rot: 0.02, variant: 1 },
    { x: 24, z: -48, rot: -0.04, variant: 0 },
    { x: -34, z: -36, rot: 0.11, variant: 2 },
    { x: 44, z: 22, rot: 0.07, variant: 3 },
    { x: -18, z: -68, rot: 0.01, variant: 1 },
    { x: 14, z: 14, rot: -0.12, variant: 0 },
    { x: -52, z: 4, rot: 0.16, variant: 2 },
    { x: 62, z: -24, rot: 0.05, variant: 3 },
    { x: 32, z: -64, rot: -0.09, variant: 1 },
    { x: -6, z: 22, rot: 0.08, variant: 3 },
  ];
  return lots.map((l) => ({
    ...l,
    y: heightAt(l.x, l.z),
  }));
}

export function scatterTrees(): PropInstance[] {
  const out: PropInstance[] = [];
  const cap = getQuality().mobile ? 48 : 90;
  for (let i = 0; i < 280; i++) {
    const x = (hash2(i * 1.7, 19.2) - 0.5) * WORLD * 0.9;
    const z = (hash2(i * 2.3, 4.4) - 0.5) * WORLD * 0.9;
    const y = heightAt(x, z);
    if (y < WATER_LEVEL + 3.4) continue;
    if (y > 24) continue;
    if (slopeAt(x, z) > 0.55) continue;
    if (urbanFactor(x, z) > 0.28) continue;
    const s = 0.7 + hash2(i, 8.1) * 1.2;
    out.push({
      x,
      y,
      z,
      sx: s * (0.7 + hash2(i, 3) * 0.4),
      sy: s * (1.1 + hash2(i, 5) * 0.8),
      sz: s * (0.7 + hash2(i, 7) * 0.4),
      r: hash2(i, 11) * Math.PI * 2,
    });
    if (out.length >= cap) break;
  }
  return out;
}

export function scatterSandbags(): PropInstance[] {
  const spots = [
    { x: 12, z: 10 },
    { x: 20, z: 14 },
    { x: -6, z: 16 },
    { x: 2, z: -18 },
    { x: 18, z: -14 },
    { x: -30, z: -8 },
    { x: 44, z: -36 },
    { x: -16, z: 32 },
    { x: 8, z: -44 },
    { x: 26, z: 22 },
    { x: -48, z: -40 },
    { x: 14, z: 4 },
  ];
  return spots.map((s, i) => ({
    x: s.x,
    y: heightAt(s.x, s.z),
    z: s.z,
    sx: 1,
    sy: 1,
    sz: 1,
    r: hash2(i, 4.2) * Math.PI * 2,
  }));
}

export function scatterBarrels(): PropInstance[] {
  const clusters = [
    { x: 8, z: -2 },
    { x: 6, z: 0.8 },
    { x: 10, z: -1.2 },
    { x: -18, z: 6 },
    { x: -16.5, z: 7.4 },
    { x: 34, z: -12 },
    { x: 35.2, z: -10.6 },
    { x: -4, z: -46 },
    { x: 48, z: -38 },
    { x: 22, z: 28 },
    { x: -52, z: -44 },
    { x: 12, z: -74 },
  ];
  return clusters.map((s, i) => ({
    x: s.x,
    y: heightAt(s.x, s.z),
    z: s.z,
    sx: 1,
    sy: 1,
    sz: 1,
    r: hash2(i, 7.7) * Math.PI,
  }));
}

export function scatterRubble(): PropInstance[] {
  const spots = [
    { x: -14, z: 2 },
    { x: 22, z: -6 },
    { x: -32, z: -30 },
    { x: 6, z: 18 },
    { x: 40, z: -28 },
    { x: -8, z: -36 },
    { x: 16, z: 32 },
    { x: -46, z: 8 },
    { x: 2, z: -88 },
    { x: 28, z: -52 },
  ];
  return spots.map((s, i) => ({
    x: s.x,
    y: heightAt(s.x, s.z),
    z: s.z,
    sx: 0.9 + hash2(i, 1) * 0.5,
    sy: 0.8 + hash2(i, 2) * 0.5,
    sz: 0.9 + hash2(i, 3) * 0.5,
    r: hash2(i, 8) * Math.PI * 2,
  }));
}

export function scatterPickups(): PropInstance[] {
  const spots = [
    { x: 22, z: 12, r: 0.4 },
    { x: -28, z: -4, r: 1.2 },
    { x: 44, z: -8, r: -0.6 },
    { x: 6, z: -60, r: 0.15 },
  ];
  return spots.map((s) => ({
    x: s.x,
    y: heightAt(s.x, s.z),
    z: s.z,
    sx: 1.55,
    sy: 1.55,
    sz: 1.55,
    r: s.r,
  }));
}

export function scatterPuddles(): PropInstance[] {
  if (getQuality().mobile) return [];
  const spots = [
    { x: 6, z: 4 },
    { x: 2, z: -16 },
    { x: 18, z: -8 },
    { x: -10, z: 6 },
    { x: 12, z: -28 },
    { x: -20, z: -22 },
    { x: 28, z: 2 },
    { x: 8, z: 18 },
    { x: -6, z: -40 },
    { x: 36, z: -30 },
    { x: -28, z: -8 },
    { x: 16, z: 8 },
  ];
  return spots.map((s, i) => ({
    x: s.x,
    y: heightAt(s.x, s.z) + 0.05,
    z: s.z,
    sx: 2.6 + hash2(i, 1) * 3.4,
    sy: 1,
    sz: 1.7 + hash2(i, 2) * 2.6,
    r: hash2(i, 3) * Math.PI,
  }));
}

export type PlacedTarget = TargetDef & { y: number; grid: string };

export function gridLabel(x: number, z: number): string {
  const col = Math.max(0, Math.min(9, Math.floor(((x + WORLD * 0.5) / WORLD) * 10)));
  const row = Math.max(0, Math.min(9, Math.floor(((z + WORLD * 0.5) / WORLD) * 10)));
  return `${"ABCDEFGHIJ"[col]}${row + 1}`;
}

export function placedTargets(): PlacedTarget[] {
  return TARGETS.map((t) => ({
    ...t,
    y: heightAt(t.x, t.z),
    grid: gridLabel(t.x, t.z),
  }));
}
