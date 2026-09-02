let ctx: AudioContext | null = null;
let hiss: AudioBufferSourceNode | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new C();
  }
  return ctx;
}

export function unlockAudio(): void {
  const c = ac();
  if (c && c.state === "suspended") void c.resume();
}

function beep(freq: number, dur: number, gain = 0.04, type: OscillatorType = "square"): void {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(c.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.stop(c.currentTime + dur + 0.02);
}

export function click(): void {
  beep(720, 0.04, 0.03, "square");
}

export function squelch(): void {
  beep(180, 0.08, 0.05, "sawtooth");
  setTimeout(() => beep(90, 0.12, 0.04, "square"), 40);
}

export function pttStart(): void {
  const c = ac();
  if (!c) return;
  pttStop();
  const bufferSize = 2 * c.sampleRate;
  const noise = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  filter.Q.value = 0.7;
  const g = c.createGain();
  g.gain.value = 0.035;
  src.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  src.start();
  hiss = src;
  beep(2400, 0.05, 0.04);
}

export function pttStop(): void {
  try {
    hiss?.stop();
  } catch {
    /* already */
  }
  hiss = null;
}

export function rx(): void {
  beep(1100, 0.05, 0.03, "square");
}
