import type { Channel, ChatMsg, GearId, Mission, Origin, PathId, RoleId, Stats, UnitId } from "./types";

export const GEAR_IDS: GearId[] = ["helm", "armor", "radio", "pack", "roleItem", "public"];

export const DEFAULT_STATS: Stats = { trust: 54, reputation: 41, stress: 22, authority: 18 };

export const UNITS: {
  id: UnitId;
  founded: string;
  role: RoleId;
  art: string;
  artByPath?: Partial<Record<PathId, string>>;
}[] = [
  { id: "infantry", founded: "24.02.2022", role: "fighter", art: "/art/hero-infantry.jpg" },
  { id: "tank", founded: "24.02.2022", role: "fighter", art: "/art/hero-tank.jpg" },
  { id: "signal", founded: "21.06.2022", role: "comms", art: "/art/hero-radio.jpg" },
  {
    id: "air",
    founded: "24.02.2022",
    role: "officer",
    art: "/art/hero-f16.jpg",
    artByPath: { mobilized: "/art/hero-mig.jpg" },
  },
  { id: "drone", founded: "10.05.2022", role: "drone", art: "/art/hero-drone.jpg" },
  { id: "mortar", founded: "03.03.2022", role: "fighter", art: "/art/hero-mortar.jpg" },
  { id: "artillery", founded: "24.02.2022", role: "fighter", art: "/art/hero-arty.jpg" },
  { id: "airdef", founded: "24.02.2022", role: "fighter", art: "/art/hero-airdef.jpg" },
  { id: "medic", founded: "15.04.2022", role: "medic", art: "/art/hero-medic.jpg" },
  { id: "marine", founded: "24.02.2022", role: "fighter", art: "/art/hero-marine.jpg" },
  { id: "sapper", founded: "24.02.2022", role: "fighter", art: "/art/hero-sapper.jpg" },
  { id: "recon", founded: "24.02.2022", role: "fighter", art: "/art/hero-recon.jpg" },
];

export function heroArt(id: UnitId, path: PathId): string {
  const u = UNITS.find((x) => x.id === id);
  if (!u) return "/art/hero-infantry.jpg";
  return u.artByPath?.[path] ?? u.art;
}

export function isUnitId(v: unknown): v is UnitId {
  return typeof v === "string" && UNITS.some((u) => u.id === v);
}

export const ROLE_GEAR: Record<RoleId, GearId[]> = {
  fighter: ["helm", "armor", "radio"],
  medic: ["helm", "armor", "radio", "roleItem"],
  drone: ["helm", "radio", "roleItem"],
  comms: ["helm", "radio", "roleItem"],
  officer: ["helm", "radio", "pack"],
};

export function originsForPath(path: PathIdLike, role: RoleId): Record<GearId, Origin> {
  const kit = new Set(ROLE_GEAR[role]);
  const all: Record<GearId, Origin> = {
    helm: "none",
    armor: "none",
    radio: "none",
    pack: "none",
    roleItem: "none",
    public: "none",
  };
  const paint = (o: Origin) => {
    for (const id of GEAR_IDS) {
      if (kit.has(id) || id === "public") all[id] = o;
    }
    if (path === "mobilized") {
      all.pack = "none";
      all.public = "none";
      all.roleItem = kit.has("roleItem") ? "earned" : "none";
    }
  };
  if (path === "volunteer" || path === "mobilized") paint("earned");
  else if (path === "bought") paint("bought");
  else paint("boosted");
  return all;
}

type PathIdLike = "volunteer" | "bought" | "verified" | "mobilized";

export const SQUAD: Omit<ChatMsg, "id" | "text" | "at" | "channel">[] = [
  { who: "ХОРТ", role: "fighter", entry: "open", originEarned: true, originBought: false, originBoosted: true },
  { who: "ДОБРИЙ", role: "fighter", entry: "bought", originEarned: true, originBought: true, originBoosted: true },
  { who: "МЕДИК", role: "medic", entry: "boosted", originEarned: true, originBought: false, originBoosted: true },
  { who: "ВАРТА", role: "fighter", entry: "open", originEarned: false, originBought: false, originBoosted: true },
  { who: "СТАЛЬ", role: "drone", entry: "bought", originEarned: true, originBought: true, originBoosted: true },
  { who: "ПТАХ", role: "comms", entry: "open", originEarned: false, originBought: false, originBoosted: true },
];

export const LINES: Record<Channel, string[]> = {
  platoon: [
    "ПРИЙОМ",
    "ТРИМАЄМО ПОЗИЦІЮ",
    "БАЧУ ДРОН",
    "ЙДУ НА ЗВ'ЯЗОК",
    "СЕКТОР ЧИСТИЙ",
    "ПРИЙНЯВ",
    "РУХАЄМОСЬ ДАЛІ",
  ],
  medic: [
    "ПОТРІБНА ЕВАКУАЦІЯ",
    "ПОРАНЕНИХ НЕМАЄ",
    "СТІЙ. ПЕРЕВ'ЯЗУЮ",
    "ГОТОВИЙ ПРИЙНЯТИ",
    "ПУЛЬС СТАБІЛЬНИЙ",
  ],
  commander: [
    "ДИСЦИПЛІНА. БЕЗ САМОДІЯЛЬНОСТІ",
    "ПІДТВЕРДІТЬ ГОТОВНІСТЬ",
    "СЕКТОР Б-12. ТИХО",
    "ЧАКУЮ ДОПОВІДЬ",
    "ПРИЙНЯТО. ПРАЦЮЄМО",
  ],
};

export function missionsFor(role: RoleId): Mission[] {
  const evac: Mission = {
    id: "evac",
    channel: "medic",
    title: "ЕВАКУАЦІЯ",
    body: "З каналу медика: двоє поранених у посадці. Коридор під наглядом. Рішення за тобою.",
    choices: [
      {
        id: "go",
        label: "ВЕСТИ ГРУПУ НА ЕВАК",
        delta: { trust: 8, reputation: 6, stress: 10, authority: 4 },
        trail: 1,
        outcome: "Коридор утримано. Поранених забрали. Загін запам'ятав, хто пішов першим.",
      },
      {
        id: "wait",
        label: "ЧЕКАТИ ПРИКРИТТЯ",
        delta: { trust: 2, reputation: 1, stress: -4, authority: -2 },
        trail: 0,
        outcome: "Чекали. Вікно звузилось. Усі живі, але час втрачено.",
      },
      {
        id: "deny",
        label: "НЕ РИЗИКУВАТИ СЕКТОРОМ",
        delta: { trust: -10, reputation: -8, stress: -6, authority: 3 },
        trail: -1,
        outcome: "Сектор утримано. Позивний медика більше не звучить так само.",
      },
    ],
  };
  const drone: Mission = {
    id: "drone",
    channel: "platoon",
    title: "БАЧУ ДРОН",
    body: "Варта: чужий борт над лісосмугою. Рація шипить. Можна збити, сховатись або мовчати в ефірі.",
    choices: [
      {
        id: "hide",
        label: "МАСКУВАТИСЬ. МОВЧАННЯ В ЕФІРІ",
        delta: { trust: 4, reputation: 2, stress: 6, authority: 1 },
        trail: 1,
        outcome: "Борт пройшов. Ніхто не видав позицію. Хорт кивнув в ефір.",
      },
      {
        id: "shoot",
        label: "ЗБИТИ",
        delta: { trust: 1, reputation: 5, stress: 12, authority: 2 },
        trail: 0,
        outcome: "Борт упав. Через шість хвилин прилетіло важче.",
      },
      {
        id: "talk",
        label: "ВІДКРИТИМ ТЕКСТОМ НА КАНАЛ",
        delta: { trust: -6, reputation: -4, stress: 8, authority: -3 },
        trail: -1,
        outcome: "Ефір спалахнув. Координати почули не лише свої.",
      },
    ],
  };
  const crate: Mission = {
    id: "crate",
    channel: "commander",
    title: "ЯЩИК БЕЗ МАРКУВАННЯ",
    body: "На позицію привезли ящик. Жовта стрічка. Рація: «не ваше питання». Всередині — броня і тиша.",
    choices: [
      {
        id: "refuse",
        label: "ВІДМОВИТИСЬ. ЧЕКАЮ ОБЛІК",
        delta: { trust: 7, reputation: 5, stress: 3, authority: 2 },
        trail: 1,
        outcome: "Ящик забрали. У загоні це назвали характером.",
      },
      {
        id: "take",
        label: "ВЗЯТИ. ЗАВТРА РОЗБЕРЕМОСЬ",
        delta: { trust: -3, reputation: 2, stress: -2, authority: 1 },
        trail: 0,
        outcome: "Броня сіла як рідна. Походження — жовте.",
      },
      {
        id: "sell",
        label: "ПУСТИТИ ДАЛІ ПО ТИЛАХ",
        delta: { trust: -12, reputation: -9, stress: -4, authority: -6 },
        trail: -1,
        outcome: "Ящик зник. Позивний тепер іншим кольором.",
      },
    ],
  };
  if (role === "medic") return [evac, drone, crate];
  if (role === "drone") return [drone, evac, crate];
  return [drone, evac, crate];
}

export const QUICK: string[] = ["ПРИЙОМ", "ПРИЙНЯВ", "ТРИМАЄМО", "ЗРОЗУМІВ"];

export const QUOTE_UA =
  "Дисципліна вирішує там, де сила виснажується.";
export const QUOTE_BY = "Валерій Залужний";
