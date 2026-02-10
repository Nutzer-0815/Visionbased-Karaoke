import { useCallback, useEffect, useRef, useState } from 'react';

const COPY = {
  title: 'Face Karaoke AI',
  subtitle: 'Webcam + Canvas Overlay Skeleton (React + Vite + TypeScript)',
  hint: 'Hier entsteht die Live-Preview für Tracking & Web Audio (Web Audio) – Backend folgt.',
};

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
  }, [stream]);

  const startStream = useCallback(async () => {
    if (stream || isStarting) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Webcam wird in diesem Browser nicht unterstützt.');
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
      setError('Zugriff auf die Webcam fehlgeschlagen. Bitte Berechtigung prüfen.');
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
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{COPY.title}</h1>
          <p>{COPY.subtitle}</p>
        </div>
        <div className={`status ${stream ? 'on' : 'off'}`}>
          <span className="dot" />
          <span>{stream ? 'Webcam aktiv' : 'Webcam inaktiv'}</span>
        </div>
      </header>

      <section className="controls">
        <button className="primary" onClick={startStream} disabled={!!stream || isStarting}>
          {isStarting ? 'Starte…' : 'Start Webcam'}
        </button>
        <button className="ghost" onClick={stopStream} disabled={!stream}>
          Stop Webcam
        </button>
        {error && <span className="error">{error}</span>}
      </section>

      <section className="stage">
        <div className="video-wrap">
          <video ref={videoRef} playsInline muted />
          <canvas ref={canvasRef} />
        </div>
        <aside className="hint">{COPY.hint}</aside>
      </section>
    </div>
  );
}

export default App;
