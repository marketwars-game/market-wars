// FILE: components/display/FinalDisplay.tsx — Display Final Podium + Stats
// VERSION: B8R-v1 — Extracted from display/[roomId]/page.tsx
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B7 created (inline) | B8R extracted to component
'use client';

import { STARTING_MONEY, TOTAL_ROUNDS } from '@/lib/constants';

interface FinalDisplayProps {
  players: any[];
}

export default function FinalDisplay({ players }: FinalDisplayProps) {
  const sorted = [...players].sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0));
  const top3 = sorted.slice(0, 3);
  const totalPlayers = sorted.length;
  const avgReturn = totalPlayers > 0 ? sorted.reduce((sum, p) => { const money = parseFloat(p.money) || 0; return sum + ((money - STARTING_MONEY) / STARTING_MONEY) * 100; }, 0) / totalPlayers : 0;
  const profitCount = sorted.filter(p => (parseFloat(p.money) || 0) > STARTING_MONEY).length;
  const lossCount = sorted.filter(p => (parseFloat(p.money) || 0) < STARTING_MONEY).length;
  const podiumData = [
    { index: 1, medal: '🥈', color: '#C0C0C0', size: 'normal' },
    { index: 0, medal: '🥇', color: '#FFD700', size: 'large' },
    { index: 2, medal: '🥉', color: '#CD7F32', size: 'normal' },
  ];

  return (
    <div className="text-center w-full max-w-2xl">
      <style>{`@keyframes finalReveal { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .final-item { opacity: 0; animation: finalReveal 0.5s ease-out forwards; }`}</style>

      {/* Title */}
      <div className="final-item" style={{ animationDelay: '0.2s' }}>
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="text-5xl font-bold text-[#FFD700] mb-1">Game Over!</h2>
        <p className="text-lg text-gray-400 mb-8">{TOTAL_ROUNDS} rounds completed</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 mb-8 final-item" style={{ animationDelay: '0.8s' }}>
        {podiumData.map((pod) => {
          const p = top3[pod.index];
          if (!p) return null;
          const money = parseFloat(p.money) || 0;
          const returnPct = ((money - STARTING_MONEY) / STARTING_MONEY) * 100;
          const isLarge = pod.size === 'large';
          return (
            <div key={p.id} className="text-center" style={{ width: isLarge ? '160px' : '140px' }}>
              <div className={`${isLarge ? 'text-4xl' : 'text-3xl'} mb-1`}>{pod.medal}</div>
              <div className="rounded-t-lg flex flex-col items-center justify-center" style={{
                background: `linear-gradient(180deg, ${pod.color}, ${pod.color}88)`,
                padding: isLarge ? '20px 8px 16px' : '14px 8px 12px',
                minHeight: isLarge ? '120px' : pod.index === 1 ? '90px' : '70px',
              }}>
                <p className={`${isLarge ? 'text-lg' : 'text-base'} font-bold text-white`}>{p.name}</p>
                <p className={`${isLarge ? 'text-xl' : 'text-lg'} font-bold text-white mt-1`}>฿{money.toLocaleString()}</p>
                <p className="text-xs text-white/70 mt-0.5">{returnPct >= 0 ? '+' : ''}{returnPct.toFixed(1)}%</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 final-item" style={{ animationDelay: '1.4s' }}>
        <div className="bg-[#161b22] rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Players</p>
          <p className="text-2xl font-bold text-[#00D4FF]">{totalPlayers}</p>
        </div>
        <div className="bg-[#161b22] rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Avg return</p>
          <p className="text-2xl font-bold" style={{ color: avgReturn >= 0 ? '#00FFB2' : '#FF4444' }}>{avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%</p>
        </div>
        <div className="bg-[#161b22] rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Profit / Loss</p>
          <div className="flex justify-center items-baseline gap-1">
            <span className="text-xl font-bold text-[#00FFB2]">{profitCount}</span>
            <span className="text-gray-600">/</span>
            <span className="text-xl font-bold text-[#FF4444]">{lossCount}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="final-item" style={{ animationDelay: '1.8s' }}>
        <div className="bg-[#161b22] rounded-lg py-4 px-6">
          <p className="text-base" style={{ color: '#00FFB2' }}>Thank you for playing Market Wars!</p>
          <p className="text-xs mt-1" style={{ color: '#8b949e' }}>Powered by Dime! Kids Camp</p>
        </div>
      </div>
    </div>
  );
}
