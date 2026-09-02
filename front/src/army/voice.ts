const MAX_MS = 3000;

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SRCtor = new () => SR;

function SpeechCtor(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const LANG: Record<string, string> = {
  ua: "uk-UA",
  en: "en-US",
  ru: "ru-RU",
  pl: "pl-PL",
};

export function speechLang(ui: string): string {
  return LANG[ui] ?? "uk-UA";
}

export type VoiceHandle = {
  stop: () => Promise<string>;
};

export function startVoice(lang: string, onPartial: (text: string) => void): VoiceHandle {
  const Ctor = SpeechCtor();
  let text = "";
  let rec: SR | null = null;
  let ended = false;
  let resolveEnd: (() => void) | null = null;
  const endedP = new Promise<void>((res) => {
    resolveEnd = res;
  });

  const finish = () => {
    if (ended) return;
    ended = true;
    resolveEnd?.();
  };

  if (Ctor) {
    rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      let next = "";
      for (let i = 0; i < ev.results.length; i++) {
        next += ev.results[i][0].transcript;
      }
      text = next.replace(/\s+/g, " ").trim();
      if (text) onPartial(text);
    };
    rec.onerror = () => finish();
    rec.onend = () => finish();
    try {
      rec.start();
    } catch {
      finish();
    }
  } else {
    finish();
  }

  const cap = window.setTimeout(() => {
    try {
      rec?.stop();
    } catch {
      /* */
    }
    finish();
  }, MAX_MS);

  return {
    stop: async () => {
      window.clearTimeout(cap);
      try {
        rec?.stop();
      } catch {
        /* */
      }
      await Promise.race([endedP, new Promise<void>((r) => window.setTimeout(r, 280))]);
      try {
        rec?.abort();
      } catch {
        /* */
      }
      return text;
    },
  };
}

export const VOICE_MAX_MS = MAX_MS;
