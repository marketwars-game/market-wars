// FILE: components/display/ResearchDisplay.tsx — Display Research Quiz (2 phases)
// VERSION: B13-BATCH1-v1 — Cut news_feed, add bonus stats
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B8 created (inline) | B8R extracted to component | B12-UX horizontal layout | B13-BATCH1 cut news_feed + bonus stats
'use client';

import { getQuizForRound, QUIZ_BONUS } from '@/lib/constants';

interface ResearchDisplayProps {
  roomId: string;
  round: number;
  phase: 'research' | 'research_reveal'; // ✅ B13: ตัด news_feed
  players: any[];
  quizSubmittedCount: number;
}

export default function ResearchDisplay({ roomId, round, phase, players, quizSubmittedCount }: ResearchDisplayProps) {

  // === PHASE 1: Research Quiz — ซ้าย: คำถาม | ขวา: counter ===
  if (phase === 'research') {
    const questions = getQuizForRound(roomId, round);
    return (
      <div className="w-full h-full flex">
        {/* Left: Questions */}
        <div className="flex-1 flex flex-col justify-center px-6 overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {questions.map((q, qi) => (
            <div key={qi} className="mb-3 last:mb-0 rounded-lg p-3 text-left" style={{ background: '#161b22', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-[10px] text-[#A855F7] mb-1 tracking-wider">QUESTION {qi + 1} / 2</p>
              <p className="text-sm text-white font-bold mb-2">{q.question}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {q.choices.map((choice, ci) => (
                  <div key={ci} className="rounded px-2 py-1.5 text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                    {String.fromCharCode(65 + ci)}. {choice}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Right: Counter */}
        <div className="w-48 flex flex-col items-center justify-center px-4">
          <p className="text-5xl font-bold font-mono" style={{ color: '#00FFB2' }}>{quizSubmittedCount}/{players.length}</p>
          <p className="text-xs font-mono mt-1" style={{ color: '#ffffff40' }}>quiz submitted</p>
        </div>
      </div>
    );
  }

  // === PHASE 2: Quiz Reveal + Bonus Stats ===
  if (phase === 'research_reveal') {
    const questions = getQuizForRound(roomId, round);
    const answeredPlayers = players.filter(p => (p.quiz_answered_round || 0) >= round);
    const correct2 = answeredPlayers.filter(p => (p.quiz_correct_this_round || 0) >= 2).length;
    const correct1 = answeredPlayers.filter(p => (p.quiz_correct_this_round || 0) === 1).length;
    const correct0 = answeredPlayers.filter(p => (p.quiz_correct_this_round || 0) === 0).length;
    const notAnswered = players.length - answeredPlayers.length;

    // ✅ B13: คำนวณ bonus รวม
    const totalBonus = (correct2 * QUIZ_BONUS.CORRECT_2) + (correct1 * QUIZ_BONUS.CORRECT_1);

    return (
      <div className="w-full h-full flex">
        {/* Left: Answers */}
        <div className="flex-1 flex flex-col justify-center px-6 overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {questions.map((q, qi) => (
            <div key={qi} className="mb-3 last:mb-0 rounded-lg p-3 text-left" style={{ background: '#161b22', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-[10px] text-[#A855F7] mb-1 tracking-wider">QUESTION {qi + 1}</p>
              <p className="text-sm text-white font-bold mb-2">{q.question}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {q.choices.map((choice, ci) => {
                  const isCorrect = ci === q.correct;
                  return (
                    <div key={ci} className="rounded px-2 py-1.5 text-xs" style={{
                      background: isCorrect ? 'rgba(0,255,178,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isCorrect ? 'rgba(0,255,178,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      color: isCorrect ? '#00FFB2' : 'rgba(255,255,255,0.3)',
                    }}>
                      {String.fromCharCode(65 + ci)}. {choice} {isCorrect && '✓'}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {/* Right: Bonus Stats */}
        <div className="w-52 flex flex-col items-center justify-center px-4 gap-3">
          {/* ✅ B13: Bonus breakdown */}
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: '#00FFB2' }}>{correct2}</p>
            <p className="text-[10px]" style={{ color: '#ffffff40' }}>ถูก 2 ข้อ (+฿{QUIZ_BONUS.CORRECT_2})</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{correct1}</p>
            <p className="text-[10px]" style={{ color: '#ffffff40' }}>ถูก 1 ข้อ (+฿{QUIZ_BONUS.CORRECT_1})</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>{correct0 + notAnswered}</p>
            <p className="text-[10px]" style={{ color: '#ffffff40' }}>ไม่ได้ bonus</p>
          </div>
          {/* Total bonus */}
          <div className="mt-2 text-center rounded-lg px-3 py-2" style={{ background: 'rgba(0,255,178,0.08)' }}>
            <p className="text-xs" style={{ color: '#00FFB2' }}>💰 Bonus รวม: ฿{totalBonus.toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
