// FILE: components/display/ResearchDisplay.tsx — Display Research Quiz (2 phases)
// VERSION: B16b-v1 — research right column → LiveNameFeed (live submitted names); reveal unchanged
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B8 created (inline) | B8R extracted | B12-UX horizontal | B13-BATCH1 cut news_feed + bonus stats | B15 projector polish | B16b live name feed
'use client';

import { getQuizForRound, QUIZ_BONUS } from '@/lib/constants';
import LiveNameFeed from '@/components/display/LiveNameFeed';

interface ResearchDisplayProps {
  roomId: string;
  round: number;
  phase: 'research' | 'research_reveal';
  players: any[];
  quizSubmittedCount: number;
}

export default function ResearchDisplay({ roomId, round, phase, players }: ResearchDisplayProps) {

  // === PHASE 1: Research Quiz — ซ้าย: คำถาม | ขวา: ชื่อสด (feed) ===
  if (phase === 'research') {
    const questions = getQuizForRound(roomId, round);
    return (
      <div className="w-full h-full flex">
        {/* Left: Questions */}
        <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {questions.map((q, qi) => (
            <div key={qi} className="mb-5 last:mb-0 rounded-xl p-5 text-left" style={{ background: '#161b22', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-sm text-[#A855F7] mb-2 tracking-wider font-semibold">QUESTION {qi + 1} / 2</p>
              <p className="text-xl text-white font-bold mb-4">{q.question}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {q.choices.map((choice, ci) => (
                  <div key={ci} className="rounded-lg px-4 py-3 text-base" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>
                    {String.fromCharCode(65 + ci)}. {choice}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Right: Live submitted names */}
        <div className="w-72 flex-shrink-0 px-5 py-2">
          <LiveNameFeed players={players} round={round} />
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
    const totalBonus = (correct2 * QUIZ_BONUS.CORRECT_2) + (correct1 * QUIZ_BONUS.CORRECT_1);

    return (
      <div className="w-full h-full flex">
        {/* Left: Answers */}
        <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {questions.map((q, qi) => (
            <div key={qi} className="mb-5 last:mb-0 rounded-xl p-5 text-left" style={{ background: '#161b22', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-sm text-[#A855F7] mb-2 tracking-wider font-semibold">QUESTION {qi + 1}</p>
              <p className="text-xl text-white font-bold mb-4">{q.question}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {q.choices.map((choice, ci) => {
                  const isCorrect = ci === q.correct;
                  return (
                    <div key={ci} className="rounded-lg px-4 py-3 text-base" style={{
                      background: isCorrect ? 'rgba(0,255,178,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isCorrect ? 'rgba(0,255,178,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: isCorrect ? '#00FFB2' : 'rgba(255,255,255,0.45)',
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
        <div className="w-60 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: '#00FFB2' }}>{correct2}</p>
            <p className="text-base mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>ถูก 2 ข้อ (+฿{QUIZ_BONUS.CORRECT_2})</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: '#F59E0B' }}>{correct1}</p>
            <p className="text-base mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>ถูก 1 ข้อ (+฿{QUIZ_BONUS.CORRECT_1})</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: '#EF4444' }}>{correct0 + notAnswered}</p>
            <p className="text-base mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>ไม่ได้ bonus</p>
          </div>
          <div className="mt-1 text-center rounded-xl px-4 py-3" style={{ background: 'rgba(0,255,178,0.08)' }}>
            <p className="text-base" style={{ color: '#00FFB2' }}>💰 Bonus รวม: ฿{totalBonus.toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
