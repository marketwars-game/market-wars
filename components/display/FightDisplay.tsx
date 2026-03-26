// FILE: components/display/FightDisplay.tsx — Market Fight Display (16:9 projector)
// VERSION: B12-UX-v1 — Horizontal layout (no scroll)
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B9 created | B12-UX horizontal layout

'use client';

interface FightDisplayProps {
  players: any[];
  round: number;
}

export default function FightDisplay({ players, round }: FightDisplayProps) {
  const playersWithOpponent = players.filter(p => p.duel_opponent_id);
  const totalPairs = Math.floor(playersWithOpponent.length / 2);
  const submittedCount = players.filter(p => p.duel_submitted_round >= round && p.duel_opponent_id).length;
  const waitingCount = playersWithOpponent.length - submittedCount;

  const hasResults = players.some(p => p.duel_result && p.duel_result !== 'null' && p.duel_result !== 'bye' && p.duel_result !== null);

  const winCount = players.filter(p => p.duel_result === 'win').length;
  const loseCount = players.filter(p => p.duel_result === 'lose').length;
  const drawCount = players.filter(p => p.duel_result === 'draw').length;
  const byeCount = players.filter(p => p.duel_result === 'bye').length;

  const rockCount = players.filter(p => p.duel_move === 'rock').length;
  const scissorsCount = players.filter(p => p.duel_move === 'scissors').length;
  const paperCount = players.filter(p => p.duel_move === 'paper').length;

  // === หลัง Resolve: สถิติ ===
  if (hasResults) {
    return (
      <div className="w-full h-full flex items-center justify-center px-8">
        <div className="flex gap-6 items-center">
          {/* Left: Win/Lose/Draw/Bye stats */}
          <div className="flex gap-4">
            <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(0,255,178,0.08)', border: '1px solid rgba(0,255,178,0.2)' }}>
              <p className="text-3xl font-bold" style={{ color: '#00FFB2' }}>{winCount}</p>
              <p className="text-[10px] text-gray-400">ชนะ</p>
            </div>
            <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-3xl font-bold" style={{ color: '#EF4444' }}>{loseCount}</p>
              <p className="text-[10px] text-gray-400">แพ้</p>
            </div>
            <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-3xl font-bold" style={{ color: '#F59E0B' }}>{drawCount}</p>
              <p className="text-[10px] text-gray-400">เสมอ</p>
            </div>
            {byeCount > 0 && (
              <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-3xl font-bold text-gray-400">{byeCount}</p>
                <p className="text-[10px] text-gray-400">bye</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-16" style={{ background: 'rgba(255,255,255,0.1)' }} />

          {/* Right: Move breakdown */}
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-3xl">✊</p>
              <p className="text-lg font-bold text-white">{rockCount}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl">✌️</p>
              <p className="text-lg font-bold text-white">{scissorsCount}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl">✋</p>
              <p className="text-lg font-bold text-white">{paperCount}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === ก่อน Resolve: submitted count ===
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-2">⚔️</p>
        <p className="text-xl font-bold text-[#00FFB2] mb-4">MARKET FIGHT!</p>
        <div className="flex gap-6 justify-center">
          <div className="text-center">
            <p className="text-4xl font-bold font-mono" style={{ color: '#00FFB2' }}>{submittedCount}</p>
            <p className="text-xs text-gray-400">submitted</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold font-mono text-gray-500">{waitingCount}</p>
            <p className="text-xs text-gray-400">waiting</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold font-mono text-gray-600">{totalPairs}</p>
            <p className="text-xs text-gray-400">pairs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
