// FILE: components/display/FinalPodium.tsx — Final step ② Podium reveal (3→2→1)
// VERSION: B19-v3 — slower per-name reveal (PODIUM_REVEAL constants, ~3.5–4s gaps so MC announces each); drumroll→name per place
// LAST MODIFIED: 13 Jun 2026
// HISTORY: B16d created — split from FinalDisplay; reveal 3→2→1 + champion glow + confetti + SFX; settled on revisit | B18 compareForRank | B19 staged reveal + Card→renderCard (no remount) + tunable timeline
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

// B19: podium reveal timeline (seconds) — TUNE HERE. SFX, confetti, crown all derive from these.
// bigger gaps = MC has more time to announce each place one-by-one.
const PODIUM_REVEAL = { third: 2.5, second: 6.0, first: 10.0 };
const PODIUM_DRUMROLL_LEAD = 1.0; // drumroll this many seconds before each name appears

export default function FinalPodium({ players, animate, playSfx }: FinalPodiumProps) {
  // snapshot ตอน mount — กัน prop เปลี่ยนกลาง animation (player data update) มาตัด SFX/ภาพทิ้ง
  const [doAnim] = useState(animate);
  const [confetti, setConfetti] = useState(false);
  const sorted = [...players].sort(compareForRank);
  const top3 = sorted.slice(0, 3);
  const awards = calculateAwards(players);

  // SFX + confetti choreography (only on first reveal) — drumroll → name, one at a time, for MC to announce
  useEffect(() => {
    if (!doAnim) return;
    const ms = (s: number) => Math.max(0, Math.round(s * 1000));
    const lead = PODIUM_DRUMROLL_LEAD;
    const t: ReturnType<typeof setTimeout>[] = [];
    if (playSfx) {
      t.push(setTimeout(() => playSfx('sfx_drumroll'), ms(PODIUM_REVEAL.third - lead)));
      t.push(setTimeout(() => playSfx('sfx_cash'), ms(PODIUM_REVEAL.third)));      // 3rd
      t.push(setTimeout(() => playSfx('sfx_drumroll'), ms(PODIUM_REVEAL.second - lead)));
      t.push(setTimeout(() => playSfx('sfx_cash'), ms(PODIUM_REVEAL.second)));     // 2nd
      t.push(setTimeout(() => playSfx('sfx_drumroll'), ms(PODIUM_REVEAL.first - lead)));
      t.push(setTimeout(() => playSfx('sfx_fanfare'), ms(PODIUM_REVEAL.first)));   // champion
    }
    t.push(setTimeout(() => setConfetti(true), ms(PODIUM_REVEAL.first)));          // confetti on champion reveal
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

  // B19: stage (podium bars) rises early, then reveal people one-by-one 3→2→1 (timeline in PODIUM_REVEAL)
  const barDelay = (rankIndex: number) => (rankIndex === 2 ? 0.3 : rankIndex === 1 ? 0.45 : 0.6);
  const revealDelay = (rankIndex: number) => (rankIndex === 2 ? PODIUM_REVEAL.third : rankIndex === 1 ? PODIUM_REVEAL.second : PODIUM_REVEAL.first);
  const personAnim = (rankIndex: number) => doAnim
    ? { animation: 'mwRise 0.55s cubic-bezier(.2,1.3,.4,1) both', animationDelay: `${revealDelay(rankIndex)}s` }
    : {};
  const baseAnim = (rankIndex: number) => doAnim
    ? { animation: 'mwGrow 0.5s cubic-bezier(.2,1.1,.3,1) both', animationDelay: `${barDelay(rankIndex)}s`, transformOrigin: 'bottom' as const }
    : {};

  const wonTwo = (id: string) => getPlayerAwards(id, awards).length > 0;

  // B19: plain render fn (NOT a nested component) — using <Card/> remounted all cards on every
  // re-render (new function identity each render), restarting the reveal. Calling renderCard() inlines JSX.
  const renderCard = (p: any, rankIndex: number) => {
    if (!p) return null;
    const isChamp = rankIndex === 0;
    const h = isChamp ? 240 : rankIndex === 1 ? 195 : 165;
    const w = isChamp ? 235 : 215;
    return (
      <div key={rankIndex} className="text-center flex flex-col items-center justify-end">
        <div style={personAnim(rankIndex)} className="flex flex-col items-center">
          {isChamp && <div className="text-6xl mb-1" style={doAnim ? { animation: 'mwGlow 1.6s ease-in-out infinite', animationDelay: `${PODIUM_REVEAL.first + 0.6}s` } : {}}>👑</div>}
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
      <ConfettiCanvas fire={confetti} scale={1} />

      <div className="text-center mb-6" style={doAnim ? { animation: 'mwRise .5s ease-out both' } : {}}>
        <h1 className="text-5xl font-black" style={{ color: '#FCD34D' }}>🏆 แชมป์ Market Wars</h1>
        <p className="text-xl mt-2" style={{ color: 'rgba(255,255,255,0.78)' }}>Champions of the year · จบครบ 6 ปี</p>
      </div>

      <div className="flex items-end gap-6">
        {renderCard(top3[1], 1)}
        {renderCard(top3[0], 0)}
        {renderCard(top3[2], 2)}
      </div>
    </div>
  );
}
