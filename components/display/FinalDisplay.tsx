// FILE: components/display/FinalDisplay.tsx — Display Final Phase
// VERSION: B12-UX-v2 — Fix awards (array not object) + horizontal layout fit 100vh
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B7 created (podium + stats) | B8R extracted to component | B11 awards section | B12-UX horizontal layout | B12-UX-v2 fix awards array

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

  const totalPlayers = players.length;
  const avgReturn =
    totalPlayers > 0
      ? players.reduce((sum, p) => {
          const m = parseFloat(p.money) || STARTING_MONEY;
          return sum + ((m - STARTING_MONEY) / STARTING_MONEY) * 100;
        }, 0) / totalPlayers
      : 0;
  const profitCount = players.filter((p) => (parseFloat(p.money) || 0) > STARTING_MONEY).length;
  const lossCount = players.filter((p) => (parseFloat(p.money) || 0) < STARTING_MONEY).length;

  // ✅ Fix: calculateAwards returns Award[] — use .find() by id
  const awards = calculateAwards(players);
  const quizMaster = awards.find((a) => a.id === 'quiz_master');
  const smartDiversifier = awards.find((a) => a.id === 'smart_diversifier');

  const medals = ['🥇', '🥈', '🥉'];
  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const podiumBg = ['rgba(255,215,0,0.1)', 'rgba(192,192,192,0.08)', 'rgba(205,127,50,0.08)'];
  const podiumHeights = ['110px', '85px', '68px'];

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* === Row 1: Title === */}
      <div className="text-center mb-4" style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '0.2s' }}>
        <div className="text-4xl mb-1">🏆</div>
        <h1 className="text-3xl font-black" style={{ color: '#FCD34D' }}>Game Over!</h1>
        <p className="text-gray-500 text-sm">6 rounds completed</p>
      </div>

      {/* === Row 2: Podium === */}
      <div className="flex items-end gap-3 mb-4" style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '0.5s' }}>
        {top3[1] && (
          <div className="text-center rounded-t-lg px-4 pt-3 pb-2 flex flex-col justify-end" style={{ background: podiumBg[1], height: podiumHeights[1], width: '120px', borderTop: `2px solid ${podiumColors[1]}` }}>
            <p className="text-xl mb-0.5">{medals[1]}</p>
            <p className="text-sm font-bold truncate" style={{ color: '#D1D5DB' }}>{top3[1].name}</p>
            <p className="text-xs text-gray-400">฿{(parseFloat(top3[1].money) || 0).toLocaleString()}</p>
            <p className="text-[10px]" style={{ color: (parseFloat(top3[1].money) || 0) >= STARTING_MONEY ? '#22c55e' : '#ef4444' }}>
              {(((parseFloat(top3[1].money) || STARTING_MONEY) - STARTING_MONEY) / STARTING_MONEY * 100).toFixed(1)}%
            </p>
          </div>
        )}
        {top3[0] && (
          <div className="text-center rounded-t-lg px-4 pt-3 pb-2 flex flex-col justify-end" style={{ background: podiumBg[0], height: podiumHeights[0], width: '130px', borderTop: `2px solid ${podiumColors[0]}` }}>
            <p className="text-2xl mb-0.5">{medals[0]}</p>
            <p className="text-base font-bold truncate" style={{ color: '#FCD34D' }}>{top3[0].name}</p>
            <p className="text-sm text-gray-300">฿{(parseFloat(top3[0].money) || 0).toLocaleString()}</p>
            <p className="text-xs" style={{ color: (parseFloat(top3[0].money) || 0) >= STARTING_MONEY ? '#22c55e' : '#ef4444' }}>
              {(((parseFloat(top3[0].money) || STARTING_MONEY) - STARTING_MONEY) / STARTING_MONEY * 100).toFixed(1)}%
            </p>
          </div>
        )}
        {top3[2] && (
          <div className="text-center rounded-t-lg px-4 pt-3 pb-2 flex flex-col justify-end" style={{ background: podiumBg[2], height: podiumHeights[2], width: '120px', borderTop: `2px solid ${podiumColors[2]}` }}>
            <p className="text-xl mb-0.5">{medals[2]}</p>
            <p className="text-sm font-bold truncate" style={{ color: '#FBBF24' }}>{top3[2].name}</p>
            <p className="text-xs text-gray-400">฿{(parseFloat(top3[2].money) || 0).toLocaleString()}</p>
            <p className="text-[10px]" style={{ color: (parseFloat(top3[2].money) || 0) >= STARTING_MONEY ? '#22c55e' : '#ef4444' }}>
              {(((parseFloat(top3[2].money) || STARTING_MONEY) - STARTING_MONEY) / STARTING_MONEY * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* === Row 3: Stats + Awards === */}
      <div className="flex gap-3 items-stretch flex-wrap justify-center mb-3" style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '0.8s' }}>
        <div className="flex gap-2">
          <div className="rounded-lg px-4 py-2 text-center" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <p className="text-xl font-bold text-[#00D4FF]">{totalPlayers}</p>
            <p className="text-[9px] text-gray-400">Players</p>
          </div>
          <div className="rounded-lg px-4 py-2 text-center" style={{ background: avgReturn >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${avgReturn >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <p className="text-xl font-bold" style={{ color: avgReturn >= 0 ? '#22c55e' : '#ef4444' }}>{avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%</p>
            <p className="text-[9px] text-gray-400">Avg Return</p>
          </div>
          <div className="rounded-lg px-4 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xl font-bold">
              <span style={{ color: '#22c55e' }}>{profitCount}</span>
              <span className="text-gray-600 text-sm mx-1">/</span>
              <span style={{ color: '#ef4444' }}>{lossCount}</span>
            </p>
            <p className="text-[9px] text-gray-400">Profit / Loss</p>
          </div>
        </div>

        <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* ✅ Awards — fixed: .find() from array */}
        <div className="flex gap-2">
          {quizMaster && quizMaster.winnerId && (
            <div className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <span className="text-xl">{quizMaster.emoji}</span>
              <div>
                <p className="text-xs font-bold text-[#A855F7]">{quizMaster.name}</p>
                <p className="text-[10px] text-gray-400">{quizMaster.winnerName} ({quizMaster.stat})</p>
              </div>
            </div>
          )}
          {smartDiversifier && smartDiversifier.winnerId && (
            <div className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <span className="text-xl">{smartDiversifier.emoji}</span>
              <div>
                <p className="text-xs font-bold text-[#00D4FF]">{smartDiversifier.name}</p>
                <p className="text-[10px] text-gray-400">{smartDiversifier.winnerName}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === Row 4: Thank you === */}
      <div className="text-center" style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '1.1s' }}>
        <p className="text-sm text-[#00FFB2]">Thank you for playing Market Wars!</p>
        <p className="text-[10px] text-gray-600 mt-0.5">Powered by Dime!</p>
      </div>
    </div>
  );
}
