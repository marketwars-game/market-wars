// FILE: components/display/FinalDisplay.tsx — Display Final Phase
// VERSION: B11-v1 — Awards section added (Quiz Master + Smart Diversifier)
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B7 created (podium + stats) | B8R extracted to component | B11 awards section

import { STARTING_MONEY } from '@/lib/constants';
import { calculateAwards } from '@/lib/awards';

interface FinalDisplayProps {
  players: any[];
}

export default function FinalDisplay({ players }: FinalDisplayProps) {
  const sorted = [...players].sort(
    (a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0)
  );
  const top3 = sorted.slice(0, 3);

  // Game stats
  const totalPlayers = players.length;
  const avgReturn =
    totalPlayers > 0
      ? players.reduce((sum, p) => {
          const m = parseFloat(p.money) || STARTING_MONEY;
          return sum + ((m - STARTING_MONEY) / STARTING_MONEY) * 100;
        }, 0) / totalPlayers
      : 0;
  const profitCount = players.filter(
    (p) => (parseFloat(p.money) || 0) > STARTING_MONEY
  ).length;
  const lossCount = players.filter(
    (p) => (parseFloat(p.money) || 0) < STARTING_MONEY
  ).length;

  // Awards
  const awards = calculateAwards(players);

  // Podium config
  const podiumConfig = [
    {
      height: 120,
      medal: '🥇',
      gradient: 'from-yellow-900/40 to-yellow-700/20',
      border: '#F59E0B',
      textColor: '#FCD34D',
    },
    {
      height: 90,
      medal: '🥈',
      gradient: 'from-gray-700/40 to-gray-500/20',
      border: '#9CA3AF',
      textColor: '#D1D5DB',
    },
    {
      height: 70,
      medal: '🥉',
      gradient: 'from-orange-900/40 to-orange-700/20',
      border: '#D97706',
      textColor: '#FBBF24',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8">
      {/* Trophy + Title */}
      <div
        className="text-center mb-6"
        style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '0.2s' }}
      >
        <div className="text-6xl mb-2">🏆</div>
        <h1 className="text-4xl font-black" style={{ color: '#FCD34D' }}>
          Game Over!
        </h1>
        <p className="text-gray-500 text-lg mt-1">6 rounds completed</p>
      </div>

      {/* Top 3 Podium */}
      <div
        className="flex items-end justify-center gap-6 mb-8"
        style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '0.8s' }}
      >
        {top3.map((p, i) => {
          const cfg = podiumConfig[i];
          const money = parseFloat(p.money) || STARTING_MONEY;
          const pct = ((money - STARTING_MONEY) / STARTING_MONEY) * 100;
          return (
            <div key={p.id} className="flex flex-col items-center">
              <span className="text-3xl mb-1">{cfg.medal}</span>
              <span className="text-lg font-bold text-gray-200 mb-1">{p.name}</span>
              <div
                className={`w-32 rounded-t-lg bg-gradient-to-t ${cfg.gradient} flex flex-col items-center justify-end pb-3`}
                style={{
                  height: `${cfg.height}px`,
                  borderLeft: `3px solid ${cfg.border}`,
                  borderRight: `3px solid ${cfg.border}`,
                  borderTop: `3px solid ${cfg.border}`,
                }}
              >
                <span className="text-lg font-bold text-white">
                  ฿{money.toLocaleString()}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: pct >= 0 ? '#22c55e' : '#ef4444' }}
                >
                  {pct >= 0 ? '+' : ''}
                  {pct.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Game Stats */}
      <div
        className="flex gap-6 mb-8"
        style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '1.4s' }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#00D4FF' }}>
            {totalPlayers}
          </div>
          <div className="text-xs text-gray-500">Players</div>
        </div>
        <div className="text-center">
          <div
            className="text-2xl font-bold"
            style={{ color: avgReturn >= 0 ? '#22c55e' : '#ef4444' }}
          >
            {avgReturn >= 0 ? '+' : ''}
            {avgReturn.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Avg return</div>
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold" style={{ color: '#22c55e' }}>
            {profitCount}
          </span>
          <span className="text-xl text-gray-600 mx-1">/</span>
          <span className="text-2xl font-bold" style={{ color: '#ef4444' }}>
            {lossCount}
          </span>
          <div className="text-xs text-gray-500">Profit / Loss</div>
        </div>
      </div>

      {/* === B11: Awards Section === */}
      <div
        className="w-full max-w-xl mb-8"
        style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '2.0s' }}
      >
        <div className="text-center mb-4">
          <span className="text-xs tracking-widest text-gray-500">SPECIAL AWARDS</span>
        </div>
        <div className="space-y-3">
          {awards.map((award, i) => (
            <div
              key={award.id}
              className="bg-[#161b22] rounded-lg px-5 py-4 flex items-center justify-between border border-gray-800"
              style={{
                animation: 'fadeSlideUp 0.5s ease-out both',
                animationDelay: `${2.4 + i * 0.5}s`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{award.emoji}</span>
                <div>
                  <div className="text-sm font-bold text-gray-300">{award.name}</div>
                  <div className="text-lg font-bold" style={{ color: '#FCD34D' }}>
                    {award.winnerName}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold" style={{ color: '#00D4FF' }}>
                  {award.stat}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thank you */}
      <div
        className="text-center"
        style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '3.4s' }}
      >
        <p className="text-lg font-semibold" style={{ color: '#00FFB2' }}>
          Thank you for playing Market Wars!
        </p>
        <p className="text-sm text-gray-600 mt-1">Powered by Dime! Kids Camp</p>
      </div>

      {/* CSS animation */}
      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
