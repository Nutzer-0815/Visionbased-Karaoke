// Autocorrelation-based pitch detection for human voice.
// Covers bass (80 Hz) through soprano/whistle (1100 Hz).
// Runs entirely in the browser via Web Audio API — no backend needed.

const MIN_FREQ = 80;            // Hz — lowest expected fundamental
const MAX_FREQ = 1100;          // Hz — highest expected fundamental
const CLARITY_THRESHOLD = 0.4;  // normalized autocorrelation; below = noise
const RMS_THRESHOLD = 0.01;     // signal must be louder than this
const BUFFER_SIZE = 2048;       // ~46 ms at 44100 Hz
const DETECT_INTERVAL_MS = 80;

export type PitchResult = {
  freq: number | null; // Hz, or null if no clear pitch / silence
  clarity: number;     // 0–1; confidence score
};

export type PitchCallback = (result: PitchResult) => void;

function autoCorrelate(buf: Float32Array, sampleRate: number): PitchResult {
  const n = buf.length;

  // RMS silence gate
  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += buf[i] * buf[i];
  if (Math.sqrt(sumSq / n) < RMS_THRESHOLD) return { freq: null, clarity: 0 };

  const lagMin = Math.floor(sampleRate / MAX_FREQ);
  const lagMax = Math.min(Math.floor(sampleRate / MIN_FREQ), Math.floor(n / 2) - 1);

  let bestLag = lagMin;
  let bestCorr = -Infinity;

  for (let lag = lagMin; lag <= lagMax; lag++) {
    let corr = 0;
    const len = n - lag;
    for (let i = 0; i < len; i++) {
      corr += buf[i] * buf[i + lag];
    }
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  // Normalize against zero-lag energy so clarity is in [0, 1]
  const clarity = sumSq > 0 ? bestCorr / sumSq : 0;
  if (clarity < CLARITY_THRESHOLD) return { freq: null, clarity };

  return { freq: sampleRate / bestLag, clarity };
}

export class PitchDetector {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private buffer: Float32Array | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly callback: PitchCallback;

  constructor(callback: PitchCallback) {
    this.callback = callback;
  }

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = BUFFER_SIZE;
    this.source = this.audioCtx.createMediaStreamSource(this.stream);
    this.source.connect(this.analyser);
    this.buffer = new Float32Array(BUFFER_SIZE);
    this.intervalId = setInterval(() => { this.detect(); }, DETECT_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.source?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.audioCtx?.close();
    this.audioCtx = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
    this.buffer = null;
  }

  private detect(): void {
    if (!this.analyser || !this.buffer || !this.audioCtx) return;
    this.analyser.getFloatTimeDomainData(this.buffer);
    this.callback(autoCorrelate(this.buffer, this.audioCtx.sampleRate));
  }
}
