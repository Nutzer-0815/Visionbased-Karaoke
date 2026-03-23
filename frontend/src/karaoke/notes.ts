// Note/pitch data for songs.
// Each song folder may contain a notes.json with timestamped target frequencies.
// Used for the real-time pitch accuracy display during karaoke playback.

export type NoteEntry = {
  time_ms: number; // playback position in ms
  freq: number;    // target frequency in Hz; 0 = rest (no target)
};

// Pitch evaluation relative to a target note.
// Chroma-based (octave-independent): singing E4 when the target is E2 counts as correct.
export type PitchScore = 'perfect' | 'close' | 'off' | 'silent';

/** Fetch notes.json for a song folder. Returns null if not found or on error. */
export async function loadNotes(folder: string): Promise<NoteEntry[] | null> {
  try {
    const res = await fetch(`/songs/${folder}/notes.json`);
    if (!res.ok) return null;
    return (await res.json()) as NoteEntry[];
  } catch {
    return null;
  }
}

/**
 * Returns the target frequency at the given playback position.
 * Uses the last note whose time_ms <= timeMs (step function).
 * Returns null during rests (freq === 0) or before the first note.
 */
export function getTargetFreq(timeMs: number, notes: NoteEntry[]): number | null {
  let last: NoteEntry | null = null;
  for (const note of notes) {
    if (note.time_ms <= timeMs) {
      last = note;
    } else {
      break;
    }
  }
  if (!last || last.freq === 0) return null;
  return last.freq;
}

function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

/** Chroma-aware semitone distance (0–6, octave-independent). */
function chromaDistance(a: number, b: number): number {
  const ca = Math.round(freqToMidi(a)) % 12;
  const cb = Math.round(freqToMidi(b)) % 12;
  const d = Math.abs(ca - cb);
  return Math.min(d, 12 - d);
}

/**
 * Scores a detected pitch against a target.
 * 'perfect': ≤ 1 semitone (chroma), 'close': ≤ 2, 'off': > 2, 'silent': no pitch/target.
 */
export function scorePitch(detected: number | null, target: number | null): PitchScore {
  if (detected === null || target === null) return 'silent';
  const dist = chromaDistance(detected, target);
  if (dist <= 1) return 'perfect';
  if (dist <= 2) return 'close';
  return 'off';
}
