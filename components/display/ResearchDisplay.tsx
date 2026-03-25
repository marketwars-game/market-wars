// FILE: components/display/ResearchDisplay.tsx — Display Research Quiz (3 phases)
// VERSION: B8R-v1 — Extracted from display/[roomId]/page.tsx
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B8 created (inline) | B8R extracted to component
'use client';

import { getQuizForRound, ROUND_NEWS } from '@/lib/constants';

interface ResearchDisplayProps {
  roomId: string;
  round: number;
  phase: 'research' | 'research_reveal' | 'news_feed';
  players: any[];
  quizSubmittedCount: number;
}

export default function ResearchDisplay({ roomId, round, phase, players, quizSubmittedCount }: ResearchDisplayProps) {

  // === PHASE 1: Research Quiz (แสดงคำถาม + submitted count) ===
  if (phase === 'research') {
    const questions = getQuizForRound(roomId, round);
    return (
      <div className="mt-8">
        <p className="text-6xl font-bold font-mono" style={{ color: '#00FFB2' }}>{quizSubmittedCount}/{players.length}</p>
        <p className="text-2xl font-mono mt-2" style={{ color: '#ffffff60' }}>quiz submitted</p>

        <div className="mt-8 max-w-lg mx-auto space-y-4">
          {questions.map((q, qi) => (
            <div key={qi} className="bg-[#161b22] rounded-lg p-5 text-left" style={{ border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-xs text-[#A855F7] mb-2">ข้อ {qi + 1}</p>
              <p className="text-lg text-white font-bold mb-3">{q.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.choices.map((choice, ci) => (
                  <div key={ci} className="rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                    {String.fromCharCode(65 + ci)}. {choice}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // === PHASE 2: Quiz Reveal (เฉลย + สถิติ) ===
  if (phase === 'research_reveal') {
    const questions = getQuizForRound(roomId, round);
    const answeredPlayers = players.filter(p => (p.quiz_answered_round || 0) >= round);
    const correct2 = answeredPlayers.filter(p => (p.quiz_correct_this_round || 0) >= 2).length;
    const correct1 = answeredPlayers.filter(p => (p.quiz_correct_this_round || 0) === 1).length;
    const correct0 = answeredPlayers.filter(p => (p.quiz_correct_this_round || 0) === 0).length;

    return (
      <div className="mt-8 max-w-lg mx-auto">
        <div className="space-y-4 mb-6">
          {questions.map((q, qi) => (
            <div key={qi} className="bg-[#161b22] rounded-lg p-5 text-left" style={{ border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-xs text-[#A855F7] mb-2">ข้อ {qi + 1}</p>
              <p className="text-lg text-white font-bold mb-3">{q.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.choices.map((choice, ci) => {
                  const isCorrect = ci === q.correct;
                  return (
                    <div
                      key={ci}
                      className="rounded-lg px-3 py-2 text-sm"
                      style={{
                        background: isCorrect ? 'rgba(0,255,178,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isCorrect ? 'rgba(0,255,178,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: isCorrect ? '#00FFB2' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {String.fromCharCode(65 + ci)}. {choice} {isCorrect && '✓'}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#161b22] rounded-lg p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: '#00FFB2' }}>{correct2}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(0,255,178,0.6)' }}>ถูก 2 ข้อ (ปลดล็อก)</p>
          </div>
          <div className="bg-[#161b22] rounded-lg p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: '#F59E0B' }}>{correct1}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(245,158,11,0.6)' }}>ถูก 1 ข้อ</p>
          </div>
          <div className="bg-[#161b22] rounded-lg p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: '#EF4444' }}>{correct0}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(239,68,68,0.6)' }}>ถูก 0 ข้อ</p>
          </div>
        </div>
      </div>
    );
  }

  // === PHASE 3: News Feed (ข่าว 3 ข่าว ไม่บอกจริง/มั่ว) ===
  if (phase === 'news_feed') {
    const roundNews = ROUND_NEWS.find((n) => n.round === round);
    if (!roundNews) return null;
    return (
      <div className="mt-8 max-w-lg mx-auto">
        <p className="text-xs tracking-widest text-gray-600 mb-3">ROUND {round} — MARKET RUMORS</p>
        <p className="text-sm text-gray-500 mb-4">จริงหรือมั่ว? ใครตอบ quiz ถูกจะรู้!</p>
        <div className="space-y-3">
          {roundNews.news.map((news, i) => (
            <div key={i} className="bg-[#161b22] rounded-lg overflow-hidden" style={{ borderLeft: '3px solid rgba(255,255,255,0.15)' }}>
              <div className="px-5 py-4 flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{news.emoji}</span>
                <p className="text-lg text-gray-300 leading-relaxed">{news.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-4">ข่าว 1 ใน 3 เป็นข่าวจริง — ใครจะรู้?</p>
      </div>
    );
  }

  return null;
}
