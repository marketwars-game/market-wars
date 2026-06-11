// FILE: components/display/ResultsDisplay.tsx — Display results phase (sector returns + top earners)
// VERSION: B16a-v1 — extracted from display/page.tsx (refactor shell, no behavior change)
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16a-BATCH0 extracted inline results block from display/page.tsx
'use client';

import { COMPANIES, RETURN_TABLE } from '@/lib/constants';

export default function ResultsDisplay({ players, round }: { players: any[]; round: number }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {COMPANIES.map((c) => {
          const returnPct = RETURN_TABLE[c.id]?.[round - 1] || 0;
          const isP = returnPct >= 0;
          return (
            <div key={c.id} className="bg-[#161b22] rounded-full px-4 py-2 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>{c.name}</span>
              <span className="text-lg font-bold" style={{ color: isP ? '#22c55e' : '#ef4444' }}>{isP ? '+' : ''}{returnPct}%</span>
            </div>
          );
        })}
      </div>
      <div className="text-sm tracking-widest text-center mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>TOP EARNERS THIS ROUND</div>
      <div className="space-y-2">
        {(() => {
          const earners = players.map((p) => {
            const stockProfit = p.round_returns?.[String(round)]?.total_return || 0;
            const hasChance = ((p.duel_submitted_round || 0) >= round);
            const chanceProfit = hasChance ? (parseFloat(p.duel_money_change) || 0) : 0;
            return { id: p.id, name: p.name, profit: stockProfit + chanceProfit, stockProfit, chanceProfit };
          }).sort((a, b) => b.profit - a.profit).slice(0, 3);
          const medals = ['🥇', '🥈', '🥉'];
          return earners.map((p, i) => (
            <div key={p.id} className="bg-[#161b22] rounded-xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{medals[i]}</span>
                <span className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{p.name}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold" style={{ color: p.profit >= 0 ? '#22c55e' : '#ef4444' }}>
                  {p.profit >= 0 ? '+' : '-'}฿{Math.abs(p.profit).toLocaleString()}
                </span>
                <div className="flex items-center justify-end gap-3 mt-1">
                  <span className="text-sm" style={{ color: p.stockProfit >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)' }}>📈{p.stockProfit >= 0 ? '+' : '-'}฿{Math.abs(p.stockProfit).toLocaleString()}</span>
                  {p.chanceProfit !== 0 && <span className="text-sm" style={{ color: p.chanceProfit > 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)' }}>🃏{p.chanceProfit > 0 ? '+' : '-'}฿{Math.abs(p.chanceProfit).toLocaleString()}</span>}
                </div>
              </div>
            </div>
          ));
        })()}
      </div>
      <p className="text-base text-center mt-4" style={{ color: 'rgba(255,255,255,0.65)' }}>Check your phone for personal results!</p>
    </div>
  );
}
