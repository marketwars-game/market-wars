// FILE: components/display/ConfettiCanvas.tsx — reusable confetti burst overlay (Display)
// VERSION: B16d-v1 — canvas confetti for Final podium reveal + Smart Diversifier twist
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16d created — self-contained burst on `fire`, graceful (no deps)
'use client';

import { useEffect, useRef } from 'react';

interface ConfettiCanvasProps {
  fire: boolean;       // true = burst on mount + each time `nonce` changes
  nonce?: number;      // bump to re-fire
  scale?: number;      // 1 = full burst
}

const COLORS = ['#00FFB2', '#22c55e', '#FFD700', '#00D4FF', '#EC4899', '#ffffff'];

export default function ConfettiCanvas({ fire, nonce = 0, scale = 1 }: ConfettiCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const parts = useRef<any[]>([]);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.current.forEach((p) => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.006;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      });
      parts.current = parts.current.filter((p) => p.life > 0 && p.y < cv.height + 40);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  useEffect(() => {
    if (!fire) return;
    const cv = ref.current;
    if (!cv) return;
    const n = Math.floor(110 * scale);
    for (let i = 0; i < n; i++) {
      parts.current.push({
        x: cv.width / 2 + (Math.random() - 0.5) * cv.width * 0.5,
        y: cv.height * 0.32,
        vx: (Math.random() - 0.5) * 11,
        vy: Math.random() * -11 - 3,
        g: 0.28 + Math.random() * 0.12,
        s: 6 + Math.random() * 8,
        c: COLORS[i % COLORS.length],
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 1,
      });
    }
  }, [fire, nonce, scale]);

  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 30 }} />;
}
