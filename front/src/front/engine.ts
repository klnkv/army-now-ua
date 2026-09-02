export type FrontHooks = {
  lang: string;
  onHq: () => void;
  unit: string;
  path: string;
  gear: () => Record<string, string>;
};

type ImgMap = Record<string, HTMLImageElement>;

const STEP = 1 / 60;
const STICK_R = 64;
const FRONT_R = 0.42;
/** Maps off while we review hero silhouettes. */
const SHOW_BG = false;
const SHOW_EXHIBITS = false;
/** 2×2 walk sheet: 4 frames. stridePx = pixels per full cycle. */
const ANIM = { cols: 2, rows: 2, frames: 4, stridePx: 68, idleFps: 1.4 };
/** Arcade body for the soldier. Tune these, not magic numbers in step(). */
const PHYS = {
  maxSpeed: 205,
  accel: 1650,
  friction: 11,
  radius: 18,
  mass: 1,
  knockback: 260,
  hitInv: 1.55,
  worldPad: 42,
  hasteMul: 1.42,
  fireRate: 0.16,
  fireHaste: 0.1,
  camFollow: 0.14,
  camLook: 36,
  pickupR: 28,
  stopSpeed: 10,
};

const SRC: Record<string, string> = {
  boltP: "/sprites/bolt-player.png",
  boltE: "/sprites/bolt-enemy.png",
  muzzle: "/sprites/muzzle.png",
  explode: "/sprites/explode.png",
  multi: "/sprites/pickup-multi.png",
  shield: "/sprites/pickup-shield.png",
  speed: "/sprites/pickup-speed.png",
  unitInfantry: "/sprites/unit-infantry.png",
  unitTank: "/sprites/unit-tank.png",
  tankDrive: "/sprites/tank-drive.png",
  unitRadio: "/sprites/unit-radio.png",
  unitF16: "/sprites/unit-f16.png",
  unitMig: "/sprites/unit-mig.png",
  unitDrone: "/sprites/unit-drone.png",
  unitMortar: "/sprites/unit-mortar.png",
  unitArty: "/sprites/unit-arty.png",
  unitAirdef: "/sprites/unit-airdef.png",
  unitMedic: "/sprites/unit-medic.png",
  unitMarine: "/sprites/unit-marine.png",
  unitSapper: "/sprites/unit-sapper.png",
  unitRecon: "/sprites/unit-recon.png",
  isoGround: "/sprites/iso-ground.jpg",
  isoRuinA: "/sprites/iso-ruin-a.png",
  isoRuinB: "/sprites/iso-ruin-b.png",
  isoRuinC: "/sprites/iso-ruin-c.png",
  isoBags: "/sprites/iso-bags.png",
  isoBarrels: "/sprites/iso-barrels.png",
  isoTruck: "/sprites/iso-truck.png",
  isoRubble: "/sprites/iso-rubble.png",
  isoSoldierWalk: "/sprites/iso-soldier-walk.png",
  isoEnemy: "/sprites/iso-enemy.png",
};

export const FRONT_ASSETS = Object.values(SRC);

type UnitBody = {
  sprite: string;
  size: number;
  r: number;
  maxSpeed: number;
  accel: number;
  sheet?: { cols: number; rows: number; frames: number; stridePx: number };
};

const UNIT_BODY: Record<string, UnitBody> = {
  infantry: {
    sprite: "isoSoldierWalk",
    size: 54,
    r: 14,
    maxSpeed: 205,
    accel: 1650,
    sheet: { cols: 3, rows: 3, frames: 8, stridePx: 42 },
  },
  tank: {
    sprite: "tankDrive",
    size: 96,
    r: 34,
    maxSpeed: 128,
    accel: 900,
    sheet: { cols: 4, rows: 2, frames: 8, stridePx: 46 },
  },
  signal: { sprite: "unitRadio", size: 56, r: 16, maxSpeed: 190, accel: 1500 },
  air: { sprite: "unitF16", size: 84, r: 24, maxSpeed: 280, accel: 2100 },
  drone: { sprite: "unitDrone", size: 58, r: 16, maxSpeed: 255, accel: 1900 },
  mortar: { sprite: "unitMortar", size: 70, r: 20, maxSpeed: 150, accel: 1100 },
  artillery: { sprite: "unitArty", size: 86, r: 28, maxSpeed: 132, accel: 850 },
  airdef: { sprite: "unitAirdef", size: 68, r: 18, maxSpeed: 175, accel: 1400 },
  medic: { sprite: "unitMedic", size: 60, r: 18, maxSpeed: 200, accel: 1600 },
  marine: { sprite: "unitMarine", size: 64, r: 18, maxSpeed: 210, accel: 1700 },
  sapper: { sprite: "unitSapper", size: 60, r: 18, maxSpeed: 185, accel: 1450 },
  recon: { sprite: "unitRecon", size: 60, r: 16, maxSpeed: 230, accel: 1800 },
};

const UNIT_MAP: Record<string, string> = {
  infantry: "mapInfantry",
  tank: "mapTank",
  signal: "mapSignal",
  air: "mapAir",
  drone: "mapDrone",
  mortar: "mapMortar",
  artillery: "mapArtillery",
  airdef: "mapAirdef",
  medic: "mapMedic",
  marine: "mapMarine",
  sapper: "mapSapper",
  recon: "mapRecon",
};
const AERIAL = new Set(["air", "drone", "airdef"]);

const HERO_SHOW: { sprite: string; size: number }[] = [
  { sprite: "unitInfantry", size: 70 },
  { sprite: "unitTank", size: 88 },
  { sprite: "unitRadio", size: 62 },
  { sprite: "unitDrone", size: 64 },
  { sprite: "unitMortar", size: 74 },
  { sprite: "unitArty", size: 84 },
  { sprite: "unitAirdef", size: 70 },
  { sprite: "unitMedic", size: 66 },
  { sprite: "unitMarine", size: 68 },
  { sprite: "unitSapper", size: 66 },
  { sprite: "unitRecon", size: 66 },
];

type Prop = { x: number; y: number; sprite: string; size: number; r: number };
type Kind = "scout" | "fighter" | "cruiser";

type Actor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hp: number;
  kind: Kind;
  faceLeft: boolean;
  flash: number;
  alive: boolean;
  anim: number;
};

type Bolt = { x: number; y: number; vx: number; vy: number; r: number; from: "p" | "e"; life: number; alive: boolean };
type Fx = { x: number; y: number; t: number; max: number; kind: "boom" | "muzzle" | "pop"; alive: boolean; s: number };
type Drop = { x: number; y: number; kind: "multi" | "shield" | "speed"; t: number; alive: boolean };
type Speck = { x: number; y: number; s: number; a: number };

function pool<T>(n: number, make: () => T): T[] {
  return Array.from({ length: n }, make);
}

function loadAll(): Promise<ImgMap> {
  const out: ImgMap = {};
  return Promise.all(
    Object.entries(SRC).map(
      ([k, src]) =>
        new Promise<void>((res) => {
          const im = new Image();
          im.onload = () => {
            out[k] = im;
            res();
          };
          im.onerror = () => res();
          im.src = src;
        }),
    ),
  ).then(() => out);
}

export class FrontGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private hooks: FrontHooks;
  private imgs: ImgMap = {};
  private raf = 0;
  private acc = 0;
  private last = 0;
  private w = 1;
  private h = 1;
  private dpr = 1;
  private keys = new Set<string>();
  private pointer = { x: 0, y: 0, down: false };
  private stick: { id: number; ox: number; oy: number; x: number; y: number } | null = null;
  private aimTouch: { id: number; x: number; y: number } | null = null;
  private player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    aim: -Math.PI / 2,
    r: PHYS.radius,
    hp: 1,
    shield: 0,
    multi: 0,
    haste: 0,
    inv: 0,
    fire: 0,
    anim: 0,
  };
  private enemies: Actor[] = [];
  private bolts: Bolt[] = [];
  private fx: Fx[] = [];
  private drops: Drop[] = [];
  private specks: Speck[] = [];
  private exhibits: { x: number; y: number; sprite: string; size: number }[] = [];
  private props: Prop[] = [];
  private score = 0;
  private clock = 0;
  private mag = 12;
  private magMax = 60;
  private lives = 3;
  private wave = 1;
  private toSpawn = 0;
  private spawnT = 0;
  private waveT = 2.2;
  private paused = false;
  private over = false;
  private shake = 0;
  private hitstop = 0;
  private camX = 0;
  private camY = 0;
  private world = 2400;
  private running = false;
  private unbind: Array<() => void> = [];

  constructor(canvas: HTMLCanvasElement, hooks: FrontHooks) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d");
    this.ctx = ctx;
    this.hooks = hooks;
  }

  private body(): UnitBody {
    const id = this.hooks.unit || "infantry";
    const b = UNIT_BODY[id] ?? UNIT_BODY.infantry;
    if (id === "air" && this.hooks.path === "mobilized") return { ...b, sprite: "unitMig" };
    return b;
  }

  async start() {
    this.imgs = await loadAll();
    this.resize();
    this.resetRun();
    this.running = true;
    this.last = performance.now();
    this.bind();
    this.loop(this.last);
    this.installProbe();
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.unbind.forEach((f) => f());
    this.unbind = [];
    if (window.__controlsTest) delete window.__controlsTest;
  }

  private resetRun() {
    this.score = 0;
    this.clock = 0;
    this.mag = 12;
    this.lives = 3;
    this.wave = 1;
    this.over = false;
    this.paused = false;
    this.player.x = this.world / 2;
    this.player.y = this.world / 2;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.aim = -Math.PI / 2;
    this.player.r = this.body().r;
    this.player.shield = 0;
    this.player.multi = 0;
    this.player.haste = 0;
    this.player.inv = 1.2;
    this.player.fire = 0;
    this.player.anim = 0;
    this.enemies = pool(48, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 16, hp: 1, kind: "scout" as Kind, faceLeft: false, flash: 0, alive: false, anim: 0 }));
    this.bolts = pool(160, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 4, from: "p" as const, life: 0, alive: false }));
    this.fx = pool(80, () => ({ x: 0, y: 0, t: 0, max: 0.4, kind: "boom" as const, alive: false, s: 1 }));
    this.drops = pool(12, () => ({ x: 0, y: 0, kind: "multi" as const, t: 0, alive: false }));
    this.specks = Array.from({ length: SHOW_BG ? 140 : 40 }, () => ({
      x: Math.random() * this.world,
      y: Math.random() * this.world,
      s: 0.6 + Math.random() * 2.2,
      a: 0.08 + Math.random() * 0.22,
    }));
    const cx = this.world / 2;
    const cy = this.world / 2;
    this.exhibits = SHOW_EXHIBITS
      ? HERO_SHOW.map((h, i) => {
          const a = (i / HERO_SHOW.length) * Math.PI * 2 - Math.PI / 2;
          return { x: cx + Math.cos(a) * 210, y: cy + Math.sin(a) * 150, sprite: h.sprite, size: h.size };
        })
      : [];
    this.toSpawn = 6;
    this.spawnT = 0.4;
    this.waveT = 2.2;
    this.camX = this.player.x;
    this.camY = this.player.y;
    this.placeField();
  }

  private placeField() {
    const c = this.world / 2;
    this.props = [
      { x: c - 210, y: c - 240, sprite: "isoRuinA", size: 210, r: 62 },
      { x: c + 230, y: c - 180, sprite: "isoRuinB", size: 188, r: 58 },
      { x: c + 40, y: c + 30, sprite: "isoRuinC", size: 176, r: 54 },
      { x: c - 80, y: c + 210, sprite: "isoRuinA", size: 198, r: 60 },
      { x: c + 160, y: c + 160, sprite: "isoBags", size: 78, r: 28 },
      { x: c + 90, y: c - 20, sprite: "isoBarrels", size: 64, r: 22 },
      { x: c + 220, y: c + 240, sprite: "isoTruck", size: 120, r: 36 },
      { x: c - 260, y: c + 40, sprite: "isoRubble", size: 70, r: 24 },
      { x: c - 40, y: c - 80, sprite: "isoRubble", size: 58, r: 20 },
    ];
  }

  private bind() {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.type === "keydown") {
        this.keys.add(e.code);
        if (e.code === "Escape" || e.code === "KeyP") this.paused = !this.paused;
      } else this.keys.delete(e.code);
    };
    const onBlur = () => this.keys.clear();
    const resize = () => this.resize();
    const opt = { passive: false } as AddEventListenerOptions;
    const pd = (e: PointerEvent) => this.onDown(e);
    const pm = (e: PointerEvent) => this.onMove(e);
    const pu = (e: PointerEvent) => this.onUp(e);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", resize);
    this.canvas.addEventListener("pointerdown", pd, opt);
    this.canvas.addEventListener("pointermove", pm, opt);
    this.canvas.addEventListener("pointerup", pu);
    this.canvas.addEventListener("pointercancel", pu);
    this.unbind.push(() => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", resize);
      this.canvas.removeEventListener("pointerdown", pd);
      this.canvas.removeEventListener("pointermove", pm);
      this.canvas.removeEventListener("pointerup", pu);
      this.canvas.removeEventListener("pointercancel", pu);
    });
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private loop = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > 0.1) dt = 0.1;
    this.acc += dt;
    while (this.acc >= STEP) {
      if (!this.paused && !this.over && this.hitstop <= 0) this.step(STEP);
      if (this.hitstop > 0) this.hitstop -= STEP;
      this.acc -= STEP;
    }
    this.draw();
  };

  private moveAxis(): { mx: number; my: number } {
    let mx = 0;
    let my = 0;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) mx -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) mx += 1;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) my -= 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) my += 1;
    if (this.stick) {
      const dx = this.stick.x - this.stick.ox;
      const dy = this.stick.y - this.stick.oy;
      const len = Math.hypot(dx, dy);
      if (len > 10) {
        const k = Math.min(1, (len - 10) / (STICK_R - 10));
        mx += (dx / len) * k;
        my += (dy / len) * k;
      }
    }
    const n = Math.hypot(mx, my);
    if (n > 1) {
      mx /= n;
      my /= n;
    }
    return { mx, my };
  }

  private step(dt: number) {
    const p = this.player;
    const { mx, my } = this.moveAxis();
    const body = this.body();
    const max = body.maxSpeed * (p.haste > 0 ? PHYS.hasteMul : 1);
    if (mx !== 0 || my !== 0) {
      p.vx += mx * body.accel * dt;
      p.vy += my * body.accel * dt;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > max) {
        p.vx = (p.vx / sp) * max;
        p.vy = (p.vy / sp) * max;
      }
    } else {
      const damp = Math.exp(-PHYS.friction * dt);
      p.vx *= damp;
      p.vy *= damp;
      if (Math.hypot(p.vx, p.vy) < PHYS.stopSpeed) {
        p.vx = 0;
        p.vy = 0;
      }
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    this.clock += dt;
    this.bumpProps(p);
    const pad = PHYS.worldPad;
    if (p.x < pad) {
      p.x = pad;
      p.vx = Math.max(0, p.vx);
    } else if (p.x > this.world - pad) {
      p.x = this.world - pad;
      p.vx = Math.min(0, p.vx);
    }
    if (p.y < pad) {
      p.y = pad;
      p.vy = Math.max(0, p.vy);
    } else if (p.y > this.world - pad) {
      p.y = this.world - pad;
      p.vy = Math.min(0, p.vy);
    }
    const pSpd = Math.hypot(p.vx, p.vy);
    const stride = this.body().sheet?.stridePx ?? ANIM.stridePx;
    if (pSpd > 18) p.anim += (pSpd / stride) * dt;
    else if (!this.body().sheet) p.anim += ANIM.idleFps * dt * 0.2;
    if (mx < -0.12) p.aim = Math.abs(p.aim + Math.PI / 2) < 2 ? -Math.PI / 2 - 0.2 : p.aim;
    if (Math.abs(mx) > 0.08) p.aim = mx < 0 ? -Math.PI + 0.4 : -0.4;

    if (this.aimTouch) {
      p.aim = Math.atan2(this.aimTouch.y - this.h * 0.55, this.aimTouch.x - this.w / 2);
    } else if (this.pointer.down && !this.stick) {
      p.aim = Math.atan2(this.pointer.y - this.h * 0.55, this.pointer.x - this.w / 2);
    } else if (!this.stick && (this.keys.size || this.pointer.down)) {
      const sx = this.pointer.x - this.w / 2;
      const sy = this.pointer.y - this.h * 0.55;
      if (this.pointer.down || this.keys.has("MouseAim")) p.aim = Math.atan2(sy, sx);
    }

    p.fire -= dt;
    p.inv = Math.max(0, p.inv - dt);
    p.shield = Math.max(0, p.shield - dt);
    p.multi = Math.max(0, p.multi - dt);
    p.haste = Math.max(0, p.haste - dt);
    if (p.fire <= 0) {
      this.shoot();
      if (this.mag > 0) this.mag -= 1;
      p.fire = p.haste > 0 ? PHYS.fireHaste : PHYS.fireRate;
    }

    this.camX += (p.x - this.camX) * PHYS.camFollow;
    this.camY += (p.y + PHYS.camLook - this.camY) * PHYS.camFollow;
    this.shake = Math.max(0, this.shake - dt * 8);

    this.waveT = Math.max(0, this.waveT - dt);
    this.spawnT -= dt;
    if (this.toSpawn > 0 && this.spawnT <= 0) {
      this.spawnEnemy();
      this.toSpawn -= 1;
      this.spawnT = Math.max(0.28, 0.85 - this.wave * 0.04);
    }
    if (this.toSpawn <= 0 && !this.enemies.some((e) => e.alive) && this.waveT <= 0) {
      this.wave += 1;
      this.toSpawn = 5 + this.wave * 2;
      this.waveT = 2;
      this.spawnT = 0.5;
    }

    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const want = e.kind === "cruiser" ? 70 : e.kind === "fighter" ? 95 : 120;
      e.vx += (dx / d) * want * dt * 3;
      e.vy += (dy / d) * want * dt * 3;
      const sp = Math.hypot(e.vx, e.vy);
      if (sp > want) {
        e.vx = (e.vx / sp) * want;
        e.vy = (e.vy / sp) * want;
      }
      for (const o of this.enemies) {
        if (!o.alive || o === e) continue;
        const ox = e.x - o.x;
        const oy = e.y - o.y;
        const od = Math.hypot(ox, oy) || 1;
        if (od < e.r + o.r + 8) {
          e.vx += (ox / od) * 40 * dt;
          e.vy += (oy / od) * 40 * dt;
        }
      }
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.anim += (Math.hypot(e.vx, e.vy) / ANIM.stridePx) * dt;
      e.faceLeft = dx < 0;
      e.flash = Math.max(0, e.flash - dt);
      if (e.kind === "fighter" && Math.random() < dt * 0.35) this.enemyShot(e);
      if (d < e.r + p.r) {
        const push = (e.r + p.r - d) / PHYS.mass;
        p.x -= (dx / d) * push * 0.4;
        p.y -= (dy / d) * push * 0.4;
        this.hurt(-dx, -dy);
      }
    }

    for (const b of this.bolts) {
      if (!b.alive) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0) b.alive = false;
      if (b.from === "p") {
        for (const e of this.enemies) {
          if (!e.alive) continue;
          if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r) {
            b.alive = false;
            this.hitEnemy(e);
            break;
          }
        }
      } else if (p.inv <= 0 && Math.hypot(b.x - p.x, b.y - p.y) < p.r + b.r) {
        b.alive = false;
        this.hurt(p.x - b.x, p.y - b.y);
      }
    }

    for (const d of this.drops) {
      if (!d.alive) continue;
      d.t -= dt;
      if (d.t <= 0) d.alive = false;
      if (Math.hypot(d.x - p.x, d.y - p.y) < PHYS.pickupR) {
        d.alive = false;
        if (d.kind === "multi") p.multi = 8;
        if (d.kind === "shield") p.shield = 8;
        if (d.kind === "speed") p.haste = 8;
      }
    }
    for (const f of this.fx) {
      if (!f.alive) continue;
      f.t += dt;
      if (f.t >= f.max) f.alive = false;
    }
  }

  private shoot() {
    const p = this.player;
    const aim = this.aimTouch
      ? Math.atan2(this.aimTouch.y - this.h * 0.55, this.aimTouch.x - this.w / 2)
      : this.nearestAim();
    p.aim = aim;
    const n = p.multi > 0 ? 3 : 1;
    const spread = n === 1 ? 0 : 0.18;
    for (let i = 0; i < n; i++) {
      const a = aim + (i - (n - 1) / 2) * spread;
      this.emitBolt(p.x + Math.cos(a) * 22, p.y + Math.sin(a) * 16, Math.cos(a) * 520, Math.sin(a) * 520, "p", 0.9);
    }
    this.emitFx(p.x + Math.cos(aim) * 20, p.y + Math.sin(aim) * 14, "muzzle", 0.08, 0.7);
  }

  private nearestAim(): number {
    const p = this.player;
    if (this.pointer.down && !this.stick) return Math.atan2(this.pointer.y - this.h * 0.55, this.pointer.x - this.w / 2);
    let best = 1e9;
    let ang = p.aim;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < best) {
        best = d;
        ang = Math.atan2(e.y - p.y, e.x - p.x);
      }
    }
    if (best > 520 && (p.vx || p.vy)) ang = Math.atan2(p.vy, p.vx);
    return ang;
  }

  private emitBolt(x: number, y: number, vx: number, vy: number, from: "p" | "e", life: number) {
    const b = this.bolts.find((o) => !o.alive);
    if (!b) return;
    b.x = x;
    b.y = y;
    b.vx = vx;
    b.vy = vy;
    b.from = from;
    b.life = life;
    b.r = from === "p" ? 4 : 5;
    b.alive = true;
  }

  private emitFx(x: number, y: number, kind: Fx["kind"], max: number, s: number) {
    const f = this.fx.find((o) => !o.alive);
    if (!f) return;
    f.x = x;
    f.y = y;
    f.t = 0;
    f.max = max;
    f.kind = kind;
    f.s = s;
    f.alive = true;
  }

  private spawnEnemy() {
    const e = this.enemies.find((o) => !o.alive);
    if (!e) return;
    const side = Math.floor(Math.random() * 4);
    const p = this.player;
    const span = 360 + Math.random() * 220;
    if (side === 0) {
      e.x = p.x + span;
      e.y = p.y + (Math.random() - 0.5) * 500;
    } else if (side === 1) {
      e.x = p.x - span;
      e.y = p.y + (Math.random() - 0.5) * 500;
    } else if (side === 2) {
      e.x = p.x + (Math.random() - 0.5) * 500;
      e.y = p.y + span;
    } else {
      e.x = p.x + (Math.random() - 0.5) * 500;
      e.y = p.y - span;
    }
    const roll = Math.random();
    e.kind = this.wave > 4 && roll > 0.78 ? "cruiser" : this.wave > 2 && roll > 0.55 ? "fighter" : "scout";
    e.hp = e.kind === "cruiser" ? 5 : e.kind === "fighter" ? 3 : 1;
    e.r = e.kind === "cruiser" ? 24 : e.kind === "fighter" ? 18 : 15;
    e.vx = 0;
    e.vy = 0;
    e.flash = 0;
    e.anim = Math.random() * ANIM.frames;
    e.alive = true;
  }

  private enemyShot(e: Actor) {
    const a = Math.atan2(this.player.y - e.y, this.player.x - e.x);
    this.emitBolt(e.x, e.y, Math.cos(a) * 240, Math.sin(a) * 240, "e", 1.6);
  }

  private hitEnemy(e: Actor) {
    e.hp -= 1;
    e.flash = 0.08;
    this.shake = Math.max(this.shake, 3);
    this.hitstop = 0.03;
    if (e.hp <= 0) {
      e.alive = false;
      this.score += e.kind === "cruiser" ? 300 : e.kind === "fighter" ? 150 : 100;
      this.emitFx(e.x, e.y, "boom", 0.45, e.kind === "cruiser" ? 1.6 : 1);
      this.emitFx(e.x, e.y, "pop", 0.7, 1);
      if (Math.random() < 0.16) {
        const d = this.drops.find((o) => !o.alive);
        if (d) {
          d.x = e.x;
          d.y = e.y;
          d.kind = (["multi", "shield", "speed"] as const)[Math.floor(Math.random() * 3)];
          d.t = 8;
          d.alive = true;
        }
      }
    }
  }

  private hurt(nx = 0, ny = 0) {
    const p = this.player;
    if (p.inv > 0) return;
    const len = Math.hypot(nx, ny) || 1;
    p.vx += (nx / len) * (PHYS.knockback / PHYS.mass);
    p.vy += (ny / len) * (PHYS.knockback / PHYS.mass);
    if (p.shield > 0) {
      p.shield = 0;
      p.inv = PHYS.hitInv * 0.5;
      this.shake = 6;
      return;
    }
    this.lives -= 1;
    p.inv = PHYS.hitInv;
    this.shake = 10;
    this.hitstop = 0.08;
    this.emitFx(p.x, p.y, "boom", 0.4, 1.2);
    if (this.lives <= 0) this.over = true;
  }

  private onDown(e: PointerEvent) {
    e.preventDefault();
    this.canvas.setPointerCapture(e.pointerId);
    const x = e.clientX - this.canvas.getBoundingClientRect().left;
    const y = e.clientY - this.canvas.getBoundingClientRect().top;
    if (this.over || this.paused) {
      this.hitUi(x, y);
      return;
    }
    if (x > this.w - 72 && y < 72) {
      this.paused = true;
      return;
    }
    if (e.pointerType === "touch") {
      if (!this.stick) this.stick = { id: e.pointerId, ox: x, oy: y, x, y };
      else this.aimTouch = { id: e.pointerId, x, y };
    } else {
      this.pointer.down = true;
      this.pointer.x = x;
      this.pointer.y = y;
    }
  }

  private onMove(e: PointerEvent) {
    const x = e.clientX - this.canvas.getBoundingClientRect().left;
    const y = e.clientY - this.canvas.getBoundingClientRect().top;
    this.pointer.x = x;
    this.pointer.y = y;
    if (this.stick && this.stick.id === e.pointerId) {
      this.stick.x = x;
      this.stick.y = y;
    }
    if (this.aimTouch && this.aimTouch.id === e.pointerId) {
      this.aimTouch.x = x;
      this.aimTouch.y = y;
    }
  }

  private onUp(e: PointerEvent) {
    if (this.stick?.id === e.pointerId) this.stick = null;
    if (this.aimTouch?.id === e.pointerId) this.aimTouch = null;
    if (e.pointerType !== "touch") this.pointer.down = false;
  }

  private hitUi(x: number, y: number) {
    const cx = this.w / 2;
    const cy = this.h / 2;
    if (y > cy + 10 && y < cy + 58 && x > cx - 110 && x < cx + 110) {
      if (this.over) this.resetRun();
      else this.paused = false;
      return;
    }
    if (y > cy + 68 && y < cy + 116 && x > cx - 110 && x < cx + 110) {
      this.hooks.onHq();
    }
  }

  private bumpProps(p: { x: number; y: number; vx: number; vy: number; r: number }) {
    for (const o of this.props) {
      const dx = p.x - o.x;
      const dy = p.y - o.y;
      const d = Math.hypot(dx, dy) || 0.001;
      const min = p.r + o.r;
      if (d < min) {
        const k = (min - d) / d;
        p.x += dx * k;
        p.y += dy * k;
        p.vx += dx * 8;
        p.vy += dy * 8;
      }
    }
  }

  snapshot() {
    const g = this.hooks.gear?.() ?? {};
    const helmOn = g.helm && g.helm !== "none" && g.helm !== "lost";
    const mm = Math.floor(this.clock / 60);
    const ss = Math.floor(this.clock % 60);
    return {
      score: this.score,
      wave: this.wave,
      lives: this.lives,
      paused: this.paused,
      over: this.over,
      mag: this.mag,
      magMax: this.magMax,
      helm: helmOn ? 62 : 0,
      vis: 100,
      clock: `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
    };
  }

  togglePause() {
    if (this.over) this.resetRun();
    else this.paused = !this.paused;
  }

  private w2s(x: number, y: number) {
    const jx = (Math.random() - 0.5) * this.shake;
    const jy = (Math.random() - 0.5) * this.shake;
    return { x: x - this.camX + this.w / 2 + jx, y: y - this.camY + this.h * 0.55 + jy };
  }

  private draw() {
    const { ctx, w, h } = this;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);
    this.drawGround();
    const pp = this.w2s(this.player.x, this.player.y);
    const sprites: { y: number; z: number; run: () => void }[] = [];
    for (const o of this.props) {
      const q = this.w2s(o.x, o.y);
      sprites.push({
        y: o.y,
        z: 1,
        run: () => this.blit(o.sprite, q.x, q.y, o.size, o.size, false),
      });
    }
    for (const d of this.drops) {
      if (!d.alive) continue;
      const q = this.w2s(d.x, d.y);
      sprites.push({ y: d.y, z: 2, run: () => this.drawDrop(d.kind, q.x, q.y) });
    }
    for (const b of this.bolts) {
      if (!b.alive) continue;
      const q = this.w2s(b.x, b.y);
      sprites.push({
        y: b.y,
        z: 3,
        run: () => this.blit(b.from === "p" ? "boltP" : "boltE", q.x, q.y, 12, 12, false),
      });
    }
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const q = this.w2s(e.x, e.y);
      const sz = e.kind === "cruiser" ? 52 : e.kind === "fighter" ? 42 : 34;
      sprites.push({
        y: e.y,
        z: 4,
        run: () => {
          ctx.globalAlpha = e.flash > 0 ? 0.45 : 1;
          this.blit("isoEnemy", q.x, q.y, sz, sz, e.faceLeft);
          ctx.globalAlpha = 1;
        },
      });
    }
    sprites.push({
      y: this.player.y,
      z: 5,
      run: () => {
        const bob = Math.sin(performance.now() / 220) * 0.8;
        ctx.globalAlpha = this.player.inv > 0 && Math.floor(performance.now() / 80) % 2 === 0 ? 0.4 : 1;
        this.drawHero(pp.x, pp.y + bob);
        ctx.globalAlpha = 1;
      },
    });
    sprites.sort((a, b) => a.y - b.y || a.z - b.z);
    for (const s of sprites) s.run();
    for (const f of this.fx) {
      if (!f.alive) continue;
      const q = this.w2s(f.x, f.y);
      const k = f.t / f.max;
      ctx.globalAlpha = 1 - k;
      if (f.kind === "boom") this.blit("explode", q.x, q.y, 70 * f.s * (0.6 + k), 70 * f.s * (0.6 + k), false);
      else if (f.kind === "muzzle") this.blit("muzzle", q.x, q.y, 22, 22, false);
      ctx.globalAlpha = 1;
    }
    if (this.stick) this.drawStick();
    if (this.paused || this.over) this.drawMenu();
  }

  private drawGround() {
    const im = this.imgs.isoGround;
    const { ctx, w, h } = this;
    const tw = 320;
    const th = 320;
    if (!im || !im.naturalWidth) {
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, w, h);
      return;
    }
    const ox = -(((this.camX) % tw) + tw) % tw;
    const oy = -(((this.camY) % th) + th) % th;
    for (let x = ox - tw; x < w + tw; x += tw) {
      for (let y = oy - th; y < h + th; y += th) {
        ctx.drawImage(im, x, y, tw, th);
      }
    }
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, w, h);
  }

  private drawDrop(kind: Drop["kind"], x: number, y: number) {
    const { ctx } = this;
    const pulse = 13 + Math.sin(performance.now() / 180) * 2;
    ctx.save();
    ctx.strokeStyle = "#efe8d8";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(x - pulse, y - pulse, pulse * 2, pulse * 2);
    ctx.restore();
    const key = kind === "multi" ? "multi" : kind === "shield" ? "shield" : "speed";
    this.blit(key, x, y, 34, 34, false);
  }

  private gearOn(id: string) {
    const g = this.hooks.gear?.() ?? {};
    const v = g[id];
    return v != null && v !== "none" && v !== "lost";
  }

  private family(): "tank" | "drone" | "air" | "soldier" {
    const u = this.hooks.unit;
    if (u === "tank") return "tank";
    if (u === "drone") return "drone";
    if (u === "air") return "air";
    return "soldier";
  }

  private drawHero(x: number, y: number) {
    const body = this.body();
    const pl = this.player;
    const fam = this.family();
    const faceLeft = body.sheet ? pl.vx < -12 || (Math.abs(pl.vx) <= 12 && Math.cos(pl.aim) < 0) : Math.cos(pl.aim) < 0;
    if (fam === "soldier") {
      this.blitUnit("isoSoldierWalk", x, y, 54, faceLeft, pl.anim, {
        cols: 3,
        rows: 3,
        frames: 8,
        stridePx: 42,
      });
      return;
    }
    if (fam === "tank") {
      this.blitUnit("tankDrive", x, y, body.size, faceLeft, pl.anim, body.sheet);
      this.strokeTankKit(x, y, body.size, faceLeft);
      return;
    }
    if (fam === "drone") {
      this.blitUnit("unitDrone", x, y, body.size, faceLeft, 0);
      this.strokeDroneKit(x, y, body.size, faceLeft);
      return;
    }
    this.blitUnit(body.sprite, x, y, body.size, faceLeft, pl.anim, body.sheet);
  }

  private strokeSoldierKit(x: number, y: number, size: number, flip: boolean) {
    const { ctx } = this;
    const s = size;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.strokeStyle = "#efe8d8";
    ctx.lineWidth = 1.35;
    ctx.lineJoin = "round";
    if (this.gearOn("pack")) {
      ctx.strokeRect(-s * 0.2, -s * 0.18, s * 0.18, s * 0.28);
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, -s * 0.18);
      ctx.lineTo(-s * 0.12, -s * 0.26);
      ctx.lineTo(-s * 0.02, -s * 0.18);
      ctx.stroke();
    }
    if (this.gearOn("armor")) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.16, -s * 0.22);
      ctx.lineTo(s * 0.16, -s * 0.22);
      ctx.lineTo(s * 0.14, s * 0.08);
      ctx.lineTo(-s * 0.14, s * 0.08);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeRect(-s * 0.1, -s * 0.16, s * 0.08, s * 0.12);
      ctx.strokeRect(s * 0.02, -s * 0.16, s * 0.08, s * 0.12);
    }
    if (this.gearOn("radio")) {
      ctx.strokeRect(s * 0.12, -s * 0.14, s * 0.12, s * 0.16);
      ctx.beginPath();
      ctx.moveTo(s * 0.18, -s * 0.14);
      ctx.lineTo(s * 0.18, -s * 0.32);
      ctx.stroke();
    }
    if (this.gearOn("helm")) {
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.4, s * 0.15, s * 0.12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.38, s * 0.16, s * 0.06, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    if (this.gearOn("roleItem")) {
      ctx.strokeRect(s * 0.1, s * 0.1, s * 0.14, s * 0.12);
      ctx.beginPath();
      ctx.moveTo(s * 0.17, s * 0.12);
      ctx.lineTo(s * 0.17, s * 0.2);
      ctx.moveTo(s * 0.13, s * 0.16);
      ctx.lineTo(s * 0.21, s * 0.16);
      ctx.stroke();
    }
    if (this.gearOn("public")) {
      ctx.strokeRect(s * 0.16, s * 0.22, s * 0.12, s * 0.1);
    }
    ctx.restore();
  }

  private strokeTankKit(x: number, y: number, size: number, flip: boolean) {
    const { ctx } = this;
    const s = size;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.strokeStyle = "#efe8d8";
    ctx.lineWidth = 1.3;
    if (this.gearOn("armor")) {
      for (let i = 0; i < 4; i++) {
        ctx.strokeRect(-s * 0.28 + i * s * 0.12, -s * 0.12, s * 0.1, s * 0.1);
      }
    }
    if (this.gearOn("radio")) {
      ctx.beginPath();
      ctx.moveTo(s * 0.08, -s * 0.22);
      ctx.lineTo(s * 0.12, -s * 0.48);
      ctx.stroke();
      ctx.strokeRect(s * 0.05, -s * 0.22, s * 0.08, s * 0.06);
    }
    if (this.gearOn("pack") || this.gearOn("public")) {
      ctx.strokeRect(-s * 0.34, s * 0.02, s * 0.14, s * 0.12);
    }
    ctx.restore();
  }

  private strokeDroneKit(x: number, y: number, size: number, flip: boolean) {
    const { ctx } = this;
    const s = size;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.strokeStyle = "#efe8d8";
    ctx.lineWidth = 1.3;
    if (this.gearOn("radio")) {
      ctx.beginPath();
      ctx.moveTo(s * 0.16, -s * 0.08);
      ctx.lineTo(s * 0.16, -s * 0.32);
      ctx.moveTo(-s * 0.16, -s * 0.08);
      ctx.lineTo(-s * 0.16, -s * 0.28);
      ctx.stroke();
    }
    if (this.gearOn("roleItem")) {
      ctx.beginPath();
      ctx.arc(0, s * 0.2, s * 0.08, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(-s * 0.05, s * 0.12, s * 0.1, s * 0.06);
    }
    if (this.gearOn("pack")) {
      ctx.strokeRect(-s * 0.08, -s * 0.04, s * 0.16, s * 0.08);
    }
    ctx.restore();
  }

  private wear(key: string, x: number, y: number, size: number, flip: boolean, ox: number, oy: number, scale: number) {
    const im = this.imgs[key];
    if (!im || !im.naturalWidth) return;
    const { ctx } = this;
    const s = size * Math.min(scale, 0.36);
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    const aspect = im.naturalWidth / im.naturalHeight;
    const bw = aspect >= 1 ? s : s * aspect;
    const bh = aspect >= 1 ? s / aspect : s;
    ctx.drawImage(im, ox * size - bw / 2, oy * size - bh / 2, bw, bh);
    ctx.restore();
  }

  private drawParallax() {
    const { ctx, w, h } = this;
    const unit = this.hooks.unit || "infantry";
    const mapKey = UNIT_MAP[unit] ?? "mapInfantry";
    const aerial = AERIAL.has(unit);
    const layers: { key: string; k: number; a: number }[] = aerial
      ? [
          { key: mapKey, k: 0.08, a: 0.58 },
          { key: mapKey, k: 0.2, a: 0.38 },
        ]
      : [
          { key: "bgFar", k: 0.1, a: 0.42 },
          { key: mapKey, k: 0.34, a: 0.74 },
          { key: "bgNear", k: 0.7, a: 0.5 },
        ];
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (const layer of layers) {
      const im = this.imgs[layer.key];
      if (!im || !im.naturalWidth) continue;
      const tw = im.naturalWidth;
      const th = im.naturalHeight;
      const ox = -(((this.camX * layer.k) % tw) + tw) % tw;
      const oy = -(((this.camY * layer.k) % th) + th) % th;
      ctx.globalAlpha = layer.a;
      for (let x = ox - tw; x < w + tw; x += tw) {
        for (let y = oy - th; y < h + th; y += th) {
          ctx.drawImage(im, x, y, tw, th);
        }
      }
    }
    ctx.restore();
  }

  private blitUnit(
    key: string,
    x: number,
    y: number,
    size: number,
    flip: boolean,
    anim = 0,
    sheet?: { cols: number; rows: number; frames: number; stridePx: number },
  ) {
    const im = this.imgs[key];
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.strokeStyle = "rgba(239,232,216,0.32)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.28, size * 0.32, size * 0.1, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (im && im.complete && im.naturalWidth) {
      if (sheet) {
        const fw = im.naturalWidth / sheet.cols;
        const fh = im.naturalHeight / sheet.rows;
        const n = sheet.frames;
        const i = ((Math.floor(anim) % n) + n) % n;
        const sx = (i % sheet.cols) * fw;
        const sy = Math.floor(i / sheet.cols) * fh;
        ctx.drawImage(im, sx, sy, fw, fh, -size / 2, -size * 0.62, size, size * (fh / fw));
      } else {
        const aspect = im.naturalWidth / im.naturalHeight;
        const bw = aspect >= 1 ? size : size * aspect;
        const bh = aspect >= 1 ? size / aspect : size;
        ctx.drawImage(im, -bw / 2, -bh * 0.62, bw, bh);
      }
    }
    ctx.restore();
  }

  private drawFront(x: number, y: number) {
    const { ctx, w, h } = this;
    const r = Math.min(w, h) * FRONT_R;
    ctx.save();
    ctx.strokeStyle = "rgba(239,232,216,0.16)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y + 10, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(239,232,216,0.08)";
    ctx.beginPath();
    ctx.arc(x, y + 10, r * 0.62, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(239,232,216,0.05)";
    ctx.beginPath();
    ctx.arc(x, y + 10, r * 1.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawActor(key: string, anim: number, x: number, y: number, bw: number, bh: number, faceLeft: boolean, ring: boolean) {
    const { ctx } = this;
    if (ring) {
      ctx.save();
      ctx.strokeStyle = key.startsWith("player") ? "rgba(239,232,216,0.35)" : "rgba(196,69,58,0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y + bh * 0.38, bw * 0.28, bh * 0.08, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    this.blitSheet(key, anim, x, y, bw, bh, faceLeft);
  }

  private blitSheet(key: string, anim: number, x: number, y: number, bw: number, bh: number, flip: boolean) {
    const im = this.imgs[key];
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    if (im && im.complete && im.naturalWidth) {
      const fw = im.naturalWidth / ANIM.cols;
      const fh = im.naturalHeight / ANIM.rows;
      const i = ((Math.floor(anim) % ANIM.frames) + ANIM.frames) % ANIM.frames;
      const sx = (i % ANIM.cols) * fw;
      const sy = Math.floor(i / ANIM.cols) * fh;
      ctx.drawImage(im, sx, sy, fw, fh, -bw / 2, -bh * 0.62, bw, bh);
    } else {
      ctx.fillStyle = "#efe8d8";
      ctx.beginPath();
      ctx.arc(0, 0, bw * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private blit(key: string, x: number, y: number, bw: number, bh: number, flip: boolean) {
    const im = this.imgs[key];
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    if (im && im.complete && im.naturalWidth) ctx.drawImage(im, -bw / 2, -bh * 0.62, bw, bh);
    else {
      ctx.fillStyle = "#efe8d8";
      ctx.beginPath();
      ctx.arc(0, 0, bw * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawStick() {
    if (!this.stick) return;
    const { ctx } = this;
    const { ox, oy, x, y } = this.stick;
    let dx = x - ox;
    let dy = y - oy;
    const len = Math.hypot(dx, dy);
    if (len > STICK_R) {
      dx = (dx / len) * STICK_R;
      dy = (dy / len) * STICK_R;
    }
    ctx.strokeStyle = "rgba(239,232,216,0.45)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(ox, oy, STICK_R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ox + dx, oy + dy, 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawHud() {
    const { ctx, w } = this;
    const ua = this.hooks.lang === "ua" || this.hooks.lang === "ru";
    ctx.fillStyle = "#efe8d8";
    ctx.font = "600 22px Alumni Sans, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(String(this.score), 18, 36);
    ctx.font = "16px Alumni Sans, sans-serif";
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = i < this.lives ? 0.95 : 0.2;
      ctx.beginPath();
      const dx = 18 + i * 16;
      const dy = 52;
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + 5, dy + 5);
      ctx.lineTo(dx, dy + 10);
      ctx.lineTo(dx - 5, dy + 5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.font = "600 18px Alumni Sans, sans-serif";
    ctx.fillText(String(this.wave), w / 2, 36);
    if (this.waveT > 0 && !this.paused && !this.over) {
      ctx.globalAlpha = Math.min(1, this.waveT);
      ctx.font = "600 42px Alumni Sans, sans-serif";
      ctx.letterSpacing = "0.18em";
      ctx.fillText(`${ua ? "ХВИЛЯ" : "WAVE"} ${this.wave}`, w / 2, this.h * 0.38);
      ctx.letterSpacing = "0";
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = "rgba(239,232,216,0.7)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(w - 52, 16, 36, 36);
    ctx.beginPath();
    ctx.moveTo(w - 38, 26);
    ctx.lineTo(w - 38, 42);
    ctx.moveTo(w - 30, 26);
    ctx.lineTo(w - 30, 42);
    ctx.stroke();
  }

  private drawMenu() {
    const { ctx, w, h } = this;
    ctx.fillStyle = "rgba(5,5,5,0.72)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#efe8d8";
    ctx.textAlign = "center";
    ctx.font = "600 36px Alumni Sans, sans-serif";
    const ua = this.hooks.lang !== "en" && this.hooks.lang !== "pl";
    ctx.fillText(this.over ? (ua ? "ЗАГИБЕЛЬ" : "KIA") : ua ? "ПАУЗА" : "PAUSE", w / 2, h / 2 - 36);
    ctx.strokeStyle = "#efe8d8";
    ctx.strokeRect(w / 2 - 110, h / 2 + 10, 220, 44);
    ctx.font = "600 18px Alumni Sans, sans-serif";
    ctx.fillText(this.over ? (ua ? "ЩЕ РАЗ" : "AGAIN") : ua ? "ДАЛІ" : "RESUME", w / 2, h / 2 + 38);
    ctx.strokeRect(w / 2 - 110, h / 2 + 68, 220, 44);
    ctx.fillText(ua ? "ШТАБ" : "HQ", w / 2, h / 2 + 96);
  }

  private installProbe() {
    window.__controlsTest = {
      getYaw: () => this.player.aim,
      getSpeed: () => Math.hypot(this.player.vx, this.player.vy),
      getX: () => this.player.x,
      getY: () => this.player.y,
      setKeys: (codes: string[]) => {
        this.keys.clear();
        codes.forEach((c) => this.keys.add(c));
      },
    };
  }
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getX?: () => number;
      getY?: () => number;
      setKeys: (codes: string[]) => void;
    };
  }
}
