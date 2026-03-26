// FILE: components/display/LeaderboardDisplay.tsx — Display Leaderboard
// VERSION: B12-UX-v5 — Fix movement calculation + podium with arrows
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B6 created | B8R extracted | B12-UX layout | v2-v4 podium fixes | v5 fix movement calc
'use client';

interface LeaderboardDisplayProps {
  players: any[];
  round: number;
}

export default function LeaderboardDisplay({ players, round }: LeaderboardDisplayProps) {
  const sorted = [...players].sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0));
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3, 10);

  // ✅ Fix: คำนวณ prevRank เหมือน MC — ใช้ money_before ของรอบปัจจุบัน
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
  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const podiumBg = ['rgba(255,215,0,0.1)', 'rgba(192,192,192,0.08)', 'rgba(205,127,50,0.08)'];
  const podiumTextColors = ['#FCD34D', '#D1D5DB', '#FBBF24'];
  const podiumHeights = ['150px', '120px', '100px'];
  const podiumWidths = ['170px', '150px', '150px'];

  // ✅ Fix: คำนวณ movement เหมือน MC — ใช้ (prevRank || currentRank) - currentRank
  const getMovement = (playerId: string, currentRank: number) => {
    if (round <= 1) return 0;
    return (prevRankMap[playerId] || currentRank) - currentRank;
  };

  // Movement badge
  const MovementBadge = ({ movement, size = 'sm' }: { movement: number; size?: 'sm' | 'md' }) => {
    if (round <= 1) return null;
    const isUp = movement > 0;
    const isDown = movement < 0;
    const textSize = size === 'md' ? 'text-xs' : 'text-[9px]';
    const padding = size === 'md' ? 'px-2 py-0.5' : 'px-1 py-0.5';

    if (movement === 0) {
      return <span className={`${textSize} ${padding} text-gray-600`}>—</span>;
    }

    return (
      <span className={`${textSize} ${padding} rounded-full font-bold`} style={{
        background: isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        color: isUp ? '#22c55e' : '#ef4444',
      }}>
        {isUp ? `↑${movement}` : `↓${Math.abs(movement)}`}
      </span>
    );
  };

  // Podium order for display: 2nd, 1st, 3rd
  const podiumOrder = [1, 0, 2];

  return (
    <div className="w-full h-full flex flex-col items-center pt-4 px-6 overflow-hidden">
      <style>{`@keyframes podiumReveal { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } .podium-anim { opacity: 0; animation: podiumReveal 0.5s ease-out forwards; } @keyframes rankReveal { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } } .rank-anim { opacity: 0; animation: rankReveal 0.3s ease-out forwards; }`}</style>

      {/* === Podium === */}
      <div className="flex items-end gap-4 mb-5 mt-2">
        {podiumOrder.map((idx) => {
          const p = top3[idx];
          if (!p) return null;
          const rank = idx + 1; // 1st=1, 2nd=2, 3rd=3
          const money = parseFloat(p.money) || 0;
          const movement = getMovement(p.id, rank);
          const delays = ['0.3s', '0.6s', '0.9s'];
          return (
            <div
              key={p.id}
              className="podium-anim text-center rounded-t-xl px-4 pt-3 pb-3 flex flex-col justify-end"
              style={{
                animationDelay: delays[idx],
                background: podiumBg[idx],
                height: podiumHeights[idx],
                minWidth: podiumWidths[idx],
                borderTop: `3px solid ${podiumColors[idx]}`,
              }}
            >
              <p className={`${idx === 0 ? 'text-3xl' : 'text-2xl'} mb-1`}>{medals[idx]}</p>
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <p className={`${idx === 0 ? 'text-lg' : 'text-base'} font-bold`} style={{ color: podiumTextColors[idx] }}>{p.name}</p>
                <MovementBadge movement={movement} size="md" />
              </div>
              <p className={`${idx === 0 ? 'text-base' : 'text-sm'} text-gray-400`}>฿{money.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* === Rest ranking — compact pills === */}
      {rest.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
          {rest.map((p, i) => {
            const rank = i + 4;
            const money = parseFloat(p.money) || 0;
            const movement = getMovement(p.id, rank);
            return (
              <div
                key={p.id}
                className="rank-anim flex items-center gap-2 rounded-lg px-3 py-1.5"
                style={{ animationDelay: `${1.2 + i * 0.15}s`, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-xs text-gray-500 font-bold">#{rank}</span>
                <span className="text-sm text-gray-300">{p.name}</span>
                <MovementBadge movement={movement} size="sm" />
                <span className="text-xs font-mono text-gray-500">฿{money.toLocaleString()}</span>
              </div>
            );
          })}
          {sorted.length > 10 && (
            <span className="text-[10px] text-gray-600 self-center">+{sorted.length - 10} more</span>
          )}
        </div>
      )}
    </div>
  );
}
