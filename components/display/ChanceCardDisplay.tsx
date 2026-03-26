// FILE: components/display/ChanceCardDisplay.tsx — Chance Card Display (16:9 projector)
// VERSION: B13-BATCH2-v1 — New component replacing FightDisplay
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B13 created (replacing B9 FightDisplay)
'use client';

interface ChanceCardDisplayProps {
  players: any[];
  round: number;
}

export default function ChanceCardDisplay({ players, round }: ChanceCardDisplayProps) {
  const openedCount = players.filter(p => (p.duel_submitted_round || 0) >= round).length;
  const waitingCount = players.length - openedCount;

  // คำนวณ summary จากคนที่เปิดแล้ว
  const openedPlayers = players.filter(p => (p.duel_submitted_round || 0) >= round);
  const positiveCount = openedPlayers.filter(p => (parseFloat(p.duel_money_change) || 0) > 0).length;
  const negativeCount = openedPlayers.filter(p => (parseFloat(p.duel_money_change) || 0) < 0).length;
  const zeroCount = openedPlayers.filter(p => (parseFloat(p.duel_money_change) || 0) === 0).length;
  const totalChange = openedPlayers.reduce((sum, p) => sum + (parseFloat(p.duel_money_change) || 0), 0);

  // Top 3 โชคดี + โชคร้าย
  const sortedByAmount = openedPlayers
    .map(p => ({ name: p.name, amount: parseFloat(p.duel_money_change) || 0 }))
    .sort((a, b) => b.amount - a.amount);
  const topLucky = sortedByAmount.filter(p => p.amount > 0).slice(0, 3);
  const topUnlucky = sortedByAmount.filter(p => p.amount < 0).slice(-3).reverse();

  // === ยังไม่มีใครเปิด: แสดง counter ===
  if (openedCount === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-7xl mb-3">🃏</p>
          <p className="text-2xl font-bold text-[#F59E0B] mb-4">เปิดการ์ดโชคชะตา!</p>
          <div className="flex gap-6 justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold font-mono" style={{ color: '#00FFB2' }}>{openedCount}</p>
              <p className="text-xs text-gray-400">เปิดแล้ว</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold font-mono text-gray-500">{waitingCount}</p>
              <p className="text-xs text-gray-400">รอเปิด</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-6">กดเปิดการ์ดบนมือถือเลย!</p>
        </div>
      </div>
    );
  }

  // === มีคนเปิดแล้ว: แสดง summary ===
  return (
    <div className="w-full h-full flex items-center justify-center px-8">
      <div className="flex gap-8 items-start">

        {/* Left: Stats */}
        <div className="flex flex-col items-center gap-4">
          {/* Counter */}
          <div className="text-center mb-2">
            <p className="text-xs tracking-[3px] text-[#F59E0B] mb-1">CHANCE CARD</p>
            <p className="text-3xl font-bold font-mono" style={{ color: '#00FFB2' }}>{openedCount}/{players.length}</p>
            <p className="text-[10px] text-gray-500">เปิดแล้ว</p>
          </div>

          {/* Positive / Negative / Zero */}
          <div className="flex gap-3">
            <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(0,255,178,0.08)', border: '1px solid rgba(0,255,178,0.2)' }}>
              <p className="text-3xl font-bold" style={{ color: '#00FFB2' }}>{positiveCount}</p>
              <p className="text-[10px] text-gray-400">ได้เงิน</p>
            </div>
            <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-3xl font-bold" style={{ color: '#EF4444' }}>{negativeCount}</p>
              <p className="text-[10px] text-gray-400">เสียเงิน</p>
            </div>
            {zeroCount > 0 && (
              <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-3xl font-bold text-gray-400">{zeroCount}</p>
                <p className="text-[10px] text-gray-400">฿0</p>
              </div>
            )}
          </div>

          {/* Total change */}
          <div className="text-center rounded-lg px-4 py-2" style={{ background: 'rgba(245,158,11,0.08)' }}>
            <p className="text-xs text-gray-500 mb-0.5">เงินหมุนเวียนรอบนี้</p>
            <p className="text-lg font-bold" style={{ color: totalChange >= 0 ? '#00FFB2' : '#EF4444' }}>
              {totalChange >= 0 ? '+' : '-'}฿{Math.abs(totalChange).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Divider */}
        {(topLucky.length > 0 || topUnlucky.length > 0) && (
          <div className="w-px h-48 self-center" style={{ background: 'rgba(255,255,255,0.1)' }} />
        )}

        {/* Right: Top Lucky / Unlucky */}
        {(topLucky.length > 0 || topUnlucky.length > 0) && (
          <div className="flex flex-col gap-4">
            {/* Top Lucky */}
            {topLucky.length > 0 && (
              <div>
                <p className="text-[10px] tracking-wider text-gray-500 mb-2">🍀 โชคดี</p>
                <div className="space-y-1.5">
                  {topLucky.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 rounded-lg px-3 py-1.5" style={{ background: 'rgba(0,255,178,0.06)' }}>
                      <span className="text-sm text-gray-300">{p.name}</span>
                      <span className="text-sm font-bold" style={{ color: '#00FFB2' }}>+฿{p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Unlucky */}
            {topUnlucky.length > 0 && (
              <div>
                <p className="text-[10px] tracking-wider text-gray-500 mb-2">😢 โชคร้าย</p>
                <div className="space-y-1.5">
                  {topUnlucky.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 rounded-lg px-3 py-1.5" style={{ background: 'rgba(239,68,68,0.06)' }}>
                      <span className="text-sm text-gray-300">{p.name}</span>
                      <span className="text-sm font-bold" style={{ color: '#EF4444' }}>-฿{Math.abs(p.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
