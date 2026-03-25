// FILE: components/display/FightDisplay.tsx — Market Fight Display (16:9 projector)
// VERSION: B9-v1
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B9 created

'use client';

interface FightDisplayProps {
  players: any[];
  round: number;
}

export default function FightDisplay({ players, round }: FightDisplayProps) {
  // นับสถิติ
  const playersWithOpponent = players.filter(p => p.duel_opponent_id);
  const totalPairs = Math.floor(playersWithOpponent.length / 2);
  const submittedCount = players.filter(p => p.duel_submitted_round >= round && p.duel_opponent_id).length;
  const waitingCount = playersWithOpponent.length - submittedCount;

  // ตรวจว่า resolve แล้วหรือยัง (ดูจาก duel_result)
  const hasResults = players.some(p => p.duel_result && p.duel_result !== 'null' && p.duel_result !== 'bye' && p.duel_result !== null);

  const winCount = players.filter(p => p.duel_result === 'win').length;
  const loseCount = players.filter(p => p.duel_result === 'lose').length;
  const drawCount = players.filter(p => p.duel_result === 'draw').length;
  const byeCount = players.filter(p => p.duel_result === 'bye').length;

  // Move breakdown
  const rockCount = players.filter(p => p.duel_move === 'rock').length;
  const scissorsCount = players.filter(p => p.duel_move === 'scissors').length;
  const paperCount = players.filter(p => p.duel_move === 'paper').length;

  // === หลัง Resolve: แสดงสถิติ ===
  if (hasResults) {
    return (
      <div className="mt-6 w-full">
        {/* Stats row */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center px-6 py-4 rounded-xl" style={{ background: '#00FFB215', border: '1px solid #00FFB230', minWidth: '120px' }}>
            <div className="text-4xl font-extrabold text-[#00FFB2]">{winCount}</div>
            <div className="text-sm text-[#00FFB2] mt-1">🏆 ชนะ</div>
            <div className="text-xs text-[#00FFB2]/60 mt-0.5">+฿500</div>
          </div>
          <div className="text-center px-6 py-4 rounded-xl" style={{ background: '#EF444415', border: '1px solid #EF444430', minWidth: '120px' }}>
            <div className="text-4xl font-extrabold text-[#EF4444]">{loseCount}</div>
            <div className="text-sm text-[#EF4444] mt-1">💥 แพ้</div>
            <div className="text-xs text-[#EF4444]/60 mt-0.5">-฿300</div>
          </div>
          <div className="text-center px-6 py-4 rounded-xl" style={{ background: '#F59E0B15', border: '1px solid #F59E0B30', minWidth: '120px' }}>
            <div className="text-4xl font-extrabold text-[#F59E0B]">{drawCount}</div>
            <div className="text-sm text-[#F59E0B] mt-1">🤝 เสมอ</div>
            <div className="text-xs text-[#F59E0B]/60 mt-0.5">฿0</div>
          </div>
          {byeCount > 0 && (
            <div className="text-center px-6 py-4 rounded-xl" style={{ background: '#ffffff08', border: '1px solid #ffffff15', minWidth: '120px' }}>
              <div className="text-4xl font-extrabold text-gray-500">{byeCount}</div>
              <div className="text-sm text-gray-500 mt-1">🍀 Bye</div>
              <div className="text-xs text-gray-600 mt-0.5">ไม่มีคู่</div>
            </div>
          )}
        </div>

        {/* Move breakdown */}
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <span className="text-3xl">✊</span>
            <div className="text-lg font-bold text-white mt-1">{rockCount}</div>
          </div>
          <div className="text-center">
            <span className="text-3xl">✌️</span>
            <div className="text-lg font-bold text-white mt-1">{scissorsCount}</div>
          </div>
          <div className="text-center">
            <span className="text-3xl">✋</span>
            <div className="text-lg font-bold text-white mt-1">{paperCount}</div>
          </div>
        </div>
      </div>
    );
  }

  // === ระหว่างเล่น: แสดง submitted count ===
  return (
    <div className="mt-6 w-full">
      {/* Big emoji row */}
      <div className="flex justify-center gap-6 mb-6">
        <span className="text-6xl">✊</span>
        <span className="text-6xl">✌️</span>
        <span className="text-6xl">✋</span>
      </div>

      {/* Submitted stats */}
      <div className="flex justify-center gap-10">
        <div className="text-center">
          <div className="text-3xl font-extrabold text-[#00FFB2]">{submittedCount}</div>
          <div className="text-sm text-gray-400">กดแล้ว</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-extrabold text-gray-500">{waitingCount}</div>
          <div className="text-sm text-gray-400">รอกด</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-extrabold text-[#F59E0B]">{totalPairs}</div>
          <div className="text-sm text-gray-400">คู่ทั้งหมด</div>
        </div>
      </div>

      <p className="text-gray-600 text-sm text-center mt-6">ดูคู่ของคุณบนมือถือ แล้วเลือก ค้อน กรรไกร กระดาษ!</p>
    </div>
  );
}
