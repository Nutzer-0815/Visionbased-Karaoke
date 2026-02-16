import { useCallback, useEffect, useRef, useState } from 'react';

const WS_URL = 'ws://localhost:8000/ws/stream';
const FRAME_INTERVAL_MS = 150;
const TRACK_STALE_MS = 2000;

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
};

type ErrorMessage = {
  type: 'error';
  message: string;
};

const COPY = {
  title: 'Face Karaoke AI',
  subtitle: 'Webcam + Canvas Overlay Skeleton (React + Vite + TypeScript)',
  hint: 'Hier entsteht die Live-Preview fuer Tracking & Web Audio (Web Audio) - Backend folgt.',
};

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastSeenRef = useRef<Record<number, number>>({});

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
    lastSeenRef.current = {};
    disconnectSocket();
  }, [stream, disconnectSocket]);

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
  }, [stream, isStarting]);

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

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
    };

    ws.onerror = () => {
      setWsError('Backend-Verbindung fehlgeschlagen.');
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as DetectionsMessage | ErrorMessage | { type: string };
        if (payload.type === 'detections') {
          setDetections(payload.boxes);
          setFrameSize({ width: payload.width, height: payload.height });
          setWsError(null);
          const now = Date.now();
          payload.boxes.forEach((box) => {
            lastSeenRef.current[box.track_id] = now;
          });
        } else if (payload.type === 'error' && 'message' in payload) {
          setWsError(payload.message);
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [stream]);

  useEffect(() => {
    if (selectedTrackId === null) {
      setNameInput('');
      return;
    }
    setNameInput(names[selectedTrackId] ?? '');
  }, [selectedTrackId, names]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (selectedTrackId === null) {
        return;
      }
      const lastSeen = lastSeenRef.current[selectedTrackId];
      if (!lastSeen || Date.now() - lastSeen > TRACK_STALE_MS) {
        setSelectedTrackId(null);
      }
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

  const sendFrame = useCallback(() => {
    const ws = wsRef.current;
    const video = videoRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !video) {
      return;
    }

    if (ws.bufferedAmount > 1_000_000) {
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

    ws.send(JSON.stringify({ type: 'frame', data: base64 }));
  }, []);

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
  }, [detections, frameSize, names, selectedTrackId]);

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

  return (
    <div className="app">
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
        </div>
      </section>

      <section className="stage">
        <div className="video-wrap">
          <video ref={videoRef} playsInline muted />
          <canvas ref={canvasRef} onClick={handleCanvasClick} />
        </div>
        <aside className="hint">{COPY.hint}</aside>
      </section>
    </div>
  );
}

export default App;
