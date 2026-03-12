import { generateHappyBirthdayDataUrl } from './audio';

export type Song = {
  id: string;
  title: string;
  lrcUrl: string;
  audioUrl: string | null; // null = sine-wave fallback; "generated:*" = built-in generator
};

type RawSong = {
  id: unknown;
  title: unknown;
  lrcUrl: unknown;
  audioUrl: unknown;
};

const isRawSong = (value: unknown): value is RawSong =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'title' in value &&
  'lrcUrl' in value &&
  'audioUrl' in value;

function toSong(raw: RawSong): Song | null {
  if (
    typeof raw.id !== 'string' ||
    typeof raw.title !== 'string' ||
    typeof raw.lrcUrl !== 'string'
  ) {
    return null;
  }
  const audioUrl =
    typeof raw.audioUrl === 'string' ? raw.audioUrl : null;
  return { id: raw.id, title: raw.title, lrcUrl: raw.lrcUrl, audioUrl };
}

export async function loadSongCatalog(): Promise<Song[]> {
  const response = await fetch('/songs/index.json');
  if (!response.ok) {
    throw new Error(`Song-Katalog konnte nicht geladen werden (${response.status})`);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Song-Katalog hat unerwartetes Format');
  }
  return data.filter(isRawSong).map(toSong).filter((s): s is Song => s !== null);
}

/** Resolves the audio data-URL for a song. Returns null for silence placeholder. */
export function resolveAudioUrl(song: Song): string | null {
  if (song.audioUrl === 'generated:happy-birthday') {
    return generateHappyBirthdayDataUrl();
  }
  return song.audioUrl; // null or an explicit URL
}
