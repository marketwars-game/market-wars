// FILE: components/player/ResultsPanel.tsx
// ✅ B5: แสดงผลตอบแทนรอบนี้บนมือถือเด็ก — detailed breakdown ทุกบริษัท
'use client';

import { COMPANIES, RETURN_TABLE } from '@/lib/constants';

interface ResultsPanelProps {
  round: number;
  player: any; // player object from Supabase
}

export default function ResultsPanel({ round, player }: ResultsPanelProps) {
  const roundReturns = player.round_returns?.[String(round)];
  const money = parseFloat(player.money) || 0;

  // ถ้ายังไม่ได้คำนวณ (auto-calculate อาจยังไม่เสร็จ)
  if (!roundReturns) {
    return (
      <div className="bg-[#161b22] rounded-lg p-6 text-center">
        <div className="text-3xl mb-2">📊</div>
        <p className="text-gray-400">Calculating your returns...</p>
        <div className="mt-3 w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const { money_before, money_after, total_return, returns, portfolio_used } = roundReturns;
  const isProfit = total_return >= 0;
  const roundIndex = round - 1;

  // สร้างรายการบริษัทที่ลงทุน (เรียงตาม return มากไปน้อย)
  const investedCompanies = COMPANIES
    .filter((c) => (parseFloat(portfolio_used?.[c.id]) || 0) > 0)
    .map((c) => ({
      ...c,
      allocation: parseFloat(portfolio_used?.[c.id]) || 0,
      returnAmount: returns?.[c.id] || 0,
      returnPct: RETURN_TABLE[c.id]?.[roundIndex] || 0,
    }))
    .sort((a, b) => b.returnAmount - a.returnAmount);

  // คำนวณ cash %
  const totalAllocated = investedCompanies.reduce((sum, c) => sum + c.allocation, 0);
  const cashPct = 100 - totalAllocated;

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-3">
        <span className="text-xs tracking-widest" style={{ color: '#00D4FF' }}>
          ROUND {round} RESULTS
        </span>
      </div>

      {/* Total Return Card */}
      <div className="bg-[#161b22] rounded-lg p-4 text-center mb-3">
        <div className="text-xs text-gray-500 mb-1">Your portfolio return</div>
        <div
          className="text-3xl font-bold"
          style={{ color: isProfit ? '#22c55e' : '#ef4444' }}
        >
          {isProfit ? '+' : '-'}฿{Math.abs(total_return).toLocaleString()}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          ฿{Math.round(money_before).toLocaleString()} → ฿{Math.round(money_after).toLocaleString()}
        </div>
      </div>

      {/* Breakdown Header */}
      {investedCompanies.length > 0 && (
        <div className="text-xs tracking-widest text-gray-600 mb-2 px-1">BREAKDOWN</div>
      )}

      {/* Company Breakdown */}
      <div className="space-y-1.5">
        {investedCompanies.map((c) => {
          const isCompanyProfit = c.returnAmount >= 0;
          return (
            <div
              key={c.id}
              className="bg-[#161b22] rounded-lg px-3 py-2.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-sm text-gray-300">{c.name}</span>
                <span className="text-xs text-gray-600">{c.allocation}%</span>
              </div>
              <div className="text-right">
                <div
                  className="text-sm font-bold"
                  style={{ color: isCompanyProfit ? '#22c55e' : '#ef4444' }}
                >
                  {isCompanyProfit ? '+' : '-'}฿{Math.abs(c.returnAmount).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">
                  {c.returnPct > 0 ? '+' : ''}{c.returnPct}%
                </div>
              </div>
            </div>
          );
        })}

        {/* Cash row */}
        {cashPct > 0 && (
          <div className="bg-[#161b22] rounded-lg px-3 py-2.5 flex items-center justify-between opacity-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-gray-600" />
              <span className="text-sm text-gray-400">Cash</span>
              <span className="text-xs text-gray-600">{cashPct}%</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">฿0</div>
              <div className="text-xs text-gray-600">0%</div>
            </div>
          </div>
        )}

        {/* ไม่ได้ลงทุนเลย */}
        {investedCompanies.length === 0 && (
          <div className="bg-[#161b22] rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm">You didn&apos;t invest this round</p>
            <p className="text-gray-600 text-xs mt-1">Cash earns 0% return</p>
          </div>
        )}
      </div>

      {/* Portfolio Bar */}
      {investedCompanies.length > 0 && (
        <div className="mt-3 h-1.5 rounded-full overflow-hidden flex" style={{ backgroundColor: '#2a2d35' }}>
          {investedCompanies.map((c) => (
            <div
              key={c.id}
              style={{
                width: `${c.allocation}%`,
                backgroundColor: c.color,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
