import type { ReactNode, SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function S({ size = 28, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function Tryzub({ size = 72, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 80 108"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M40 4c-1 8-8 18-16 28-3 4-8 8-12 10 6 1 12 0 16-4 2 8 4 22 4 36h16c0-14 2-28 4-36 4 4 10 5 16 4-4-2-9-6-12-10C48 22 41 12 40 4z" />
      <path d="M28 86c2 6 6 10 12 12 6-2 10-6 12-12" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="40" cy="100" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

export function IconReliable(p: P) {
  return (
    <S {...p}>
      <path d="M32 8 52 16v16c0 14-9 24-20 28C21 56 12 46 12 32V16Z" />
      <path d="m22 33 7 7 14-16" />
    </S>
  );
}
export function IconSavior(p: P) {
  return (
    <S {...p}>
      <path d="M12 34c0-8 6-14 14-14 4 0 7 2 8 4 1-2 4-4 8-4 8 0 14 6 14 14 0 16-22 26-22 26S12 50 12 34Z" />
      <path d="M32 18v-8M28 14h8" />
    </S>
  );
}
export function IconDiscipline(p: P) {
  return (
    <S {...p}>
      <path d="m16 44 16-10 16 10" />
      <path d="m16 34 16-10 16 10" />
      <path d="m16 24 16-10 16 10" />
    </S>
  );
}
export function IconRisk(p: P) {
  return (
    <S {...p}>
      <path d="M32 10 56 54H8Z" />
      <path d="M32 28v12" />
      <circle cx="32" cy="46" r="1.6" fill="currentColor" />
    </S>
  );
}
export function IconBreach(p: P) {
  return (
    <S {...p}>
      <path d="M20 8v20l-8 8 8 6v14" />
      <path d="M44 8v16l8 10-8 8v14" />
    </S>
  );
}
export function IconBetray(p: P) {
  return (
    <S {...p}>
      <path d="M32 6c-1 6-6 14-12 22 4 0 8-2 12-8 0 10 2 22 2 32h8c0-10 2-22 2-32 4 6 8 8 12 8C50 20 45 12 44 6" />
      <path d="M20 52 44 28M24 28l20 24" />
    </S>
  );
}
export function IconHelm(p: P) {
  return (
    <S {...p}>
      <path d="M12 36c2-16 12-24 20-24s18 8 20 24H12Z" />
      <path d="M10 38h44" />
      <path d="M22 38v6M42 38v6" />
    </S>
  );
}
export function IconMedic(p: P) {
  return (
    <S {...p}>
      <circle cx="32" cy="32" r="22" />
      <path d="M32 18v28M18 32h28" />
    </S>
  );
}
export function IconDrone(p: P) {
  return (
    <S {...p}>
      <rect x="24" y="26" width="16" height="12" rx="2" />
      <circle cx="14" cy="20" r="8" />
      <circle cx="50" cy="20" r="8" />
      <circle cx="14" cy="44" r="8" />
      <circle cx="50" cy="44" r="8" />
      <path d="M22 32H14M42 32h8M32 26v-6" />
    </S>
  );
}
export function IconOfficer(p: P) {
  return (
    <S {...p}>
      <path d="m32 10 4 10h10l-8 7 3 11-9-6-9 6 3-11-8-7h10Z" />
      <path d="m16 50 16-8 16 8" />
      <path d="m20 42 12-6 12 6" />
    </S>
  );
}
export function IconCommander(p: P) {
  return (
    <S {...p}>
      <rect x="10" y="18" width="44" height="28" />
      <path d="M10 46h44v6H10Z" />
      <circle cx="22" cy="32" r="3" />
      <circle cx="32" cy="30" r="3" />
      <circle cx="42" cy="34" r="3" />
    </S>
  );
}
export function IconCrate(p: P) {
  return (
    <S {...p}>
      <path d="M12 22h40v28H12Z" />
      <path d="M12 22 32 12 52 22" />
      <path d="M32 12v38" />
    </S>
  );
}
export function IconArmor(p: P) {
  return (
    <S {...p}>
      <path d="M20 14h24l6 10v16c0 10-10 18-18 20-8-2-18-10-18-20V24Z" />
      <path d="M26 28h12M28 36h8" />
    </S>
  );
}
export function IconRadio(p: P) {
  return (
    <S {...p}>
      <rect x="18" y="18" width="28" height="36" rx="3" />
      <path d="M40 18V8M36 8h8" />
      <path d="M24 28h16M24 36h16M24 44h10" />
    </S>
  );
}
export function IconPack(p: P) {
  return (
    <S {...p}>
      <rect x="18" y="16" width="28" height="36" rx="3" />
      <path d="M18 24h-6v16h6M46 24h6v16h-6" />
      <path d="M26 16V10h12v6" />
    </S>
  );
}
export function IconHeart(p: P) {
  return (
    <S {...p}>
      <path d="M32 54S10 40 10 24c0-8 6-14 14-14 5 0 8 3 8 6 0-3 3-6 8-6 8 0 14 6 14 14 0 16-22 30-22 30Z" />
    </S>
  );
}
export function IconStar(p: P) {
  return (
    <S {...p}>
      <path d="m32 10 6 12 14 2-10 10 3 14-13-7-13 7 3-14-10-10 14-2Z" />
    </S>
  );
}
export function IconStress(p: P) {
  return (
    <S {...p}>
      <circle cx="32" cy="28" r="14" />
      <path d="M20 50c4-8 8-10 12-10s8 2 12 10" />
      <path d="M26 26h.01M38 26h.01M26 34c3 3 9 3 12 0" />
    </S>
  );
}
export function IconMic(p: P) {
  return (
    <S {...p}>
      <rect x="26" y="10" width="12" height="24" rx="6" />
      <path d="M20 30a12 12 0 0 0 24 0M32 42v10M24 52h16" />
    </S>
  );
}
export function IconWave({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 36" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 18h10l6-10 8 20 8-16 10 22 12-28 10 20 8-8 14 18 10-24 12 16 8-6 16 14 10-20 12 18 8-4 10 10" />
    </svg>
  );
}
export function IconSkull(p: P) {
  return (
    <S {...p}>
      <ellipse cx="32" cy="28" rx="16" ry="18" />
      <circle cx="26" cy="28" r="3" fill="currentColor" />
      <circle cx="38" cy="28" r="3" fill="currentColor" />
      <path d="M28 40v10M32 40v12M36 40v10" />
    </S>
  );
}
export function IconArrows(p: P) {
  return (
    <S {...p}>
      <path d="M32 8v48M8 32h48M32 8l-6 8M32 8l6 8M32 56l-6-8M32 56l6-8M8 32l8-6M8 32l8 6M56 32l-8-6M56 32l-8 6" />
    </S>
  );
}
export function IconPeople(p: P) {
  return (
    <S {...p}>
      <circle cx="22" cy="22" r="8" />
      <circle cx="42" cy="22" r="8" />
      <path d="M8 50c2-10 8-14 14-14s12 4 14 14" />
      <path d="M28 50c2-10 8-14 14-14s12 4 14 14" />
    </S>
  );
}
export function IconDoc(p: P) {
  return (
    <S {...p}>
      <path d="M18 8h20l10 10v38H18Z" />
      <path d="M38 8v10h10" />
      <path d="M26 28h16M26 36h16M26 44h10" />
    </S>
  );
}
export function IconCompass(p: P) {
  return (
    <S {...p}>
      <circle cx="32" cy="32" r="22" />
      <path d="m32 16 6 16-6 16-6-16Z" />
    </S>
  );
}
export function IconClock(p: P) {
  return (
    <S {...p}>
      <circle cx="32" cy="32" r="20" />
      <path d="M32 18v14l10 6" />
    </S>
  );
}
export function IconTarget(p: P) {
  return (
    <S {...p}>
      <circle cx="32" cy="32" r="16" />
      <circle cx="32" cy="32" r="6" />
      <path d="M32 8v10M32 46v10M8 32h10M46 32h10" />
    </S>
  );
}
export function IconPin(p: P) {
  return (
    <S {...p}>
      <path d="M32 56s16-18 16-28a16 16 0 1 0-32 0c0 10 16 28 16 28Z" />
      <circle cx="32" cy="26" r="5" />
    </S>
  );
}
