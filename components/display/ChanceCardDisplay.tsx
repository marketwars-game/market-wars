// FILE: components/display/ChanceCardDisplay.tsx — Chance Card Display (16:9 projector)
// VERSION: B15-v2 — ขยาย content เต็มพื้นที่ projector, font ใหญ่ขึ้น
// LAST MODIFIED: 27 Mar 2026
// HISTORY: B13 created (replacing B9 FightDisplay) | B15-v1 projector polish | B15-v2 expand full area
'use client';

interface ChanceCardDisplayProps {
  players: any[];
  round: number;
}

export default function ChanceCardDisplay({ players, round }: ChanceCardDisplayProps) {
  const openedCount = players.filter(p => (p.duel_submitted_round || 0) >= round).length;
  const waitingCount = players.length - openedCount;

  const openedPlayers = players.filter(p => (p.duel_submitted_round || 0) >= round);
  const positiveCount = openedPlayers.filter(p => (parseFloat(p.duel_money_change) || 0) > 0).length;
  const negativeCount = openedPlayers.filter(p => (parseFloat(p.duel_money_change) || 0) < 0).length;
  const zeroCount = openedPlayers.filter(p => (parseFloat(p.duel_money_change) || 0) === 0).length;
  const totalChange = openedPlayers.reduce((sum, p) => sum + (parseFloat(p.duel_money_change) || 0), 0);

  const sortedByAmount = openedPlayers
    .map(p => ({ name: p.name, amount: parseFloat(p.duel_money_change) || 0 }))
    .sort((a, b) => b.amount - a.amount);
  const topLucky = sortedByAmount.filter(p => p.amount > 0).slice(0, 5);
  const topUnlucky = sortedByAmount.filter(p => p.amount < 0).slice(-5).reverse();

  // === ยังไม่มีใครเปิด ===
  if (openedCount === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-9xl mb-6">🃏</p>
          <p className="text-4xl font-bold text-[#F59E0B] mb-8">เปิดการ์ดโชคชะตา!</p>
          <div className="flex gap-12 justify-center">
            <div className="text-center">
              <p className="text-7xl font-bold font-mono" style={{ color: '#00FFB2' }}>{openedCount}</p>
              <p className="text-xl mt-3" style={{ color: 'rgba(255,255,255,0.75)' }}>เปิดแล้ว</p>
            </div>
            <div className="text-center">
              <p className="text-7xl font-bold font-mono" style={{ color: 'rgba(255,255,255,0.65)' }}>{waitingCount}</p>
              <p className="text-xl mt-3" style={{ color: 'rgba(255,255,255,0.75)' }}>รอเปิด</p>
            </div>
          </div>
          <p className="text-2xl mt-10" style={{ color: 'rgba(255,255,255,0.65)' }}>กดเปิดการ์ดบนมือถือเลย!</p>
        </div>
      </div>
    );
  }

  // === มีคนเปิดแล้ว ===
  return (
    <div className="w-full h-full flex items-center justify-center px-8">
      <div className="flex gap-12 items-start w-full max-w-4xl">

        {/* Left: Stats */}
        <div className="flex flex-col items-center gap-6 flex-shrink-0">
          {/* Counter */}
          <div className="text-center">
            <p className="text-base tracking-[4px] text-[#F59E0B] mb-2 font-bold">CHANCE CARD</p>
            <p className="text-6xl font-bold font-mono" style={{ color: '#00FFB2' }}>{openedCount}/{players.length}</p>
            <p className="text-lg mt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>เปิดแล้ว</p>
          </div>

          {/* Positive / Negative / Zero */}
          <div className="flex gap-4">
            <div className="text-center px-6 py-5 rounded-2xl" style={{ background: 'rgba(0,255,178,0.08)', border: '1px solid rgba(0,255,178,0.2)' }}>
              <p className="text-5xl font-bold" style={{ color: '#00FFB2' }}>{positiveCount}</p>
              <p className="text-lg mt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>ได้เงิน</p>
            </div>
            <div className="text-center px-6 py-5 rounded-2xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-5xl font-bold" style={{ color: '#EF4444' }}>{negativeCount}</p>
              <p className="text-lg mt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>เสียเงิน</p>
            </div>
            {zeroCount > 0 && (
              <div className="text-center px-6 py-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <p className="text-5xl font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>{zeroCount}</p>
                <p className="text-lg mt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>฿0</p>
              </div>
            )}
          </div>

          {/* Total change */}
          <div className="text-center rounded-2xl px-8 py-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-lg mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>เงินหมุนเวียนรอบนี้</p>
            <p className="text-3xl font-bold" style={{ color: totalChange >= 0 ? '#00FFB2' : '#EF4444' }}>
              {totalChange >= 0 ? '+' : '-'}฿{Math.abs(totalChange).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Divider */}
        {(topLucky.length > 0 || topUnlucky.length > 0) && (
          <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.12)' }} />
        )}

        {/* Right: Lucky / Unlucky lists */}
        {(topLucky.length > 0 || topUnlucky.length > 0) && (
          <div className="flex gap-8 flex-1">
            {topLucky.length > 0 && (
              <div className="flex-1">
                <p className="text-lg font-bold tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>🍀 โชคดี</p>
                <div className="space-y-2.5">
                  {topLucky.map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl px-5 py-3" style={{ background: 'rgba(0,255,178,0.06)' }}>
                      <span className="text-xl" style={{ color: 'rgba(255,255,255,0.9)' }}>{p.name}</span>
                      <span className="text-xl font-bold" style={{ color: '#00FFB2' }}>+฿{p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {topUnlucky.length > 0 && (
              <div className="flex-1">
                <p className="text-lg font-bold tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>😢 โชคร้าย</p>
                <div className="space-y-2.5">
                  {topUnlucky.map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl px-5 py-3" style={{ background: 'rgba(239,68,68,0.06)' }}>
                      <span className="text-xl" style={{ color: 'rgba(255,255,255,0.9)' }}>{p.name}</span>
                      <span className="text-xl font-bold" style={{ color: '#EF4444' }}>-฿{Math.abs(p.amount).toLocaleString()}</span>
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
