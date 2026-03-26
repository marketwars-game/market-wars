// FILE: components/player/ResearchQuiz.tsx — Player Research Quiz (2 phases)
// VERSION: B13-BATCH1-v1 — Cut news_feed, add quiz bonus display
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B8 created (inline) | B8R extracted to component | B13-BATCH1 cut news_feed + quiz bonus
'use client';

import { getQuizForRound, QUIZ_BONUS } from '@/lib/constants';

interface ResearchQuizProps {
  roomId: string;
  round: number;
  phase: 'research' | 'research_reveal'; // ✅ B13: ตัด news_feed
  quizAnswers: (number | null)[];
  quizSubmitted: boolean;
  onSelect: (questionIndex: number, choiceIndex: number) => void;
  onSubmit: () => void;
}

export default function ResearchQuiz({ roomId, round, phase, quizAnswers, quizSubmitted, onSelect, onSubmit }: ResearchQuizProps) {
  const questions = getQuizForRound(roomId, round);

  // === PHASE 1: Research Quiz (เลือกคำตอบ ไม่เฉลย) ===
  if (phase === 'research') {
    const allAnswered = quizAnswers.every((a) => a !== null);
    return (
      <div className="bg-[#161b22] rounded-lg p-4">
        <div className="text-center mb-4">
          <span className="text-[10px] tracking-[1.5px] px-3 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#A855F7' }}>RESEARCH CHALLENGE</span>
          <p className="text-gray-500 text-xs mt-2">ตอบ 2 ข้อ ความรู้ = เงิน!</p>
        </div>
        {questions.map((q, qi) => (
          <div key={qi} className="mb-4">
            <p className="text-white font-bold text-sm mb-2">ข้อ {qi + 1}: {q.question}</p>
            <div className="space-y-1.5">
              {q.choices.map((choice, ci) => {
                const isSel = quizAnswers[qi] === ci;
                return (<button key={ci} onClick={() => onSelect(qi, ci)} disabled={quizSubmitted} className="w-full text-left rounded-lg p-2.5 transition-all" style={{ border: `1px solid ${isSel ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}`, background: isSel ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.02)', color: isSel ? '#A855F7' : 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{String.fromCharCode(65 + ci)}. {choice}</button>);
              })}
            </div>
          </div>
        ))}
        {!quizSubmitted ? (
          <button onClick={onSubmit} disabled={!allAnswered} className="w-full py-3 rounded-lg font-bold text-sm disabled:opacity-40" style={{ background: allAnswered ? 'linear-gradient(135deg, #A855F7, #00D4FF)' : 'rgba(255,255,255,0.1)', color: allAnswered ? '#fff' : 'rgba(255,255,255,0.3)' }}>Submit Quiz</button>
        ) : (
          <div className="text-center py-2"><p className="text-xs" style={{ color: '#A855F7' }}>✓ Quiz submitted — รอ MC เฉลย...</p></div>
        )}
      </div>
    );
  }

  // === PHASE 2: Quiz Reveal + Bonus (เฉลย + แสดง bonus เงิน) ===
  if (phase === 'research_reveal') {
    const correctCount = quizAnswers.filter((a, i) => a === questions[i]?.correct).length;

    // ✅ B13: คำนวณ bonus จาก QUIZ_BONUS config
    let bonus = QUIZ_BONUS.CORRECT_0;
    if (correctCount >= 2) bonus = QUIZ_BONUS.CORRECT_2;
    else if (correctCount === 1) bonus = QUIZ_BONUS.CORRECT_1;

    // Bonus display config
    const bonusConfig = correctCount >= 2
      ? { text: `+฿${bonus.toLocaleString()} 🎉 ตอบถูกครบ!`, color: '#00FFB2', bg: 'rgba(0,255,178,0.1)', border: 'rgba(0,255,178,0.3)' }
      : correctCount === 1
      ? { text: `+฿${bonus.toLocaleString()} ตอบถูก 1 ข้อ`, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' }
      : { text: 'ไม่ได้ bonus เลย 😢', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' };

    return (
      <div className="bg-[#161b22] rounded-lg p-4">
        <div className="text-center mb-4">
          <span className="text-[10px] tracking-[1.5px] px-3 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#A855F7' }}>QUIZ REVEAL</span>
          <p className="text-white text-lg font-bold mt-2">คุณตอบถูก {correctCount}/2 ข้อ</p>
        </div>

        {/* ✅ B13: Bonus Card */}
        <div className="rounded-lg p-3 mb-4 text-center" style={{ background: bonusConfig.bg, border: `1px solid ${bonusConfig.border}` }}>
          <p className="text-xl font-bold" style={{ color: bonusConfig.color }}>{bonusConfig.text}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>ความรู้ = เงิน!</p>
        </div>

        {questions.map((q, qi) => {
          const myAns = quizAnswers[qi];
          return (
            <div key={qi} className="mb-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-bold text-white mb-2">ข้อ {qi + 1}: {q.question}</p>
              <div className="space-y-1">{q.choices.map((choice, ci) => {
                const isMy = myAns === ci; const isCorr = ci === q.correct;
                let bg = 'transparent'; let bdr = 'transparent'; let clr = 'rgba(255,255,255,0.4)';
                if (isCorr) { bg = 'rgba(0,255,178,0.1)'; bdr = 'rgba(0,255,178,0.3)'; clr = '#00FFB2'; }
                else if (isMy) { bg = 'rgba(239,68,68,0.1)'; bdr = 'rgba(239,68,68,0.3)'; clr = '#EF4444'; }
                return (<div key={ci} className="rounded px-2.5 py-1.5 text-xs" style={{ background: bg, border: `1px solid ${bdr}`, color: clr }}>{String.fromCharCode(65 + ci)}. {choice}{isCorr && ' ✓'}{isMy && !isCorr && ' ✗'}</div>);
              })}</div>
            </div>
          );
        })}
        <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>รอ MC กด Next เพื่อไปลงทุน...</p>
      </div>
    );
  }

  return null;
}
