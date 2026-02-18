import { useCallback, useEffect, useRef, useState } from 'react';
import { generateSineWavDataUrl } from './karaoke/audio';
import { parseLrc, type LrcLine } from './karaoke/lrc';

const WS_URL = 'ws://localhost:8000/ws/stream';
const FRAME_INTERVAL_MS = 150;
const TRACK_STALE_MS = 2000;
const LRC_URL = '/lyrics/demo.lrc';
const DEMO_SONG_ID = 'demo-song';
const WS_BUFFER_THRESHOLD_BYTES = 1_000_000;
const WS_RECONNECT_DELAY_MS = 1500;

type Detection = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  conf: number;
  cls: number;
  track_id: number;
};

type DetectionsMessage = {
  type: 'detections';
  boxes: Detection[];
  width: number;
  height: number;
  metrics?: BackendMetrics;
};

type ErrorMessage = {
  type: 'error';
  message: string;
};

type BackendMetrics = {
  decode_ms: number;
  inference_ms: number;
  processing_ms: number;
  backend_fps: number;
  backend_sent_at_ms: number;
  frame_id?: number;
  captured_at_ms?: number;
};

type RuntimeMetrics = {
  e2eLatencyMs: number | null;
  backendDecodeMs: number | null;
  backendInferenceMs: number | null;
  backendProcessingMs: number | null;
  backendFps: number | null;
  frontendOverlayFps: number | null;
  frontendRenderMs: number | null;
};

type SeriesStats = {
  count: number;
  sum: number;
  min: number;
  max: number;
};

type SessionAccumulator = {
  e2e: SeriesStats;
  backendInference: SeriesStats;
  backendProcessing: SeriesStats;
  backendFps: SeriesStats;
  frontendRender: SeriesStats;
  frontendOverlayFps: SeriesStats;
  droppedFrames: number;
  maxBufferedAmountBytes: number;
  startedAtMs: number;
};

type SessionMetrics = {
  samples: number;
  durationSec: number;
  e2eAvgMs: number | null;
  e2eMinMs: number | null;
  e2eMaxMs: number | null;
  inferenceAvgMs: number | null;
  processingAvgMs: number | null;
  backendFpsAvg: number | null;
  overlayRenderAvgMs: number | null;
  overlayFpsAvg: number | null;
  droppedFrames: number;
  maxBufferedKb: number;
};

const createSeries = (): SeriesStats => ({
  count: 0,
  sum: 0,
  min: Number.POSITIVE_INFINITY,
  max: Number.NEGATIVE_INFINITY,
});

const addSample = (series: SeriesStats, value: number): SeriesStats => ({
  count: series.count + 1,
  sum: series.sum + value,
  min: Math.min(series.min, value),
  max: Math.max(series.max, value),
});

const seriesAvg = (series: SeriesStats): number | null =>
  series.count > 0 ? series.sum / series.count : null;

const seriesMin = (series: SeriesStats): number | null => (series.count > 0 ? series.min : null);

const seriesMax = (series: SeriesStats): number | null => (series.count > 0 ? series.max : null);

const createSessionAccumulator = (): SessionAccumulator => ({
  e2e: createSeries(),
  backendInference: createSeries(),
  backendProcessing: createSeries(),
  backendFps: createSeries(),
  frontendRender: createSeries(),
  frontendOverlayFps: createSeries(),
  droppedFrames: 0,
  maxBufferedAmountBytes: 0,
  startedAtMs: Date.now(),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isDetection = (value: unknown): value is Detection => {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.x1 === 'number' &&
    typeof value.y1 === 'number' &&
    typeof value.x2 === 'number' &&
    typeof value.y2 === 'number' &&
    typeof value.conf === 'number' &&
    typeof value.cls === 'number' &&
    typeof value.track_id === 'number'
  );
};

const isBackendMetrics = (value: unknown): value is BackendMetrics => {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.decode_ms === 'number' &&
    typeof value.inference_ms === 'number' &&
    typeof value.processing_ms === 'number' &&
    typeof value.backend_fps === 'number' &&
    typeof value.backend_sent_at_ms === 'number'
  );
};

const isDetectionsMessage = (value: unknown): value is DetectionsMessage => {
  if (!isRecord(value) || value.type !== 'detections') {
    return false;
  }
  if (!Array.isArray(value.boxes) || !value.boxes.every(isDetection)) {
    return false;
  }
  if (typeof value.width !== 'number' || typeof value.height !== 'number') {
    return false;
  }
  if (value.metrics !== undefined && !isBackendMetrics(value.metrics)) {
    return false;
  }
  return true;
};

const isErrorMessage = (value: unknown): value is ErrorMessage =>
  isRecord(value) && value.type === 'error' && typeof value.message === 'string';

const COPY = {
  title: 'Face Karaoke AI',
  subtitle: 'Live Face Tracking + Karaoke Overlay (React + Vite + TypeScript)',
  hint: 'Klicke ein Gesicht an, vergebe einen Namen und ordne den Demo-Song zu.',
};

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastSeenRef = useRef<Record<number, number>>({});
  const frameIdRef = useRef(0);
  const lastOverlayRenderAtRef = useRef<number | null>(null);
  const sessionRef = useRef<SessionAccumulator>(createSessionAccumulator());
  const reconnectAttemptsRef = useRef(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected'>(
    'disconnected',
  );
  const [detections, setDetections] = useState<Detection[]>([]);
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [names, setNames] = useState<Record<number, string>>({});
  const [nameInput, setNameInput] = useState('');
  const [songByTrack, setSongByTrack] = useState<Record<number, string>>({});
  const [karaokeLines, setKaraokeLines] = useState<LrcLine[]>([]);
  const [activeLine, setActiveLine] = useState<number>(-1);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [karaokeError, setKaraokeError] = useState<string | null>(null);
  const [runtimeMetrics, setRuntimeMetrics] = useState<RuntimeMetrics>({
    e2eLatencyMs: null,
    backendDecodeMs: null,
    backendInferenceMs: null,
    backendProcessingMs: null,
    backendFps: null,
    frontendOverlayFps: null,
    frontendRenderMs: null,
  });
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics>({
    samples: 0,
    durationSec: 0,
    e2eAvgMs: null,
    e2eMinMs: null,
    e2eMaxMs: null,
    inferenceAvgMs: null,
    processingAvgMs: null,
    backendFpsAvg: null,
    overlayRenderAvgMs: null,
    overlayFpsAvg: null,
    droppedFrames: 0,
    maxBufferedKb: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const refreshSessionMetrics = useCallback(() => {
    const s = sessionRef.current;
    setSessionMetrics({
      samples: s.e2e.count,
      durationSec: Math.max(0, (Date.now() - s.startedAtMs) / 1000),
      e2eAvgMs: seriesAvg(s.e2e),
      e2eMinMs: seriesMin(s.e2e),
      e2eMaxMs: seriesMax(s.e2e),
      inferenceAvgMs: seriesAvg(s.backendInference),
      processingAvgMs: seriesAvg(s.backendProcessing),
      backendFpsAvg: seriesAvg(s.backendFps),
      overlayRenderAvgMs: seriesAvg(s.frontendRender),
      overlayFpsAvg: seriesAvg(s.frontendOverlayFps),
      droppedFrames: s.droppedFrames,
      maxBufferedKb: s.maxBufferedAmountBytes / 1024,
    });
  }, []);

  const resetSessionStats = useCallback(() => {
    sessionRef.current = createSessionAccumulator();
    setSessionMetrics({
      samples: 0,
      durationSec: 0,
      e2eAvgMs: null,
      e2eMinMs: null,
      e2eMaxMs: null,
      inferenceAvgMs: null,
      processingAvgMs: null,
      backendFpsAvg: null,
      overlayRenderAvgMs: null,
      overlayFpsAvg: null,
      droppedFrames: 0,
      maxBufferedKb: 0,
    });
  }, []);

  const disconnectSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setWsStatus('disconnected');
  }, []);

  const stopStream = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setDetections([]);
    setFrameSize(null);
    setWsError(null);
    setSelectedTrackId(null);
    setNameInput('');
    setNames({});
    setSongByTrack({});
    lastSeenRef.current = {};
    frameIdRef.current = 0;
    lastOverlayRenderAtRef.current = null;
    reconnectAttemptsRef.current = 0;
    resetSessionStats();
    setRuntimeMetrics({
      e2eLatencyMs: null,
      backendDecodeMs: null,
      backendInferenceMs: null,
      backendProcessingMs: null,
      backendFps: null,
      frontendOverlayFps: null,
      frontendRenderMs: null,
    });
    disconnectSocket();
  }, [stream, disconnectSocket, resetSessionStats]);

  const startStream = useCallback(async () => {
    if (stream || isStarting) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Webcam wird in diesem Browser nicht unterstuetzt.');
      return;
    }

    setIsStarting(true);
    setError(null);
    resetSessionStats();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
      setError('Zugriff auf die Webcam fehlgeschlagen. Bitte Berechtigung pruefen.');
    } finally {
      setIsStarting(false);
    }
  }, [stream, isStarting, resetSessionStats]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return undefined;
    }

    const syncSize = () => {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
    };

    video.addEventListener('loadedmetadata', syncSize);
    syncSize();

    return () => {
      video.removeEventListener('loadedmetadata', syncSize);
    };
  }, [stream]);

  useEffect(() => {
    if (!stream) {
      return undefined;
    }

    setWsStatus('connecting');
    setWsError(null);

    let reconnectTimer: number | null = null;
    let disposed = false;

    const connect = () => {
      if (disposed) {
        return;
      }
      setWsStatus('connecting');
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setWsStatus('connected');
        setWsError(null);
      };

      ws.onclose = () => {
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
        if (disposed) {
          setWsStatus('disconnected');
          return;
        }
        reconnectAttemptsRef.current += 1;
        setWsStatus('connecting');
        setWsError(`Backend getrennt. Reconnect #${reconnectAttemptsRef.current}...`);
        reconnectTimer = window.setTimeout(connect, WS_RECONNECT_DELAY_MS);
      };

      ws.onerror = () => {
        setWsError('Backend-Verbindung fehlgeschlagen.');
      };

      ws.onmessage = (event) => {
        try {
          const payloadUnknown: unknown = JSON.parse(event.data);
          if (isDetectionsMessage(payloadUnknown)) {
            const payload = payloadUnknown;
            setDetections(payload.boxes);
            setFrameSize({ width: payload.width, height: payload.height });
            setWsError(null);
            const now = Date.now();
            payload.boxes.forEach((box) => {
              lastSeenRef.current[box.track_id] = now;
            });
            if (payload.metrics) {
              const e2eLatencyMs =
                typeof payload.metrics.captured_at_ms === 'number'
                  ? Math.max(0, now - payload.metrics.captured_at_ms)
                  : null;
              setRuntimeMetrics((prev) => ({
                ...prev,
                e2eLatencyMs: e2eLatencyMs ?? prev.e2eLatencyMs,
                backendDecodeMs: payload.metrics.decode_ms ?? prev.backendDecodeMs,
                backendInferenceMs: payload.metrics.inference_ms ?? prev.backendInferenceMs,
                backendProcessingMs: payload.metrics.processing_ms ?? prev.backendProcessingMs,
                backendFps: payload.metrics.backend_fps ?? prev.backendFps,
              }));
              if (e2eLatencyMs !== null) {
                sessionRef.current.e2e = addSample(sessionRef.current.e2e, e2eLatencyMs);
              }
              sessionRef.current.backendInference = addSample(
                sessionRef.current.backendInference,
                payload.metrics.inference_ms,
              );
              sessionRef.current.backendProcessing = addSample(
                sessionRef.current.backendProcessing,
                payload.metrics.processing_ms,
              );
              if (payload.metrics.backend_fps > 0) {
                sessionRef.current.backendFps = addSample(
                  sessionRef.current.backendFps,
                  payload.metrics.backend_fps,
                );
              }
              refreshSessionMetrics();
            }
          } else if (isErrorMessage(payloadUnknown)) {
            setWsError(payloadUnknown.message);
          }
        } catch (err) {
          console.error(err);
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [stream, refreshSessionMetrics]);

  useEffect(() => {
    if (selectedTrackId === null) {
      setNameInput('');
      return;
    }
    setNameInput(names[selectedTrackId] ?? '');
  }, [selectedTrackId, names]);

  useEffect(() => {
    const loadLrc = async () => {
      try {
        const response = await fetch(LRC_URL);
        const text = await response.text();
        setKaraokeLines(parseLrc(text));
        setKaraokeError(null);
      } catch (err) {
        console.error(err);
        setKaraokeError('Lyrics konnten nicht geladen werden.');
      }
    };
    loadLrc();
    setAudioSrc(generateSineWavDataUrl());
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      if (selectedTrackId === null) {
        setSongByTrack((prev) => {
          let changed = false;
          const next = { ...prev };
          Object.keys(prev).forEach((trackIdRaw) => {
            const trackId = Number(trackIdRaw);
            const lastSeen = lastSeenRef.current[trackId];
            if (!lastSeen || now - lastSeen > TRACK_STALE_MS) {
              delete next[trackId];
              changed = true;
            }
          });
          return changed ? next : prev;
        });
        return;
      }
      const lastSeen = lastSeenRef.current[selectedTrackId];
      if (!lastSeen || now - lastSeen > TRACK_STALE_MS) {
        setSelectedTrackId(null);
      }

      setSongByTrack((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(prev).forEach((trackIdRaw) => {
          const trackId = Number(trackIdRaw);
          const trackLastSeen = lastSeenRef.current[trackId];
          if (!trackLastSeen || now - trackLastSeen > TRACK_STALE_MS) {
            delete next[trackId];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [selectedTrackId]);

  const saveName = useCallback(() => {
    if (selectedTrackId === null) {
      return;
    }
    const trimmed = nameInput.trim();
    setNames((prev) => {
      const next = { ...prev };
      if (trimmed.length === 0) {
        delete next[selectedTrackId];
      } else {
        next[selectedTrackId] = trimmed;
      }
      return next;
    });
  }, [selectedTrackId, nameInput]);

  const assignDemoSong = useCallback(() => {
    if (selectedTrackId === null) {
      return;
    }
    setSongByTrack((prev) => ({ ...prev, [selectedTrackId]: DEMO_SONG_ID }));
  }, [selectedTrackId]);

  const clearSongAssignment = useCallback(() => {
    if (selectedTrackId === null) {
      return;
    }
    setSongByTrack((prev) => {
      if (!(selectedTrackId in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[selectedTrackId];
      return next;
    });
  }, [selectedTrackId]);

  const sendFrame = useCallback(() => {
    const ws = wsRef.current;
    const video = videoRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !video) {
      return;
    }

    sessionRef.current.maxBufferedAmountBytes = Math.max(
      sessionRef.current.maxBufferedAmountBytes,
      ws.bufferedAmount,
    );
    if (ws.bufferedAmount > WS_BUFFER_THRESHOLD_BYTES) {
      sessionRef.current.droppedFrames += 1;
      refreshSessionMetrics();
      return;
    }

    if (!captureCanvasRef.current) {
      captureCanvasRef.current = document.createElement('canvas');
    }

    const captureCanvas = captureCanvasRef.current;
    const ctx = captureCanvas.getContext('2d');
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.7);
    const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    const frameId = (frameIdRef.current += 1);
    const capturedAtMs = Date.now();

    ws.send(JSON.stringify({ type: 'frame', data: base64, frame_id: frameId, captured_at_ms: capturedAtMs }));
  }, [refreshSessionMetrics]);

  useEffect(() => {
    if (!stream) {
      return undefined;
    }

    const intervalId = window.setInterval(sendFrame, FRAME_INTERVAL_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [stream, sendFrame]);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!frameSize) {
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const canvasX = (event.clientX - rect.left) * (canvas.width / rect.width);
      const canvasY = (event.clientY - rect.top) * (canvas.height / rect.height);

      const scaleX = canvas.width / frameSize.width;
      const scaleY = canvas.height / frameSize.height;

      const hit = detections.filter((box) => {
        const x = box.x1 * scaleX;
        const y = box.y1 * scaleY;
        const w = (box.x2 - box.x1) * scaleX;
        const h = (box.y2 - box.y1) * scaleY;
        return canvasX >= x && canvasX <= x + w && canvasY >= y && canvasY <= y + h;
      });

      if (hit.length === 0) {
        setSelectedTrackId(null);
        return;
      }

      const best = hit.reduce((a, b) => (a.conf >= b.conf ? a : b));
      setSelectedTrackId(best.track_id);
    },
    [detections, frameSize],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const renderStart = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!frameSize) {
      return;
    }

    const scaleX = canvas.width / frameSize.width;
    const scaleY = canvas.height / frameSize.height;
    detections.forEach((box) => {
      const trackLabel =
        names[box.track_id] ?? (Number.isFinite(box.track_id) ? `#${box.track_id}` : 'untracked');
      const isSelected = selectedTrackId !== null && box.track_id === selectedTrackId;
      ctx.strokeStyle = isSelected ? '#f97316' : '#22c55e';
      ctx.lineWidth = 2;
      ctx.font = '14px "Space Grotesk", sans-serif';
      ctx.fillStyle = ctx.strokeStyle;

      const x = box.x1 * scaleX;
      const y = box.y1 * scaleY;
      const w = (box.x2 - box.x1) * scaleX;
      const h = (box.y2 - box.y1) * scaleY;

      ctx.strokeRect(x, y, w, h);
      ctx.fillText(`${trackLabel} ${box.conf.toFixed(2)}`, x + 4, y + 16);
    });
    const renderEnd = performance.now();
    const renderMs = renderEnd - renderStart;
    const prevRenderAt = lastOverlayRenderAtRef.current;
    const overlayFps = prevRenderAt ? 1000 / Math.max(1, renderEnd - prevRenderAt) : null;
    lastOverlayRenderAtRef.current = renderEnd;
    setRuntimeMetrics((prev) => ({
      ...prev,
      frontendRenderMs: Number(renderMs.toFixed(2)),
      frontendOverlayFps: overlayFps ? Number(overlayFps.toFixed(2)) : prev.frontendOverlayFps,
    }));
    sessionRef.current.frontendRender = addSample(sessionRef.current.frontendRender, renderMs);
    if (overlayFps && overlayFps > 0) {
      sessionRef.current.frontendOverlayFps = addSample(sessionRef.current.frontendOverlayFps, overlayFps);
    }
    refreshSessionMetrics();
  }, [detections, frameSize, names, selectedTrackId, refreshSessionMetrics]);

  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (audio && karaokeLines.length > 0) {
        const currentMs = audio.currentTime * 1000;
        let idx = -1;
        for (let i = 0; i < karaokeLines.length; i += 1) {
          if (karaokeLines[i].timeMs <= currentMs) {
            idx = i;
          } else {
            break;
          }
        }
        setActiveLine(idx);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [karaokeLines]);

  useEffect(() => {
    if (activeLine < 0) {
      return;
    }
    const el = document.querySelector<HTMLParagraphElement>(
      `.karaoke-lines p[data-line="${activeLine}"]`,
    );
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeLine]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  const selectedLabel =
    selectedTrackId === null
      ? 'Kein Gesicht ausgewaehlt'
      : names[selectedTrackId]
        ? `${names[selectedTrackId]} (#${selectedTrackId})`
        : `#${selectedTrackId}`;
  const isSelectedAssigned =
    selectedTrackId !== null && songByTrack[selectedTrackId] === DEMO_SONG_ID;
  const assignedCount = Object.keys(songByTrack).length;
  const hasAssignedSong = assignedCount > 0;
  const activeLyricText = activeLine >= 0 ? karaokeLines[activeLine]?.text ?? '' : '';
  const fmtMetric = (value: number | null, unit: string): string =>
    value === null ? '-' : `${value.toFixed(1)} ${unit}`;
  const fmtValue = (value: number | null): string => (value === null ? '-' : value.toFixed(1));

  const exportMetrics = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      frameIntervalMs: FRAME_INTERVAL_MS,
      wsBufferThresholdBytes: WS_BUFFER_THRESHOLD_BYTES,
      runtimeSnapshot: runtimeMetrics,
      sessionSummary: {
        ...sessionMetrics,
        durationSec: Number(sessionMetrics.durationSec.toFixed(1)),
        maxBufferedKb: Number(sessionMetrics.maxBufferedKb.toFixed(1)),
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `metrics-session-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [runtimeMetrics, sessionMetrics]);

  return (
    <div className="app">
      {stream && hasAssignedSong && (
        <div className="lyric-fixed" aria-live="polite">
          {activeLyricText || '...'}
        </div>
      )}
      <header className="header">
        <div>
          <h1>{COPY.title}</h1>
          <p>{COPY.subtitle}</p>
        </div>
        <div className="status-stack">
          <div className={`status ${stream ? 'on' : 'off'}`}>
            <span className="dot" />
            <span>{stream ? 'Webcam aktiv' : 'Webcam inaktiv'}</span>
          </div>
          <div className={`status ${wsStatus === 'connected' ? 'on' : 'off'}`}>
            <span className="dot" />
            <span>
              {wsStatus === 'connected'
                ? 'Backend verbunden'
                : wsStatus === 'connecting'
                  ? 'Backend verbindet...'
                  : 'Backend getrennt'}
            </span>
          </div>
        </div>
      </header>

      <section className="controls">
        <button className="primary" onClick={startStream} disabled={!!stream || isStarting}>
          {isStarting ? 'Starte...' : 'Start Webcam'}
        </button>
        <button className="ghost" onClick={stopStream} disabled={!stream}>
          Stop Webcam
        </button>
        {error && <span className="error">{error}</span>}
        {wsError && <span className="error">{wsError}</span>}
      </section>

      <section className="metrics-panel">
        <h2>Runtime Metrics</h2>
        <div className="metrics-actions">
          <button className="ghost" onClick={exportMetrics}>
            Export Metrics JSON
          </button>
        </div>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">E2E Latency</span>
            <strong>{fmtMetric(runtimeMetrics.e2eLatencyMs, 'ms')}</strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">Backend Inference</span>
            <strong>{fmtMetric(runtimeMetrics.backendInferenceMs, 'ms')}</strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">Backend Processing</span>
            <strong>{fmtMetric(runtimeMetrics.backendProcessingMs, 'ms')}</strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">Backend FPS</span>
            <strong>{fmtMetric(runtimeMetrics.backendFps, 'fps')}</strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">Overlay Render</span>
            <strong>{fmtMetric(runtimeMetrics.frontendRenderMs, 'ms')}</strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">Overlay FPS</span>
            <strong>{fmtMetric(runtimeMetrics.frontendOverlayFps, 'fps')}</strong>
          </div>
        </div>
        <h3>Session Summary</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Samples</span>
            <strong>{sessionMetrics.samples}</strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">Session Duration</span>
            <strong>{sessionMetrics.durationSec.toFixed(1)} s</strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">E2E Latency Avg</span>
            <strong>{fmtMetric(sessionMetrics.e2eAvgMs, 'ms')}</strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">E2E Min / Max</span>
            <strong>
              {fmtValue(sessionMetrics.e2eMinMs)} / {fmtValue(sessionMetrics.e2eMaxMs)} ms
            </strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">Inference Avg</span>
            <strong>{fmtMetric(sessionMetrics.inferenceAvgMs, 'ms')}</strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">Overlay Render Avg</span>
            <strong>{fmtMetric(sessionMetrics.overlayRenderAvgMs, 'ms')}</strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">Dropped Frames</span>
            <strong>{sessionMetrics.droppedFrames}</strong>
          </div>
          <div className="metric-item">
            <span className="metric-label">Max Backlog</span>
            <strong>{sessionMetrics.maxBufferedKb.toFixed(1)} KB</strong>
          </div>
        </div>
      </section>

      <section className="controls">
        <div className="name-editor">
          <span className="name-label">{selectedLabel}</span>
          <input
            type="text"
            placeholder="Name eingeben"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                saveName();
              }
            }}
            disabled={selectedTrackId === null}
          />
          <button className="ghost" onClick={saveName} disabled={selectedTrackId === null}>
            Name speichern
          </button>
          <span className="name-label">
            {selectedTrackId === null
              ? 'Song: -'
              : isSelectedAssigned
                ? 'Song: Demo zugeordnet'
                : 'Song: nicht zugeordnet'}
          </span>
          <button className="ghost" onClick={assignDemoSong} disabled={selectedTrackId === null}>
            Song zuordnen
          </button>
          <button
            className="ghost"
            onClick={clearSongAssignment}
            disabled={selectedTrackId === null || !isSelectedAssigned}
          >
            Song entfernen
          </button>
        </div>
      </section>

      <section className="stage">
        <div className="video-wrap">
          <video ref={videoRef} playsInline muted />
          <canvas ref={canvasRef} onClick={handleCanvasClick} />
        </div>
        <aside className="hint">{COPY.hint}</aside>
      </section>

      <section className="karaoke">
        <div className="karaoke-controls">
          <h2>Karaoke</h2>
          <p className="song-summary">Zugeordnete Tracks: {assignedCount}</p>
          <div className="karaoke-buttons">
            <button
              className="primary"
              onClick={() => audioRef.current?.play()}
              disabled={!audioSrc}
            >
              Play
            </button>
            <button className="ghost" onClick={() => audioRef.current?.pause()} disabled={!audioSrc}>
              Pause
            </button>
            <button
              className="ghost"
              onClick={() => {
                if (!audioRef.current) {
                  return;
                }
                audioRef.current.currentTime = 0;
                audioRef.current.play();
              }}
              disabled={!audioSrc}
            >
              Restart
            </button>
          </div>
          <audio ref={audioRef} src={audioSrc ?? undefined} preload="auto" />
        </div>
        <div className="karaoke-lines">
          {karaokeError && <p>{karaokeError}</p>}
          {!karaokeError && karaokeLines.length === 0 && <p>Keine Lyrics geladen.</p>}
          {karaokeLines.map((line, index) => (
            <p
              key={`${line.timeMs}-${index}`}
              data-line={index}
              className={index === activeLine ? 'active' : ''}
            >
              {line.text}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
