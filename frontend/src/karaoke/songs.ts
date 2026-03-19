import { generateHappyBirthdayDataUrl } from './audio';

export type Song = {
  id: string;
  title: string;
  lrcUrl: string;
  audioUrl: string | null;
};

type CatalogEntry = {
  folder: string;
  title: string;
  /** Optional: filename inside the folder, or "generated:<id>" for built-in audio. */
  audio?: string;
};

function isCatalogEntry(value: unknown): value is CatalogEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).folder === 'string' &&
    typeof (value as Record<string, unknown>).title === 'string'
  );
}

function entryToSong(entry: CatalogEntry): Song {
  const { folder, title, audio } = entry;
  const audioUrl = audio != null ? (audio.startsWith('generated:') ? audio : `/songs/${folder}/${audio}`) : null;
  return {
    id: folder,
    title,
    lrcUrl: `/songs/${folder}/lyrics.lrc`,
    audioUrl,
  };
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
  return data.filter(isCatalogEntry).map(entryToSong);
}

/** Resolves the audio URL for a song. Returns null if no audio is configured. */
export function resolveAudioUrl(song: Song): string | null {
  if (song.audioUrl === 'generated:happy-birthday') {
    return generateHappyBirthdayDataUrl();
  }
  return song.audioUrl;
}
