/**
 * Directed vision for Front.
 * Origin sits on the player (the character), not a world-center Boids circle.
 * Yellow sector = FOV and rotates with facing.
 * Green vector = movement heading.
 * No omnidirectional protected circle.
 */

export const VISION = {
  /** World-space visual range (outer yellow sector). */
  range: 280,
  /** Full field-of-view angle in degrees. */
  fovDeg: 110,
  /** Screen-space length of the green heading mark. */
  headingLen: 78,
  /** Speed (px/s) above which heading uses velocity instead of aim. */
  moveEps: 18,
} as const;

export function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

export function halfFovRad(fovDeg = VISION.fovDeg): number {
  return degToRad(fovDeg) * 0.5;
}

export function angNorm(a: number): number {
  let x = a;
  while (x <= -Math.PI) x += Math.PI * 2;
  while (x > Math.PI) x -= Math.PI * 2;
  return x;
}

export function angDelta(a: number, b: number): number {
  return Math.abs(angNorm(a - b));
}

export function lerpAngle(from: number, to: number, t: number): number {
  return from + angNorm(to - from) * t;
}

export function headingFromVelocity(vx: number, vy: number, fallback: number, eps = VISION.moveEps): number {
  const sp = Math.hypot(vx, vy);
  if (sp < eps) return fallback;
  return Math.atan2(vy, vx);
}

export function inVisionCone(
  ox: number,
  oy: number,
  facing: number,
  tx: number,
  ty: number,
  range = VISION.range,
  half = halfFovRad(),
): boolean {
  const dx = tx - ox;
  const dy = ty - oy;
  const d = Math.hypot(dx, dy);
  if (d > range) return false;
  if (d < 1e-4) return true;
  return angDelta(Math.atan2(dy, dx), facing) <= half;
}

export function sectorPoints(
  ox: number,
  oy: number,
  facing: number,
  range = VISION.range,
  half = halfFovRad(),
  steps = 20,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [{ x: ox, y: oy }];
  const start = facing - half;
  for (let i = 0; i <= steps; i++) {
    const a = start + (i / steps) * half * 2;
    pts.push({ x: ox + Math.cos(a) * range, y: oy + Math.sin(a) * range });
  }
  return pts;
}

/** Yellow facing sector + green movement arrow. Origin = player screen pos. */
export function drawFacingVision(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: number,
  moveHeading: number,
  rangePx = VISION.range,
): void {
  const half = halfFovRad();
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, rangePx, facing - half, facing + half);
  ctx.closePath();
  ctx.fillStyle = "rgba(228,196,74,0.20)";
  ctx.fill();
  ctx.strokeStyle = "rgba(228,196,74,0.88)";
  ctx.lineWidth = 1.7;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(Math.cos(facing) * 8, Math.sin(facing) * 8);
  ctx.lineTo(Math.cos(facing) * rangePx, Math.sin(facing) * rangePx);
  ctx.strokeStyle = "rgba(228,196,74,0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const hx = Math.cos(moveHeading) * VISION.headingLen;
  const hy = Math.sin(moveHeading) * VISION.headingLen;
  ctx.strokeStyle = "rgba(74,196,90,0.95)";
  ctx.fillStyle = "rgba(74,196,90,0.95)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(hx, hy);
  ctx.stroke();
  const ah = 11;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx - Math.cos(moveHeading - 0.45) * ah, hy - Math.sin(moveHeading - 0.45) * ah);
  ctx.lineTo(hx - Math.cos(moveHeading + 0.45) * ah, hy - Math.sin(moveHeading + 0.45) * ah);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
