// FILE: components/mc/FinalMC.tsx — MC Final Stats + Full Leaderboard
// VERSION: B8R-v1 — Extracted from mc/[roomId]/page.tsx
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B7 created (inline) | B8R extracted to component
'use client';

import { STARTING_MONEY } from '@/lib/constants';

interface FinalMCProps {
  players: any[];
}

export default function FinalMC({ players }: FinalMCProps) {
  const sorted = [...players].sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0));
  const totalPlayers = sorted.length;
  const avgReturn = totalPlayers > 0 ? sorted.reduce((sum, p) => { const money = parseFloat(p.money) || 0; return sum + ((money - STARTING_MONEY) / STARTING_MONEY) * 100; }, 0) / totalPlayers : 0;
  const profitCount = sorted.filter(p => (parseFloat(p.money) || 0) > STARTING_MONEY).length;
  const lossCount = sorted.filter(p => (parseFloat(p.money) || 0) < STARTING_MONEY).length;
  const biggestWinner = sorted[0];
  const biggestWinnerPct = biggestWinner ? (((parseFloat(biggestWinner.money) || 0) - STARTING_MONEY) / STARTING_MONEY) * 100 : 0;
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <>
      {/* MC Tip */}
      <div className="rounded-lg p-3 mb-3" style={{ background: '#FFD70015', border: '1px solid #FFD70030' }}>
        <p className="text-xs" style={{ color: '#FFD700' }}>💡 ประกาศ Top 3! สรุป 5 บทเรียนการลงทุน: กระจายความเสี่ยง, อย่าตามกระแส, ข่าวมีผลต่อหุ้น, ออมก่อนลงทุน, อดทนรอผล</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#161b22] rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Total players</p>
          <p className="text-lg font-bold text-[#00D4FF]">{totalPlayers}</p>
        </div>
        <div className="bg-[#161b22] rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Avg return</p>
          <p className="text-lg font-bold" style={{ color: avgReturn >= 0 ? '#00FFB2' : '#FF4444' }}>{avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%</p>
        </div>
        <div className="bg-[#161b22] rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Biggest winner</p>
          <p className="text-sm font-bold text-[#FFD700]">{biggestWinner?.name || '-'} {biggestWinnerPct >= 0 ? '+' : ''}{biggestWinnerPct.toFixed(1)}%</p>
        </div>
        <div className="bg-[#161b22] rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Profit / Loss</p>
          <div className="flex justify-center items-baseline gap-1">
            <span className="text-lg font-bold text-[#00FFB2]">{profitCount}</span>
            <span className="text-gray-600">/</span>
            <span className="text-lg font-bold text-[#FF4444]">{lossCount}</span>
          </div>
        </div>
      </div>

      {/* Full leaderboard */}
      <div className="bg-[#161b22] rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 mb-2">Full leaderboard</p>
        <div className="max-h-64 overflow-y-auto space-y-0.5">
          {sorted.map((p, i) => {
            const money = parseFloat(p.money) || 0;
            const returnPct = ((money - STARTING_MONEY) / STARTING_MONEY) * 100;
            const isTop3 = i < 3;
            return (
              <div key={p.id} className="flex items-center justify-between text-sm py-1 px-1 border-b border-gray-800/50">
                <div className="flex items-center gap-1">
                  <span className={`w-6 text-xs ${isTop3 ? (i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-gray-300' : 'text-[#CD9B6A]') : 'text-gray-600'}`}>{isTop3 ? medals[i] : `#${i+1}`}</span>
                  <span className={`${isTop3 ? (i === 0 ? 'text-[#FFD700] font-bold' : i === 1 ? 'text-gray-300 font-bold' : 'text-[#CD9B6A] font-bold') : 'text-gray-400'}`}>{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: returnPct >= 0 ? '#00FFB2' : '#FF4444' }}>{returnPct >= 0 ? '+' : ''}{returnPct.toFixed(1)}%</span>
                  <span className={`${isTop3 ? (i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-gray-300' : 'text-[#CD9B6A]') : 'text-gray-500'}`}>฿{money.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
