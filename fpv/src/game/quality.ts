export type Quality = {
  mobile: boolean;
  ios: boolean;
  dpr: number;
  antialias: boolean;
  cobbleSize: number;
  cobblePbr: boolean;
  cobbleDensity: number;
  rain: number;
  stars: number;
  far: number;
  fogNear: number;
  fogFar: number;
  terrainSegments: number;
  toneMapping: boolean;
  precision: "mediump" | "highp";
  anisotropy: number;
  maxBuffer: number;
  extraFillLight: boolean;
};

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function detectMobile(): boolean {
  if (typeof window === "undefined") return false;
  return (
    detectIOS() ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.innerWidth < 768
  );
}

export function getQuality(): Quality {
  const ios = detectIOS();
  const mobile = detectMobile();
  const cssLong =
    typeof window === "undefined" ? 1280 : Math.max(window.innerWidth, window.innerHeight);
  const dprCap = mobile ? 1 : Math.min(1.5, typeof window === "undefined" ? 1 : window.devicePixelRatio || 1);
  const maxBuffer = ios ? 960 : mobile ? 1100 : 1600;
  const dpr = Math.min(dprCap, maxBuffer / Math.max(1, cssLong));
  return {
    mobile,
    ios,
    dpr,
    antialias: !mobile,
    cobbleSize: mobile ? 512 : 1024,
    cobblePbr: !mobile,
    cobbleDensity: mobile ? 0.78 : 1,
    rain: mobile ? 72 : 220,
    stars: mobile ? 0 : 280,
    far: mobile ? 280 : 520,
    fogNear: mobile ? 22 : 40,
    fogFar: mobile ? 165 : 240,
    terrainSegments: mobile ? 48 : 80,
    toneMapping: !mobile,
    precision: mobile ? "mediump" : "highp",
    anisotropy: mobile ? 1 : 8,
    maxBuffer,
    extraFillLight: !mobile,
  };
}
