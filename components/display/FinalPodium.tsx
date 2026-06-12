// FILE: components/display/FinalPodium.tsx — Final step ② Podium reveal (3→2→1)
// VERSION: B18-v1 — rank via compareForRank (money → quiz → speed); reveal 3-2-1 + confetti + SFX
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16d created — split from FinalDisplay; reveal 3→2→1 + champion glow + confetti + SFX; settled on revisit | B18 compareForRank
'use client';

import { useEffect, useState } from 'react';
import { compareForRank } from '@/lib/ranking';
import { STARTING_MONEY } from '@/lib/constants';
import { calculateAwards, getPlayerAwards } from '@/lib/awards';
import type { SfxKey } from '@/lib/sound';
import ConfettiCanvas from '@/components/display/ConfettiCanvas';

interface FinalPodiumProps {
  players: any[];
  animate: boolean;
  playSfx?: (k: SfxKey) => void;
}

export default function FinalPodium({ players, animate, playSfx }: FinalPodiumProps) {
  // snapshot ตอน mount — กัน prop เปลี่ยนกลาง animation (player data update) มาตัด SFX/ภาพทิ้ง
  const [doAnim] = useState(animate);
  const sorted = [...players].sort(compareForRank);
  const top3 = sorted.slice(0, 3);
  const awards = calculateAwards(players);

  // SFX choreography (only on first reveal)
  useEffect(() => {
    if (!doAnim || !playSfx) return;
    const t: ReturnType<typeof setTimeout>[] = [];
    playSfx('sfx_drumroll');
    t.push(setTimeout(() => playSfx('sfx_cash'), 200));   // 3rd
    t.push(setTimeout(() => playSfx('sfx_cash'), 900));   // 2nd
    t.push(setTimeout(() => playSfx('sfx_fanfare'), 1600)); // 1st
    return () => t.forEach(clearTimeout);
  }, [doAnim, playSfx]);

  const medals = ['🥇', '🥈', '🥉'];
  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const podiumBg = ['rgba(255,215,0,0.12)', 'rgba(192,192,192,0.1)', 'rgba(205,127,50,0.1)'];
  const nameColors = ['#FCD34D', '#D1D5DB', '#FBBF24'];
  const getReturnPct = (m: number) => {
    const v = ((m || STARTING_MONEY) - STARTING_MONEY) / STARTING_MONEY * 100;
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}`;
  };
  const getReturnColor = (m: number) => (m || 0) >= STARTING_MONEY ? '#22c55e' : '#ef4444';

  // delays for 3→2→1 (champion last)
  const delayFor = (rankIndex: number) => (rankIndex === 2 ? 0.2 : rankIndex === 1 ? 0.9 : 1.6);
  const personAnim = (rankIndex: number) => doAnim
    ? { animation: 'mwRise 0.55s cubic-bezier(.2,1.3,.4,1) both', animationDelay: `${delayFor(rankIndex)}s` }
    : {};
  const baseAnim = (rankIndex: number) => doAnim
    ? { animation: 'mwGrow 0.5s cubic-bezier(.2,1.1,.3,1) both', animationDelay: `${delayFor(rankIndex)}s`, transformOrigin: 'bottom' as const }
    : {};

  const wonTwo = (id: string) => getPlayerAwards(id, awards).length > 0;

  const Card = ({ p, rankIndex }: { p: any; rankIndex: number }) => {
    if (!p) return null;
    const isChamp = rankIndex === 0;
    const h = isChamp ? 240 : rankIndex === 1 ? 195 : 165;
    const w = isChamp ? 235 : 215;
    return (
      <div className="text-center flex flex-col items-center justify-end">
        <div style={personAnim(rankIndex)} className="flex flex-col items-center">
          {isChamp && <div className="text-6xl mb-1" style={doAnim ? { animation: 'mwGlow 1.6s ease-in-out infinite', animationDelay: '2.2s' } : {}}>👑</div>}
          <p className={isChamp ? 'text-5xl mb-2' : 'text-4xl mb-2'}>{medals[rankIndex]}</p>
          <p className={`${isChamp ? 'text-3xl' : 'text-xl'} font-bold truncate max-w-[220px]`} style={{ color: nameColors[rankIndex] }}>{p.name}</p>
          <p className={`${isChamp ? 'text-2xl' : 'text-lg'} mt-1`} style={{ color: 'rgba(255,255,255,0.85)' }}>฿{(parseFloat(p.money) || 0).toLocaleString()}</p>
          <p className={`${isChamp ? 'text-xl' : 'text-base'} mt-0.5`} style={{ color: getReturnColor(parseFloat(p.money)) }}>{getReturnPct(parseFloat(p.money))}%</p>
          {wonTwo(p.id) && (
            <p className="mt-2 text-sm font-bold px-3 py-1 rounded-full" style={{ color: '#04210f', background: 'linear-gradient(135deg,#FFD700,#00FFB2)' }}>🏆 ชนะ 2 รางวัล · 2 awards</p>
          )}
        </div>
        <div className="rounded-t-xl mt-3" style={{ ...baseAnim(rankIndex), background: podiumBg[rankIndex], height: `${h}px`, width: `${w}px`, borderTop: `3px solid ${podiumColors[rankIndex]}` }} />
      </div>
    );
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center px-8 overflow-hidden">
      <style>{`
        @keyframes mwRise { from { opacity:0; transform:translateY(60px) } to { opacity:1; transform:translateY(0) } }
        @keyframes mwGrow { from { transform:scaleY(0) } to { transform:scaleY(1) } }
        @keyframes mwGlow { 0%,100%{ filter:drop-shadow(0 0 6px #FFD700) } 50%{ filter:drop-shadow(0 0 22px #FFD700) } }
      `}</style>
      <ConfettiCanvas fire={doAnim} scale={1} />

      <div className="text-center mb-6" style={doAnim ? { animation: 'mwRise .5s ease-out both' } : {}}>
        <h1 className="text-5xl font-black" style={{ color: '#FCD34D' }}>🏆 แชมป์ Market Wars</h1>
        <p className="text-xl mt-2" style={{ color: 'rgba(255,255,255,0.78)' }}>Champions of the year · จบครบ 6 ปี</p>
      </div>

      <div className="flex items-end gap-6">
        <Card p={top3[1]} rankIndex={1} />
        <Card p={top3[0]} rankIndex={0} />
        <Card p={top3[2]} rankIndex={2} />
      </div>
    </div>
  );
}
