// FILE: components/mc/ResultsMC.tsx — MC Results Summary + Player List
// VERSION: B13-BATCH3-v2 — Show stock vs chance card breakdown
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B5 created (inline) | B7 added player list | B8R extracted to component | B9 include duel money | B13-BATCH2 chance card replaces duel | B13-BATCH3-v2 stock vs card breakdown
'use client';

interface ResultsMCProps {
  round: number;
  players: any[];
}

export default function ResultsMC({ round, players }: ResultsMCProps) {
  const playerResults = players.map((p) => {
    const stockProfit = p.round_returns?.[String(round)]?.total_return || 0;
    const chanceProfit = parseFloat(p.duel_money_change) || 0;
    const hasChance = (p.duel_submitted_round || 0) >= round;
    return {
      id: p.id,
      name: p.name,
      profit: stockProfit + (hasChance ? chanceProfit : 0),
      stockProfit,
      chanceProfit: hasChance ? chanceProfit : 0,
    };
  }).sort((a, b) => b.profit - a.profit);

  const profits = playerResults.map(p => p.profit);
  const avg = profits.length > 0 ? Math.round(profits.reduce((a, b) => a + b, 0) / profits.length) : 0;
  const profitCount = profits.filter(p => p > 0).length;
  const lossCount = profits.filter(p => p < 0).length;
  const evenCount = profits.filter(p => p === 0).length;

  return (
    <div className="bg-[#161b22] rounded-lg p-3 mb-3 border border-[#22c55e]/30">
      <p className="text-[#22c55e] text-sm font-bold mb-2">💰 Round {round} Results</p>
      <div className="flex justify-between text-xs mb-2 pb-2 border-b border-gray-800">
        <span className="text-gray-400">Avg: <span style={{ color: avg >= 0 ? '#22c55e' : '#ef4444' }}>{avg >= 0 ? '+' : '-'}฿{Math.abs(avg).toLocaleString()}</span></span>
        <span className="text-gray-400"><span className="text-[#22c55e]">{profitCount}</span> profit / <span className="text-[#ef4444]">{lossCount}</span> loss{evenCount > 0 && <span className="text-gray-500"> / {evenCount} even</span>}</span>
      </div>
      {/* ✅ B13-v2: Column headers — แยก หุ้น vs การ์ด */}
      <div className="flex items-center text-[9px] text-gray-600 px-1 mb-1">
        <span className="w-5"></span>
        <span className="flex-1 ml-1.5">Player</span>
        <span className="w-16 text-right">📈 หุ้น</span>
        <span className="w-16 text-right">🃏 การ์ด</span>
        <span className="w-16 text-right font-bold">รวม</span>
      </div>
      <div className="max-h-48 overflow-y-auto space-y-0.5">
        {playerResults.map((p, i) => (
          <div key={p.id} className="flex items-center text-xs py-1 px-1 border-b border-gray-800/30">
            <span className="text-gray-600 w-5 text-right flex-shrink-0">{i + 1}.</span>
            <span className="flex-1 text-gray-300 ml-1.5 truncate">{p.name}</span>
            {/* หุ้น */}
            <span className="w-16 text-right flex-shrink-0" style={{ color: p.stockProfit > 0 ? '#22c55e' : p.stockProfit < 0 ? '#ef4444' : '#555', fontSize: '10px' }}>
              {p.stockProfit > 0 ? '+' : p.stockProfit < 0 ? '-' : ''}{p.stockProfit !== 0 ? `฿${Math.abs(p.stockProfit).toLocaleString()}` : '—'}
            </span>
            {/* การ์ด */}
            <span className="w-16 text-right flex-shrink-0" style={{ color: p.chanceProfit > 0 ? '#22c55e' : p.chanceProfit < 0 ? '#ef4444' : '#555', fontSize: '10px' }}>
              {p.chanceProfit > 0 ? '+' : p.chanceProfit < 0 ? '-' : ''}{p.chanceProfit !== 0 ? `฿${Math.abs(p.chanceProfit).toLocaleString()}` : '—'}
            </span>
            {/* รวม */}
            <span className="w-16 text-right font-bold flex-shrink-0" style={{ color: p.profit > 0 ? '#22c55e' : p.profit < 0 ? '#ef4444' : '#666' }}>
              {p.profit > 0 ? '+' : p.profit < 0 ? '-' : ''}{p.profit !== 0 ? `฿${Math.abs(p.profit).toLocaleString()}` : '฿0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
