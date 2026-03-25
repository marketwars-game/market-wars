// FILE: components/mc/ResultsMC.tsx — MC Results Summary + Player List
// VERSION: B8R-v1 — Extracted from mc/[roomId]/page.tsx
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B5 created (inline) | B7 added player list | B8R extracted to component
'use client';

interface ResultsMCProps {
  round: number;
  players: any[];
}

export default function ResultsMC({ round, players }: ResultsMCProps) {
  const playerResults = players.map((p) => ({ id: p.id, name: p.name, profit: p.round_returns?.[String(round)]?.total_return || 0 })).sort((a, b) => b.profit - a.profit);
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
      <div className="max-h-48 overflow-y-auto space-y-0.5">
        {playerResults.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between text-xs py-1 px-1 border-b border-gray-800/30">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 w-5 text-right">{i + 1}.</span>
              <span className="text-gray-300">{p.name}</span>
            </div>
            <span className="font-bold" style={{ color: p.profit > 0 ? '#22c55e' : p.profit < 0 ? '#ef4444' : '#666' }}>
              {p.profit > 0 ? '+' : p.profit < 0 ? '-' : ''}{p.profit !== 0 ? `฿${Math.abs(p.profit).toLocaleString()}` : '฿0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
