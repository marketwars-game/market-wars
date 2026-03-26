// FILE: components/display/FinalDisplay.tsx — Display Final Phase
// VERSION: B13-v2 — Bigger podium, full screen, fix 3rd name, Dime Kids Camp
// LAST MODIFIED: 27 Mar 2026
// HISTORY: B7 created | B8R extracted | B11 awards | B12-UX horizontal | B12-UX-v2 fix awards | B13-v1 fix height | B13-v2 full screen redesign

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

  const awards = calculateAwards(players);
  const quizMaster = awards.find((a) => a.id === 'quiz_master');
  const smartDiversifier = awards.find((a) => a.id === 'smart_diversifier');

  const medals = ['🥇', '🥈', '🥉'];
  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const podiumBg = ['rgba(255,215,0,0.12)', 'rgba(192,192,192,0.1)', 'rgba(205,127,50,0.1)'];
  const nameColors = ['#FCD34D', '#D1D5DB', '#FBBF24'];

  // Helper: คำนวณ return %
  const getReturnPct = (money: number) => (((money || STARTING_MONEY) - STARTING_MONEY) / STARTING_MONEY * 100).toFixed(1);
  const getReturnColor = (money: number) => (money || 0) >= STARTING_MONEY ? '#22c55e' : '#ef4444';

  return (
    <div className="h-screen flex flex-col items-center justify-center px-8 overflow-hidden">
      <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* === Title === */}
      <div className="text-center mb-8" style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '0.2s' }}>
        <div className="text-6xl mb-2">🏆</div>
        <h1 className="text-5xl font-black" style={{ color: '#FCD34D' }}>Game Over!</h1>
        <p className="text-gray-400 text-lg mt-1">จบครบ 6 ปี</p>
      </div>

      {/* === Podium — ใหญ่ขึ้น เห็นชัด === */}
      <div className="flex items-end gap-4 mb-8" style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '0.5s' }}>
        {/* 2nd place */}
        {top3[1] && (
          <div className="text-center rounded-t-xl px-6 pt-5 pb-4 flex flex-col justify-end" style={{ background: podiumBg[1], height: '160px', width: '180px', borderTop: `3px solid ${podiumColors[1]}` }}>
            <p className="text-3xl mb-1">{medals[1]}</p>
            <p className="text-lg font-bold truncate" style={{ color: nameColors[1] }}>{top3[1].name}</p>
            <p className="text-base text-gray-400 mt-0.5">฿{(parseFloat(top3[1].money) || 0).toLocaleString()}</p>
            <p className="text-sm mt-0.5" style={{ color: getReturnColor(parseFloat(top3[1].money)) }}>
              {getReturnPct(parseFloat(top3[1].money))}%
            </p>
          </div>
        )}
        {/* 1st place */}
        {top3[0] && (
          <div className="text-center rounded-t-xl px-6 pt-5 pb-4 flex flex-col justify-end" style={{ background: podiumBg[0], height: '200px', width: '200px', borderTop: `3px solid ${podiumColors[0]}` }}>
            <p className="text-4xl mb-1">{medals[0]}</p>
            <p className="text-2xl font-bold truncate" style={{ color: nameColors[0] }}>{top3[0].name}</p>
            <p className="text-lg text-gray-300 mt-0.5">฿{(parseFloat(top3[0].money) || 0).toLocaleString()}</p>
            <p className="text-base mt-0.5" style={{ color: getReturnColor(parseFloat(top3[0].money)) }}>
              {getReturnPct(parseFloat(top3[0].money))}%
            </p>
          </div>
        )}
        {/* 3rd place */}
        {top3[2] && (
          <div className="text-center rounded-t-xl px-6 pt-5 pb-4 flex flex-col justify-end" style={{ background: podiumBg[2], height: '155px', width: '180px', borderTop: `3px solid ${podiumColors[2]}` }}>
            <p className="text-3xl mb-1">{medals[2]}</p>
            <p className="text-lg font-bold truncate" style={{ color: nameColors[2] }}>{top3[2].name}</p>
            <p className="text-base text-gray-400 mt-0.5">฿{(parseFloat(top3[2].money) || 0).toLocaleString()}</p>
            <p className="text-sm mt-0.5" style={{ color: getReturnColor(parseFloat(top3[2].money)) }}>
              {getReturnPct(parseFloat(top3[2].money))}%
            </p>
          </div>
        )}
      </div>

      {/* === Stats + Awards === */}
      <div className="flex gap-4 items-stretch flex-wrap justify-center mb-6" style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '0.8s' }}>
        <div className="flex gap-3">
          <div className="rounded-xl px-5 py-3 text-center" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <p className="text-2xl font-bold text-[#00D4FF]">{totalPlayers}</p>
            <p className="text-xs text-gray-400">Players</p>
          </div>
          <div className="rounded-xl px-5 py-3 text-center" style={{ background: avgReturn >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${avgReturn >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <p className="text-2xl font-bold" style={{ color: avgReturn >= 0 ? '#22c55e' : '#ef4444' }}>{avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">Avg Return</p>
          </div>
          <div className="rounded-xl px-5 py-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-2xl font-bold">
              <span style={{ color: '#22c55e' }}>{profitCount}</span>
              <span className="text-gray-600 text-base mx-1">/</span>
              <span style={{ color: '#ef4444' }}>{lossCount}</span>
            </p>
            <p className="text-xs text-gray-400">Profit / Loss</p>
          </div>
        </div>

        <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <div className="flex gap-3">
          {quizMaster && quizMaster.winnerId && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <span className="text-2xl">{quizMaster.emoji}</span>
              <div>
                <p className="text-sm font-bold text-[#A855F7]">{quizMaster.name}</p>
                <p className="text-xs text-gray-400">{quizMaster.winnerName} ({quizMaster.stat})</p>
              </div>
            </div>
          )}
          {smartDiversifier && smartDiversifier.winnerId && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <span className="text-2xl">{smartDiversifier.emoji}</span>
              <div>
                <p className="text-sm font-bold text-[#00D4FF]">{smartDiversifier.name}</p>
                <p className="text-xs text-gray-400">{smartDiversifier.winnerName}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === Thank you === */}
      <div className="text-center" style={{ animation: 'fadeSlideUp 0.6s ease-out both', animationDelay: '1.1s' }}>
        <p className="text-lg text-[#00FFB2]">Thank you for playing Market Wars!</p>
        <p className="text-sm text-gray-500 mt-1">Powered by Dime Kids Camp</p>
      </div>
    </div>
  );
}
