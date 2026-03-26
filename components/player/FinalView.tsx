// FILE: components/player/FinalView.tsx — Player Final Phase
// VERSION: B13-v1 — Chance card stats + ปี labels
// LAST MODIFIED: 27 Mar 2026
// HISTORY: B7 created (rank + profit + bars + top5) | B8R extracted to component | B11 stats + badge | B13 chance card stats + ปี labels

import { STARTING_MONEY, TOTAL_ROUNDS } from '@/lib/constants';
import { calculateAwards, getPlayerAwards, calcPlayerStats } from '@/lib/awards';

interface FinalViewProps {
  player: any;
  players: any[];
}

export default function FinalView({ player, players }: FinalViewProps) {
  if (!player) return null;

  const sorted = [...players].sort(
    (a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0)
  );
  const rank = sorted.findIndex((p) => p.id === player.id) + 1;
  const money = parseFloat(player.money) || STARTING_MONEY;
  const profit = money - STARTING_MONEY;
  const pctReturn = ((profit) / STARTING_MONEY) * 100;
  const isProfit = profit >= 0;

  // Awards
  const awards = calculateAwards(players);
  const myAwards = getPlayerAwards(player.id, awards);

  // Player stats
  const stats = calcPlayerStats(player);

  // Round-by-round bars
  const roundBars: { round: number; pct: number }[] = [];
  for (let r = 1; r <= TOTAL_ROUNDS; r++) {
    const rr = player.round_returns?.[String(r)];
    if (!rr) {
      roundBars.push({ round: r, pct: 0 });
      continue;
    }
    const before = parseFloat(rr.money_before) || STARTING_MONEY;
    const after = parseFloat(rr.money_after) || before;
    const pct = before > 0 ? ((after - before) / before) * 100 : 0;
    roundBars.push({ round: r, pct });
  }
  const maxAbsPct = Math.max(...roundBars.map((b) => Math.abs(b.pct)), 1);

  // Top 5
  const top5 = sorted.slice(0, 5);
  const isInTop5 = top5.some((p) => p.id === player.id);

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* YOUR RANK */}
      <div className="text-center mb-4">
        <div className="text-5xl font-black text-white">#{rank}</div>
        <div className="text-gray-400 text-sm">of {players.length} players</div>
      </div>

      {/* Total Profit */}
      <div className="text-center mb-4">
        <div
          className="text-2xl font-bold"
          style={{ color: isProfit ? '#22c55e' : '#ef4444' }}
        >
          {isProfit ? '+' : '-'}฿{Math.abs(profit).toLocaleString()}
        </div>
        <div className="text-gray-500 text-xs">
          {isProfit ? '+' : ''}{pctReturn.toFixed(1)}% from ฿{STARTING_MONEY.toLocaleString()}
        </div>
      </div>

      {/* === B11: Award Badges === */}
      {myAwards.length > 0 && (
        <div className="mb-4">
          {myAwards.map((award) => (
            <div
              key={award.id}
              className="bg-gradient-to-r from-yellow-900/30 to-yellow-700/10 border border-yellow-600/40 rounded-lg px-4 py-3 text-center mb-2"
            >
              <span className="text-2xl">{award.emoji}</span>
              <span className="text-sm font-bold ml-2" style={{ color: '#FCD34D' }}>
                {award.name}
              </span>
              <div className="text-xs text-gray-400 mt-1">{award.stat}</div>
            </div>
          ))}
        </div>
      )}

      {/* === Your Stats — ✅ B13: เปลี่ยน duel → chance card === */}
      <div className="bg-[#161b22] rounded-lg p-3 mb-4">
        <div className="text-xs tracking-widest text-gray-500 mb-2">YOUR STATS</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: '#00D4FF' }}>
              {stats.quizCorrect}/{stats.quizTotal}
            </div>
            <div className="text-xs text-gray-500">Quiz ถูก</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: stats.chanceTotal >= 0 ? '#22c55e' : '#ef4444' }}>
              {stats.chanceTotal >= 0 ? '+' : '-'}฿{Math.abs(stats.chanceTotal).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">🃏 Chance Card</div>
          </div>
        </div>
      </div>

      {/* Round-by-round bars — ✅ B13: R → ปี */}
      <div className="bg-[#161b22] rounded-lg p-3 mb-4">
        <div className="text-xs tracking-widest text-gray-500 mb-2">ผลตอบแทนรายปี</div>
        <div className="flex items-end justify-around gap-1" style={{ height: '80px' }}>
          {roundBars.map((bar) => {
            const heightPct = Math.abs(bar.pct) / maxAbsPct;
            const h = Math.max(heightPct * 60, 4);
            const color = bar.pct >= 0 ? '#22c55e' : '#ef4444';
            return (
              <div key={bar.round} className="flex flex-col items-center" style={{ width: '40px' }}>
                <span className="text-xs font-bold mb-1" style={{ color }}>
                  {bar.pct >= 0 ? '+' : ''}{bar.pct.toFixed(0)}%
                </span>
                <div
                  className="w-6 rounded-t"
                  style={{ height: `${h}px`, backgroundColor: color, opacity: 0.8 }}
                />
                <span className="text-xs text-gray-600 mt-1">ปี{bar.round}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 5 */}
      <div className="bg-[#161b22] rounded-lg p-3 mb-4">
        <div className="text-xs tracking-widest text-gray-500 mb-2">TOP 5</div>
        <div className="space-y-1">
          {top5.map((p, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const isMe = p.id === player.id;
            const m = parseFloat(p.money) || 0;
            return (
              <div
                key={p.id}
                className={`flex justify-between items-center px-2 py-1 rounded ${isMe ? 'bg-green-900/20 border border-green-800/30' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm w-6 text-center">
                    {i < 3 ? medals[i] : `#${i + 1}`}
                  </span>
                  <span className={`text-sm ${isMe ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                    {isMe ? `You (${p.name})` : p.name}
                  </span>
                </div>
                <span className="text-sm text-gray-400">฿{m.toLocaleString()}</span>
              </div>
            );
          })}
          {!isInTop5 && (
            <>
              <div className="border-t border-dashed border-gray-700 my-1" />
              <div className="flex justify-between items-center px-2 py-1 rounded bg-green-900/20 border border-green-800/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm w-6 text-center">#{rank}</span>
                  <span className="text-sm text-green-400 font-bold">You ({player.name})</span>
                </div>
                <span className="text-sm text-gray-400">฿{money.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Thank you */}
      <p className="text-center text-gray-500 text-sm mt-4">Thank you for playing!</p>
    </div>
  );
}
