// FILE: components/display/LeaderboardDisplay.tsx — Display Leaderboard
// VERSION: B15-v1 — Projector Polish: font scale up, dim colors → rgba(255,255,255,0.75)
// LAST MODIFIED: 27 Mar 2026
// HISTORY: B6 created | B8R extracted | B12-UX layout | v2-v4 podium fixes | v5 fix movement calc | B15 projector polish
'use client';

interface LeaderboardDisplayProps {
  players: any[];
  round: number;
}

export default function LeaderboardDisplay({ players, round }: LeaderboardDisplayProps) {
  const sorted = [...players].sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0));
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3, 10);

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
  const podiumHeights = ['180px', '145px', '120px'];
  const podiumWidths = ['200px', '175px', '175px'];

  const getMovement = (playerId: string, currentRank: number) => {
    if (round <= 1) return 0;
    return (prevRankMap[playerId] || currentRank) - currentRank;
  };

  const MovementBadge = ({ movement, size = 'sm' }: { movement: number; size?: 'sm' | 'md' }) => {
    if (round <= 1) return null;
    const isUp = movement > 0;
    const isDown = movement < 0;
    const textSize = size === 'md' ? 'text-sm' : 'text-xs';
    const padding = size === 'md' ? 'px-2.5 py-0.5' : 'px-1.5 py-0.5';

    if (movement === 0) {
      return <span className={`${textSize} ${padding}`} style={{ color: 'rgba(255,255,255,0.45)' }}>—</span>;
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

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [1, 0, 2];

  return (
    <div className="w-full h-full flex flex-col items-center pt-4 px-6 overflow-hidden">
      <style>{`@keyframes podiumReveal { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } .podium-anim { opacity: 0; animation: podiumReveal 0.5s ease-out forwards; } @keyframes rankReveal { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } } .rank-anim { opacity: 0; animation: rankReveal 0.3s ease-out forwards; }`}</style>

      {/* === Podium === */}
      <div className="flex items-end gap-5 mb-6 mt-2">
        {podiumOrder.map((idx) => {
          const p = top3[idx];
          if (!p) return null;
          const rank = idx + 1;
          const money = parseFloat(p.money) || 0;
          const movement = getMovement(p.id, rank);
          const delays = ['0.3s', '0.6s', '0.9s'];
          return (
            <div
              key={p.id}
              className="podium-anim text-center rounded-t-xl px-5 pt-4 pb-4 flex flex-col justify-end"
              style={{
                animationDelay: delays[idx],
                background: podiumBg[idx],
                height: podiumHeights[idx],
                minWidth: podiumWidths[idx],
                borderTop: `3px solid ${podiumColors[idx]}`,
              }}
            >
              <p className={`${idx === 0 ? 'text-4xl' : 'text-3xl'} mb-2`}>{medals[idx]}</p>
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className={`${idx === 0 ? 'text-xl' : 'text-lg'} font-bold truncate`} style={{ color: podiumTextColors[idx] }}>{p.name}</p>
                <MovementBadge movement={movement} size="md" />
              </div>
              <p className={`${idx === 0 ? 'text-lg' : 'text-base'}`} style={{ color: 'rgba(255,255,255,0.75)' }}>฿{money.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* === Rest ranking — compact pills === */}
      {rest.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center max-w-3xl">
          {rest.map((p, i) => {
            const rank = i + 4;
            const money = parseFloat(p.money) || 0;
            const movement = getMovement(p.id, rank);
            return (
              <div
                key={p.id}
                className="rank-anim flex items-center gap-3 rounded-xl px-4 py-2.5"
                style={{ animationDelay: `${1.2 + i * 0.15}s`, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.65)' }}>#{rank}</span>
                <span className="text-base" style={{ color: 'rgba(255,255,255,0.85)' }}>{p.name}</span>
                <MovementBadge movement={movement} size="sm" />
                <span className="text-base font-mono" style={{ color: 'rgba(255,255,255,0.65)' }}>฿{money.toLocaleString()}</span>
              </div>
            );
          })}
          {sorted.length > 10 && (
            <span className="text-sm self-center" style={{ color: 'rgba(255,255,255,0.65)' }}>+{sorted.length - 10} more</span>
          )}
        </div>
      )}
    </div>
  );
}
