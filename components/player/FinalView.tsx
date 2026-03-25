// FILE: components/player/FinalView.tsx — Player Final Summary
// VERSION: B8R-v1 — Extracted from play/[roomId]/page.tsx
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B7 created (inline) | B8R extracted to component
'use client';

import { STARTING_MONEY, TOTAL_ROUNDS } from '@/lib/constants';

interface FinalViewProps {
  player: any;
  players: any[];
}

export default function FinalView({ player, players }: FinalViewProps) {
  const myMoney = parseFloat(player.money) || 0;
  const sorted = [...players].sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0));
  const myRank = sorted.findIndex(p => p.id === player.id) + 1;
  const totalProfit = myMoney - STARTING_MONEY;
  const totalReturnPct = (totalProfit / STARTING_MONEY) * 100;
  const top5 = sorted.slice(0, 5);
  const isInTop5 = top5.some(p => p.id === player.id);
  const medals = ['🥇', '🥈', '🥉'];

  const roundReturns: { round: number; pct: number }[] = [];
  for (let r = 1; r <= TOTAL_ROUNDS; r++) {
    const rr = player.round_returns?.[String(r)];
    if (rr) {
      const before = parseFloat(rr.money_before) || STARTING_MONEY;
      const after = parseFloat(rr.money_after) || before;
      roundReturns.push({ round: r, pct: before > 0 ? ((after - before) / before) * 100 : 0 });
    }
  }
  const maxAbsPct = Math.max(...roundReturns.map(r => Math.abs(r.pct)), 1);

  return (
    <>
      {/* Your Rank */}
      <div className="bg-[#161b22] rounded-lg p-5 text-center mb-3">
        <div className="text-4xl mb-2">🏆</div>
        <p className="text-xs text-gray-500 mb-1">Your final rank</p>
        <p className="text-5xl font-bold text-[#00FFB2] leading-none">#{myRank}</p>
        <p className="text-xs text-gray-500 mt-1">of {sorted.length} players</p>
      </div>

      {/* Total Profit */}
      <div className="bg-[#161b22] rounded-lg p-4 text-center mb-3">
        <p className="text-xs text-gray-500 mb-1">Total profit</p>
        <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-[#00FFB2]' : 'text-[#FF4444]'}`}>
          {totalProfit >= 0 ? '+' : '-'}฿{Math.abs(totalProfit).toLocaleString()}
        </p>
        <p className={`text-sm mt-1 ${totalProfit >= 0 ? 'text-[#00FFB2]' : 'text-[#FF4444]'}`}>
          {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(1)}% from ฿{STARTING_MONEY.toLocaleString()}
        </p>
      </div>

      {/* Round-by-round returns */}
      {roundReturns.length > 0 && (
        <div className="bg-[#161b22] rounded-lg p-4 mb-3">
          <p className="text-xs text-gray-500 text-center mb-3">Round-by-round returns</p>
          <div className="flex gap-1.5 items-end justify-center" style={{ height: '80px' }}>
            {roundReturns.map((r) => {
              const barH = Math.max(4, (Math.abs(r.pct) / maxAbsPct) * 64);
              const isPos = r.pct >= 0;
              return (
                <div key={r.round} className="flex-1 text-center">
                  <div className="mx-auto rounded-t" style={{ height: `${barH}px`, backgroundColor: isPos ? '#00FFB2' : '#FF4444' }} />
                  <p className="text-[10px] mt-0.5" style={{ color: isPos ? '#00FFB2' : '#FF4444' }}>{isPos ? '+' : ''}{r.pct.toFixed(0)}%</p>
                  <p className="text-[10px] text-gray-600">R{r.round}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top 5 */}
      <div className="bg-[#161b22] rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 text-center mb-2">Top 5</p>
        {top5.map((p, i) => {
          const isMe = p.id === player.id;
          return (
            <div key={p.id} className={`flex items-center py-1.5 px-1 text-sm ${i < top5.length - 1 ? 'border-b border-gray-800' : ''} ${isMe ? 'bg-[#00FFB2]/10 rounded' : ''}`}>
              <span className={`w-6 text-center text-xs ${isMe ? 'text-[#00FFB2] font-bold' : i < 3 ? (i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-gray-300' : 'text-[#CD9B6A]') : 'text-gray-500'}`}>{i < 3 ? medals[i] : `#${i+1}`}</span>
              <span className={`flex-1 ml-1 ${isMe ? 'text-[#00FFB2] font-bold' : i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-[#CD9B6A]' : 'text-gray-400'}`}>{isMe ? `You (${p.name})` : p.name}</span>
              <span className={`${isMe ? 'text-[#00FFB2] font-bold' : i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-[#CD9B6A]' : 'text-gray-400'}`}>฿{(parseFloat(p.money) || 0).toLocaleString()}</span>
            </div>
          );
        })}
        {!isInTop5 && (
          <>
            <div className="border-t border-dashed border-gray-700 my-2" />
            <div className="flex items-center py-1.5 px-2 rounded text-sm bg-[#00FFB2]/10">
              <span className="w-6 text-center text-xs text-[#00FFB2] font-bold">#{myRank}</span>
              <span className="flex-1 ml-1 text-[#00FFB2] font-bold">You ({player.name})</span>
              <span className="text-[#00FFB2] font-bold">฿{myMoney.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {/* Thank you */}
      <div className="text-center py-2">
        <p className="text-sm text-[#00FFB2]">Thank you for playing!</p>
      </div>
    </>
  );
}
