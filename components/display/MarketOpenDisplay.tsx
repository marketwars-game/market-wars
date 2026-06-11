// FILE: components/display/MarketOpenDisplay.tsx — Display market-open splash
// VERSION: B16a-v1 — extracted from display/page.tsx (refactor shell, no behavior change)
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16a-BATCH0 extracted inline market_open from display/page.tsx
'use client';

import { TOTAL_ROUNDS } from '@/lib/constants';

export default function MarketOpenDisplay({ round, zoom }: { round: number; zoom: number }) {
  return (
    <div className="h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center relative overflow-hidden" style={{ zoom }}>
      <svg className="absolute bottom-0 left-0 right-0" style={{ height: '45%', opacity: 0.25 }} viewBox="0 0 720 160" preserveAspectRatio="none">
        <polyline points="0,140 60,120 120,130 180,80 240,100 300,60 360,90 420,40 480,70 540,30 600,50 660,20 720,35" fill="none" stroke="#00FFB2" strokeWidth="3" />
        <polyline points="0,140 60,120 120,130 180,80 240,100 300,60 360,90 420,40 480,70 540,30 600,50 660,20 720,35 720,160 0,160" fill="#00FFB2" opacity="0.2" />
      </svg>
      <div className="absolute rounded-full pointer-events-none" style={{ width: '500px', height: '500px', background: 'rgba(255,215,0,0.05)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: '280px', height: '280px', background: 'rgba(255,215,0,0.07)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      <div className="text-center z-10">
        <p className="text-lg tracking-[4px] mb-5 font-semibold" style={{ color: '#00D4FF' }}>YEAR {round} OF {TOTAL_ROUNDS}</p>
        <p className="text-8xl mb-5">📈</p>
        <p className="text-5xl font-black mb-3" style={{ color: '#FFD700' }}>ตลาดปีที่ {round} กำลังเปิด!</p>
        <p className="text-2xl font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>เตรียมรับมือกับสิ่งที่จะเกิดขึ้น...</p>
        <p className="text-xl" style={{ color: 'rgba(255,255,255,0.65)' }}>มาดูกันว่าปีนี้เกิดอะไรขึ้น...</p>
      </div>
    </div>
  );
}
