// FILE: components/display/FinalRanking.tsx — Final step ④ Full ranking grid (photo-op)
// VERSION: B16d-v1 — everyone A→Z by money, fit-all degrade columns, top3 medals, wave reveal
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16d created — split from FinalDisplay; show all players for parents/photos
'use client';

import { useState } from 'react';
import { STARTING_MONEY } from '@/lib/constants';

interface FinalRankingProps {
  players: any[];
  animate: boolean;
}

export default function FinalRanking({ players, animate }: FinalRankingProps) {
  const [doAnim] = useState(animate); // snapshot ตอน mount
  const sorted = [...players].sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0));
  const n = sorted.length;
  const cols = n <= 48 ? 6 : n <= 80 ? 8 : 10;
  const medals = ['🥇', '🥈', '🥉'];
  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const total = 900; // wave total ms

  const cellBg = (i: number) =>
    i === 0 ? 'linear-gradient(180deg,rgba(255,215,0,0.18),#161b22)' :
    i === 1 ? 'linear-gradient(180deg,rgba(192,192,192,0.12),#161b22)' :
    i === 2 ? 'linear-gradient(180deg,rgba(205,127,50,0.14),#161b22)' : '#161b22';
  const cellBorder = (i: number) =>
    i < 3 ? rankColors[i] : 'rgba(255,255,255,0.07)';

  return (
    <div className="relative h-screen flex flex-col px-6 pt-14 pb-6 overflow-hidden">
      <style>{`@keyframes mwCellIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>

      <div className="flex items-baseline gap-4 mb-5">
        <h1 className="text-4xl font-black" style={{ color: '#FCD34D' }}>🏆 อันดับสุดท้าย · FINAL STANDINGS</h1>
        <span className="text-xl" style={{ color: 'rgba(255,255,255,0.75)' }}>ทุกคน {n} คน · all players</span>
        <span className="text-xl font-bold" style={{ color: '#00FFB2' }}>📸 ถ่ายรูปกันได้เลย!</span>
      </div>

      <div className="grid gap-2 flex-1 content-start" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {sorted.map((p, i) => {
          const money = parseFloat(p.money) || 0;
          const profit = money >= STARTING_MONEY;
          return (
            <div key={p.id} className="rounded-lg px-3 py-2.5 flex items-center gap-2"
              style={{
                background: cellBg(i),
                border: `1px solid ${cellBorder(i)}`,
                animation: doAnim ? 'mwCellIn 0.35s ease-out both' : 'none',
                animationDelay: doAnim ? `${(i * (total / Math.max(1, n))).toFixed(0)}ms` : '0ms',
              }}>
              <span className="font-bold text-base w-10 text-right" style={{ color: i < 3 ? rankColors[i] : 'rgba(255,255,255,0.65)' }}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </span>
              <span className="flex-1 font-bold text-lg truncate" style={{ color: i < 3 ? rankColors[i] : '#fff' }}>{p.name}</span>
              <span className="font-bold text-base whitespace-nowrap" style={{ color: profit ? '#22c55e' : '#ef4444' }}>฿{money.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
