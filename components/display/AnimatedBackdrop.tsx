// FILE: components/display/AnimatedBackdrop.tsx — Shared animated backdrop (Network + Grid) for Display splash screens
// VERSION: B19-v1 — particle network (canvas) + scrolling dot-grid + drifting glow + vignette; accent-themed per scene
// LAST MODIFIED: 13 Jun 2026
// HISTORY: B19-BATCH1 created — replaces static radial glows on Lobby/YearIntro/MarketOpen/Event (Rule #5 shared component)
'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

interface AnimatedBackdropProps {
  accent: string;       // primary hex, e.g. '#00FFB2'
  accent2: string;      // secondary hex, e.g. '#00D4FF'
  vignette?: boolean;   // dark edge fade (default true)
  density?: number;     // particle node count (default 18)
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 0,
  ];
}

export default function AnimatedBackdrop({ accent, accent2, vignette = true, density = 18 }: AnimatedBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Particle network on canvas — drifting nodes + proximity links, recoloured per accent
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let parts: { x: number; y: number; vx: number; vy: number }[] = [];
    let raf = 0;
    const [r, g, b] = hexToRgb(accent);

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      if (W === 0 || H === 0) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const seed = () => {
      parts = [];
      for (let i = 0; i < density; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
        });
      }
    };
    const loop = () => {
      if (W === 0 || H === 0) { raf = requestAnimationFrame(loop); return; }
      ctx.clearRect(0, 0, W, H);
      const lim = W * 0.2;
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], c = parts[j];
          const dx = a.x - c.x, dy = a.y - c.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < lim) {
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / lim) * 0.45})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke();
          }
        }
      }
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(${r},${g},${b},0.85)`;
      ctx.fillStyle = `rgba(${r},${g},${b},0.92)`;
      for (const p of parts) { ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill(); }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };

    size(); seed(); loop();
    const ro = new ResizeObserver(() => { size(); seed(); });
    ro.observe(canvas);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [accent, density]);

  const rootStyle = {
    position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden',
    '--ac': accent, '--ac2': accent2,
  } as CSSProperties;

  return (
    <div className="ab-root" style={rootStyle} aria-hidden="true">
      <style>{`
        @keyframes abGrid { to { background-position: 36px 36px; } }
        @keyframes abDrift { 0%,100% { transform: translate(-4%,-3%); } 50% { transform: translate(7%,5%); } }
        .ab-grid { position:absolute; inset:-24px; background-image: radial-gradient(circle, rgba(255,255,255,0.11) 1.2px, transparent 1.5px); background-size:36px 36px; animation: abGrid 7s linear infinite; }
        .ab-glow { position:absolute; width:46%; aspect-ratio:1; border-radius:50%; opacity:0.22; animation: abDrift 12s ease-in-out infinite; }
        .ab-g1 { top:-6%; left:-4%; background: radial-gradient(circle, var(--ac) 0%, transparent 64%); }
        .ab-g2 { right:-4%; bottom:-6%; background: radial-gradient(circle, var(--ac2) 0%, transparent 64%); animation-delay:-5s; }
        .ab-net { position:absolute; inset:0; width:100%; height:100%; }
        .ab-vig { position:absolute; inset:0; pointer-events:none; background: radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.5) 100%); }
      `}</style>
      <div className="ab-grid" />
      <div className="ab-glow ab-g1" />
      <div className="ab-glow ab-g2" />
      <canvas ref={canvasRef} className="ab-net" />
      {vignette && <div className="ab-vig" />}
    </div>
  );
}
