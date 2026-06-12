// FILE: components/display/YearIntroDisplay.tsx — Display year-intro splash
// VERSION: B19-v2 — AnimatedBackdrop (Network+Grid) replaces static radial glows; keeps ghost year number
// LAST MODIFIED: 13 Jun 2026
// HISTORY: B16a-BATCH0 extracted inline year_intro from display/page.tsx | B19-BATCH2 AnimatedBackdrop
'use client';

import { STEP_GROUPS, YEAR_INTRO_TEXT } from '@/lib/constants';
import AnimatedBackdrop from '@/components/display/AnimatedBackdrop';

export default function YearIntroDisplay({ round, zoom }: { round: number; zoom: number }) {
  const introText = YEAR_INTRO_TEXT[round] || { title: `ปีที่ ${round} เริ่มแล้ว!`, subtitle: 'เตรียมตัวให้พร้อม' };
  return (
    <div className="h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center relative overflow-hidden" style={{ zoom }}>
      <AnimatedBackdrop accent="#00FFB2" accent2="#00D4FF" />
      <div className="absolute font-black leading-none select-none pointer-events-none" style={{ fontSize: '320px', color: 'rgba(0,255,178,0.05)', top: '50%', left: '50%', transform: 'translate(-50%,-55%)' }}>{round}</div>
      <div className="text-center z-10">
        <p className="text-xl tracking-[8px] font-semibold mb-4" style={{ color: '#00D4FF' }}>Y E A R</p>
        <p className="font-black leading-none mb-6" style={{ color: '#00FFB2', fontSize: '160px' }}>{round}</p>
        <p className="text-4xl text-white font-bold mb-4">{introText.title}</p>
        <p className="text-2xl mb-10" style={{ color: 'rgba(255,255,255,0.75)' }}>{introText.subtitle}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {STEP_GROUPS.map((g) => (
            <span key={g.id} className="text-base px-4 py-2 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)' }}>
              {g.icon} {g.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
