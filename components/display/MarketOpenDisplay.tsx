// FILE: components/display/MarketOpenDisplay.tsx — Display market-open splash
// VERSION: B19-v3 — AnimatedBackdrop (gold) + chart draw-in + icon grow-and-hold (no shrink) + staggered content fade
// LAST MODIFIED: 13 Jun 2026
// HISTORY: B16a-BATCH0 extracted inline market_open from display/page.tsx | B19-BATCH3 backdrop + entrance animation | B19 icon grow-and-hold bigger
'use client';

import { TOTAL_ROUNDS } from '@/lib/constants';
import AnimatedBackdrop from '@/components/display/AnimatedBackdrop';

export default function MarketOpenDisplay({ round, zoom }: { round: number; zoom: number }) {
  return (
    <div className="h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center relative overflow-hidden" style={{ zoom }}>
      <style>{`
        @keyframes moDraw { to { stroke-dashoffset: 0; } }
        @keyframes moArea { to { opacity: 0.16; } }
        @keyframes moFade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes moPop { 0% { opacity: 0; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1); } }
        .mo-line { fill: none; stroke: #00FFB2; stroke-width: 3; opacity: 0.45; stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: moDraw 1.5s ease-out 0.15s forwards; }
        .mo-area { fill: #00FFB2; opacity: 0; animation: moArea 0.6s ease-out 1.05s forwards; }
        .mo-anim { opacity: 0; animation: moFade 0.55s ease-out forwards; }
        .mo-pop { opacity: 0; animation: moPop 0.55s ease-out forwards; }
      `}</style>

      <AnimatedBackdrop accent="#FFD700" accent2="#00FFB2" />

      <svg className="absolute bottom-0 left-0 right-0" style={{ height: '45%' }} viewBox="0 0 720 160" preserveAspectRatio="none">
        <polyline className="mo-area" points="0,140 60,120 120,130 180,80 240,100 300,60 360,90 420,40 480,70 540,30 600,50 660,20 720,35 720,160 0,160" />
        <polyline className="mo-line" points="0,140 60,120 120,130 180,80 240,100 300,60 360,90 420,40 480,70 540,30 600,50 660,20 720,35" />
      </svg>

      <div className="text-center z-10">
        <p className="mo-anim text-lg tracking-[4px] mb-5 font-semibold" style={{ color: '#00D4FF', animationDelay: '0.1s' }}>YEAR {round} OF {TOTAL_ROUNDS}</p>
        <p className="mo-pop mb-5" style={{ fontSize: '9rem', lineHeight: 1, animationDelay: '0.3s' }}>📈</p>
        <p className="mo-anim text-5xl font-black mb-3" style={{ color: '#FFD700', animationDelay: '0.5s' }}>ตลาดปีที่ {round} กำลังเปิด!</p>
        <p className="mo-anim text-2xl font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.9)', animationDelay: '0.7s' }}>เตรียมรับมือกับสิ่งที่จะเกิดขึ้น...</p>
        <p className="mo-anim text-xl" style={{ color: 'rgba(255,255,255,0.65)', animationDelay: '0.85s' }}>มาดูกันว่าปีนี้เกิดอะไรขึ้น...</p>
      </div>
    </div>
  );
}
