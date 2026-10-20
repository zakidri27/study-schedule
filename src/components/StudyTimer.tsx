import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

interface StudyTimerProps {
  subject: string;
  initialMinutes: number;
  color: string;
  onClose: () => void;
}

const PRESETS = [15, 25, 45, 60, 90];

function format(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function StudyTimer({ subject, initialMinutes, color, onClose }: StudyTimerProps) {
  const { t } = useApp();
  const [total, setTotal] = useState(Math.max(60, Math.round(initialMinutes) * 60));
  const [remaining, setRemaining] = useState(Math.max(60, Math.round(initialMinutes) * 60));
  const [running, setRunning] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && !finishedRef.current) {
      finishedRef.current = true;
      try {
        const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.15;
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch {
        /* ignore audio errors */
      }
    }
  }, [remaining]);

  const adjust = (deltaSeconds: number) => {
    setTotal((prevTotal) => {
      const nextTotal = Math.max(60, prevTotal + deltaSeconds);
      setRemaining((prevRemaining) => (running ? prevRemaining : nextTotal));
      return nextTotal;
    });
    finishedRef.current = false;
  };

  const setPreset = (minutes: number) => {
    const secs = minutes * 60;
    setTotal(secs);
    setRemaining(secs);
    setRunning(false);
    finishedRef.current = false;
  };

  const reset = () => {
    setRemaining(total);
    setRunning(false);
    finishedRef.current = false;
  };

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const progress = total > 0 ? remaining / total : 0;
  const R = 130;
  const C = 2 * Math.PI * R;

  const btn =
    'px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-white text-sm font-medium transition disabled:opacity-40';

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center p-4 text-white"
      style={{ background: `linear-gradient(160deg, ${color}, #0b0b12)` }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 end-4 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur font-medium transition"
      >
        ✕ {t.close}
      </button>

      <div className="text-center mb-4">
        <div className="text-sm uppercase tracking-widest opacity-70">⏱️ {t.studyTimer}</div>
        <div className="text-2xl md:text-3xl font-bold mt-1">{subject}</div>
      </div>

      <div className="relative w-[300px] h-[300px] max-w-[80vw] max-h-[80vw] flex items-center justify-center">
        <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="14" />
          <circle
            cx="150"
            cy="150"
            r={R}
            fill="none"
            stroke="#ffffff"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="text-5xl md:text-6xl font-mono font-bold tabular-nums">{format(remaining)}</div>
        {remaining === 0 && <div className="absolute bottom-6 text-sm font-semibold animate-pulse">✔ {t.timeUp}</div>}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <button className={btn} disabled={running} onClick={() => adjust(-3600)}>−1h</button>
        <button className={btn} disabled={running} onClick={() => adjust(-300)}>−5m</button>
        <button className={btn} disabled={running} onClick={() => adjust(-60)}>−1m</button>
        <button className={btn} disabled={running} onClick={() => adjust(60)}>+1m</button>
        <button className={btn} disabled={running} onClick={() => adjust(300)}>+5m</button>
        <button className={btn} disabled={running} onClick={() => adjust(3600)}>+1h</button>
      </div>

      <div className="text-sm opacity-80 mt-3">
        {t.adjustDuration}: <span className="font-semibold">{hours}</span> {t.hours} ·{' '}
        <span className="font-semibold">{minutes}</span> {t.minutes}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        {PRESETS.map((p) => (
          <button
            key={p}
            className={`${btn} ${total === p * 60 ? 'ring-2 ring-white/70' : ''}`}
            onClick={() => setPreset(p)}
          >
            {p}m
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={() => setRunning((r) => !r)}
          disabled={remaining === 0 && !running}
          className="px-8 py-3 rounded-2xl bg-white text-gray-900 font-bold hover:bg-white/90 transition disabled:opacity-40"
        >
          {running ? `⏸ ${t.pauseTimer}` : `▶ ${t.startTimer}`}
        </button>
        <button onClick={reset} className="px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur font-semibold transition">
          ↺ {t.resetTimer}
        </button>
      </div>
    </div>
  );
}
