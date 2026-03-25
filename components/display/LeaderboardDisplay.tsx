// FILE: components/display/LeaderboardDisplay.tsx — Display Leaderboard Top 10
// VERSION: B8R-v1 — Extracted from display/[roomId]/page.tsx
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B6 created (inline) | B8R extracted to component
'use client';

import { COMPANIES, RETURN_TABLE } from '@/lib/constants';

interface LeaderboardDisplayProps {
  players: any[];
  round: number;
}

export default function LeaderboardDisplay({ players, round }: LeaderboardDisplayProps) {
  const sorted = [...players].sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0));
  const top10 = sorted.slice(0, 10);
  const prevRankMap: Record<string, number> = {};

  if (round > 1) {
    const prev = [...players].sort((a, b) => {
      const aB = a.round_returns?.[String(round)]?.money_before || parseFloat(a.money) || 0;
      const bB = b.round_returns?.[String(round)]?.money_before || parseFloat(b.money) || 0;
      return bB - aB;
    });
    prev.forEach((p, i) => { prevRankMap[p.id] = i + 1; });
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="mt-8 max-w-lg mx-auto">
      <style>{`@keyframes leaderboardReveal { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } } .lb-row { opacity: 0; animation: leaderboardReveal 0.5s ease-out forwards; }`}</style>
      <div className="space-y-2">
        {top10.map((p, i) => {
          const rank = i + 1;
          const money = parseFloat(p.money) || 0;
          const movement = round > 1 ? (prevRankMap[p.id] || rank) - rank : 0;
          const isTop3 = rank <= 3;
          const delay = (10 - rank) * 0.3 + 0.5;
          return (
            <div key={p.id} className={`lb-row flex items-center px-4 py-3 rounded-lg ${isTop3 ? 'bg-[#161b22]' : 'border-b border-gray-800/50'}`} style={{ animationDelay: `${delay}s`, borderLeft: isTop3 ? `3px solid ${rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32'}` : 'none' }}>
              <span className={`w-8 text-center ${isTop3 ? 'text-xl' : 'text-sm text-gray-500'}`}>{isTop3 ? medals[rank - 1] : `#${rank}`}</span>
              <span className={`flex-1 ml-3 ${isTop3 ? 'text-lg font-bold text-white' : 'text-base text-gray-300'}`}>{p.name}</span>
              {round > 1 && movement !== 0 && <span className="text-xs mr-3 px-2 py-0.5 rounded-full" style={{ background: movement > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: movement > 0 ? '#22c55e' : '#ef4444' }}>{movement > 0 ? `↑${movement}` : `↓${Math.abs(movement)}`}</span>}
              <span className={`font-mono ${isTop3 ? 'text-lg font-bold' : 'text-base'} ${rank === 1 ? 'text-[#FFD700]' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-[#CD9B6A]' : 'text-gray-400'}`}>฿{money.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
      {sorted.length > 10 && <p className="text-gray-600 text-sm text-center mt-4">... +{sorted.length - 10} more players</p>}
    </div>
  );
}
