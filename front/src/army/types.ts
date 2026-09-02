export type Lang = "ua" | "en" | "ru" | "pl";
export type Screen =
  | "boot"
  | "register"
  | "gear"
  | "unit"
  | "how"
  | "karma"
  | "stats"
  | "hq"
  | "front";
export type HqTab = "situation" | "gear" | "squad" | "mission" | "dossier" | "radio";
export type RoleId = "fighter" | "medic" | "drone" | "comms" | "officer";
export type PathId = "volunteer" | "bought" | "verified" | "mobilized";
export type Origin = "earned" | "bought" | "boosted" | "none" | "lost";
export type GearId = "helm" | "armor" | "radio" | "pack" | "roleItem" | "public";
export type UnitId =
  | "infantry"
  | "tank"
  | "signal"
  | "air"
  | "drone"
  | "mortar"
  | "artillery"
  | "airdef"
  | "medic"
  | "marine"
  | "sapper"
  | "recon";
export type Channel = "platoon" | "medic" | "commander";
export type EntryStatus = "open" | "bought" | "boosted";

export type Stats = {
  trust: number;
  reputation: number;
  stress: number;
  authority: number;
};

export type ChatMsg = {
  id: string;
  who: string;
  role: RoleId;
  text: string;
  at: string;
  channel: Channel;
  entry: EntryStatus;
  originEarned: boolean;
  originBought: boolean;
  originBoosted: boolean;
  self?: boolean;
};

export type Choice = {
  id: string;
  label: string;
  delta: Partial<Stats>;
  trail: 1 | -1 | 0;
  outcome: string;
};

export type Mission = {
  id: string;
  channel: Channel;
  title: string;
  body: string;
  choices: Choice[];
};
