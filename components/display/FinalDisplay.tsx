// FILE: components/display/FinalDisplay.tsx — Display Final Phase ROUTER (4 steps)
// VERSION: B16d-v1 — split single screen → suspense / podium / awards / ranking (MC-controlled steps)
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B7 created | B8R extracted | B11 awards | B12-UX horizontal | B13 redesign | B15 projector polish | B16d 4-step router (FinalPodium/FinalAwards/FinalRanking)
'use client';

import type { SfxKey } from '@/lib/sound';
import FinalPodium from '@/components/display/FinalPodium';
import FinalAwards from '@/components/display/FinalAwards';
import FinalRanking from '@/components/display/FinalRanking';

export type FinalPhase = 'final' | 'final_podium' | 'final_awards' | 'final_ranking';

interface FinalDisplayProps {
  players: any[];
  phase: FinalPhase;
  animate: boolean;
  playSfx?: (k: SfxKey) => void;
}

// === Step ① suspense — "ใครคือแชมป์?" ค้างไว้ รอ MC กดเฉลย ===
function FinalSuspense() {
  return (
    <div className="relative h-screen flex flex-col items-center justify-center px-8 overflow-hidden">
      <style>{`
        @keyframes mwPulse { 0%,100%{ transform:scale(1); opacity:.9 } 50%{ transform:scale(1.06); opacity:1 } }
        @keyframes mwBlink { 0%,100%{ opacity:.25 } 50%{ opacity:1 } }
      `}</style>
      <h1 className="text-7xl font-black" style={{ animation: 'mwPulse 0.8s ease-in-out infinite', background: 'linear-gradient(90deg,#fff,#00FFB2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
        ใครคือแชมป์?
      </h1>
      <p className="text-3xl mt-5" style={{ color: 'rgba(255,255,255,0.78)' }}>Who's the champion of Market Wars?</p>
      <p className="text-xl mt-10" style={{ color: 'rgba(255,255,255,0.65)' }}>
        รอ MC เฉลย
        <span style={{ animation: 'mwBlink 1.2s infinite' }}> ●</span>
        <span style={{ animation: 'mwBlink 1.2s infinite', animationDelay: '0.2s' }}>●</span>
        <span style={{ animation: 'mwBlink 1.2s infinite', animationDelay: '0.4s' }}>●</span>
      </p>
    </div>
  );
}

export default function FinalDisplay({ players, phase, animate, playSfx }: FinalDisplayProps) {
  // key={phase} → remount per step so entrance animation runs fresh; settled handled via `animate`
  if (phase === 'final_podium') return <FinalPodium key="podium" players={players} animate={animate} playSfx={playSfx} />;
  if (phase === 'final_awards') return <FinalAwards key="awards" players={players} animate={animate} playSfx={playSfx} />;
  if (phase === 'final_ranking') return <FinalRanking key="ranking" players={players} animate={animate} />;
  return <FinalSuspense />;
}
