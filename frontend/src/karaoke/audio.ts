type AudioOptions = {
  durationSec: number;
  sampleRate: number;
  frequency: number;
  volume: number;
};

const DEFAULT_AUDIO: AudioOptions = {
  durationSec: 10,
  sampleRate: 44100,
  frequency: 440,
  volume: 0.2,
};

const writeString = (view: DataView, offset: number, value: string) => {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
};

export function generateSineWavDataUrl(options?: Partial<AudioOptions>): string {
  const config = { ...DEFAULT_AUDIO, ...options };
  const numSamples = Math.floor(config.durationSec * config.sampleRate);
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = config.sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, config.sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const amplitude = Math.max(0, Math.min(1, config.volume)) * 32767;
  let offset = 44;
  for (let i = 0; i < numSamples; i += 1) {
    const sample = Math.sin((2 * Math.PI * config.frequency * i) / config.sampleRate);
    view.setInt16(offset, Math.round(sample * amplitude), true);
    offset += 2;
  }

  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  return `data:audio/wav;base64,${base64}`;
}

type Note = {
  freq: number; // Hz — 0 means silence/rest
  dur: number;  // seconds
};

export function generateMelodyDataUrl(notes: Note[], sampleRate = 44100, volume = 0.3): string {
  const totalSamples = notes.reduce((acc, n) => acc + Math.floor(n.dur * sampleRate), 0);
  const bytesPerSample = 2;
  const dataSize = totalSamples * bytesPerSample;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const amplitude = Math.max(0, Math.min(1, volume)) * 32767;
  const fadeSamples = Math.floor(sampleRate * 0.01); // 10 ms fade in/out per note
  let offset = 44;

  for (const note of notes) {
    const numSamples = Math.floor(note.dur * sampleRate);
    for (let i = 0; i < numSamples; i += 1) {
      let sample = 0;
      if (note.freq > 0) {
        sample = Math.sin((2 * Math.PI * note.freq * i) / sampleRate);
        if (i < fadeSamples) {
          sample *= i / fadeSamples;
        } else if (i > numSamples - fadeSamples) {
          sample *= (numSamples - i) / fadeSamples;
        }
      }
      view.setInt16(offset, Math.round(sample * amplitude), true);
      offset += 2;
    }
  }

  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

// BPM 80: quarter = 0.75 s, eighth = 0.375 s, dotted-half = 2.25 s
const _Q = 60 / 80;
const _E = _Q / 2;
const _DH = _Q * 3;

// Happy Birthday to You — public domain since 2016
// Key of C (starting on G4); line timings at BPM 80:
//   Line 1 starts 0.00 s, Line 2 at 5.25 s, Line 3 at 10.50 s, Line 4 at 16.50 s
const HAPPY_BIRTHDAY_NOTES: Note[] = [
  // Line 1: "Happy Birthday to you"
  { freq: 392, dur: _E },  // G4 Hap-
  { freq: 392, dur: _E },  // G4 -py
  { freq: 440, dur: _Q },  // A4 Birth-
  { freq: 392, dur: _Q },  // G4 -day
  { freq: 523, dur: _Q },  // C5 to
  { freq: 494, dur: _DH }, // B4 you
  // Line 2: "Happy Birthday to you"
  { freq: 392, dur: _E },
  { freq: 392, dur: _E },
  { freq: 440, dur: _Q },
  { freq: 392, dur: _Q },
  { freq: 587, dur: _Q },  // D5
  { freq: 523, dur: _DH }, // C5
  // Line 3: "Happy Birthday, lieber Freund"
  { freq: 392, dur: _E },
  { freq: 392, dur: _E },
  { freq: 784, dur: _Q },  // G5
  { freq: 659, dur: _Q },  // E5
  { freq: 523, dur: _Q },  // C5
  { freq: 494, dur: _Q },  // B4
  { freq: 440, dur: _DH }, // A4
  // Line 4: "Happy Birthday to you"
  { freq: 698, dur: _E },  // F5
  { freq: 698, dur: _E },
  { freq: 659, dur: _Q },  // E5
  { freq: 523, dur: _Q },  // C5
  { freq: 587, dur: _Q },  // D5
  { freq: 523, dur: _DH }, // C5
];

export function generateHappyBirthdayDataUrl(): string {
  return generateMelodyDataUrl(HAPPY_BIRTHDAY_NOTES);
}

// ── Demo Song ─────────────────────────────────────────────────────────────────
// BPM 120 — quarter = 0.5 s
// 3-second C-major arpeggio motif × 21 = 63 s
// Matches LRC: 21 lines every 3 s (last line at 00:57)
const _DQ = 60 / 120; // 0.5 s
const DEMO_MOTIF: Note[] = [
  { freq: 262, dur: _DQ }, // C4
  { freq: 330, dur: _DQ }, // E4
  { freq: 392, dur: _DQ }, // G4
  { freq: 330, dur: _DQ }, // E4
  { freq: 262, dur: _DQ }, // C4
  { freq: 0,   dur: _DQ }, // rest
];
const DEMO_NOTES: Note[] = Array.from({ length: 21 }, () => [...DEMO_MOTIF]).flat();

export function generateDemoDataUrl(): string {
  return generateMelodyDataUrl(DEMO_NOTES, 44100, 0.25);
}

// ── Techno Traum ──────────────────────────────────────────────────────────────
// 4-second driving bass pattern × 10 = 40 s
// Matches LRC: 10 lines every 4 s (last line at 00:36)
const TECHNO_BAR: Note[] = [
  { freq: 165, dur: 0.25 }, // E3 bass hit
  { freq: 0,   dur: 0.25 },
  { freq: 165, dur: 0.25 },
  { freq: 0,   dur: 0.25 },
  { freq: 220, dur: 0.25 }, // A3
  { freq: 0,   dur: 0.25 },
  { freq: 196, dur: 0.25 }, // G3
  { freq: 0,   dur: 0.25 },
  { freq: 165, dur: 0.25 },
  { freq: 0,   dur: 0.25 },
  { freq: 165, dur: 0.25 },
  { freq: 0,   dur: 0.25 },
  { freq: 247, dur: 0.25 }, // B3
  { freq: 0,   dur: 0.25 },
  { freq: 220, dur: 0.25 }, // A3
  { freq: 0,   dur: 0.25 },
];
const TECHNO_NOTES: Note[] = Array.from({ length: 10 }, () => [...TECHNO_BAR]).flat();

export function generateTechnoDataUrl(): string {
  return generateMelodyDataUrl(TECHNO_NOTES, 44100, 0.28);
}
