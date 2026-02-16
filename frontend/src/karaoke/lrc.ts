export type LrcLine = {
  timeMs: number;
  text: string;
};

const TIME_TAG = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

export function parseLrc(content: string): LrcLine[] {
  const lines: LrcLine[] = [];

  content.split(/\r?\n/).forEach((rawLine) => {
    const tags = [...rawLine.matchAll(TIME_TAG)];
    if (tags.length === 0) {
      return;
    }

    const text = rawLine.replace(TIME_TAG, '').trim();
    tags.forEach((match) => {
      const minutes = Number(match[1] ?? 0);
      const seconds = Number(match[2] ?? 0);
      const millis = Number((match[3] ?? '0').padEnd(3, '0'));
      const timeMs = minutes * 60_000 + seconds * 1_000 + millis;
      lines.push({ timeMs, text });
    });
  });

  return lines.sort((a, b) => a.timeMs - b.timeMs);
}
