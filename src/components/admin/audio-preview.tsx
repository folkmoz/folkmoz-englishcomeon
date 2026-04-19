"use client";
import { useEffect, useRef, useState } from "react";

function fmt(t: number) {
  if (!isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPreview({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onTime = () => setCur(a.currentTime);
    const onLoad = () => {
      if (isFinite(a.duration)) setDur(a.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setCur(0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoad);
    a.addEventListener("durationchange", onLoad);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoad);
      a.removeEventListener("durationchange", onLoad);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [src]);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = ref.current;
    if (!a || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = dur * ratio;
    setCur(a.currentTime);
  };

  const pct = dur > 0 ? (cur / dur) * 100 : 0;

  return (
    <div className="audio-tiny">
      <audio ref={ref} src={src} preload="metadata" />
      <button
        type="button"
        className="audio-tiny-play"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor">
            <rect x="0" y="0" width="3" height="11" />
            <rect x="6" y="0" width="3" height="11" />
          </svg>
        ) : (
          <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor">
            <path d="M0 0 L9 5.5 L0 11 Z" />
          </svg>
        )}
      </button>
      <div className="audio-tiny-bar" onClick={seek}>
        <div className="audio-tiny-fill" style={{ width: `${pct}%` }} />
        <div className="audio-tiny-dot" style={{ left: `${pct}%` }} />
      </div>
      <span className="audio-tiny-time">
        {fmt(cur)} <span className="sep">/</span> {fmt(dur)}
      </span>
    </div>
  );
}
