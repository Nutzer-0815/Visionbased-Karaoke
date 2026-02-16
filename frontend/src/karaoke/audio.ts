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
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:audio/wav;base64,${base64}`;
}
