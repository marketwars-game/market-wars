// FILE: components/player/ResearchQuiz.tsx — Player Research Quiz (3 phases)
// VERSION: B8R-v1 — Extracted from play/[roomId]/page.tsx
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B8 created (inline) | B8R extracted to component
'use client';

import { getQuizForRound, ROUND_NEWS } from '@/lib/constants';

interface ResearchQuizProps {
  roomId: string;
  round: number;
  phase: 'research' | 'research_reveal' | 'news_feed';
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
          <p className="text-gray-500 text-xs mt-2">ตอบ 2 ข้อ แล้วกด Submit</p>
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

  // === PHASE 2: Quiz Reveal (เฉลย) ===
  if (phase === 'research_reveal') {
    const correctCount = quizAnswers.filter((a, i) => a === questions[i]?.correct).length;
    const unlocked = correctCount >= 2;
    return (
      <div className="bg-[#161b22] rounded-lg p-4">
        <div className="text-center mb-4">
          <span className="text-[10px] tracking-[1.5px] px-3 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#A855F7' }}>QUIZ REVEAL</span>
          <p className="text-white text-lg font-bold mt-2">คุณตอบถูก {correctCount}/2 ข้อ</p>
          {unlocked ? <p className="text-xs mt-1" style={{ color: '#00FFB2' }}>✓ ปลดล็อกข่าวจริง!</p> : <p className="text-xs mt-1" style={{ color: '#EF4444' }}>✗ ไม่ได้ข่าวจริง — ต้องเดาเอง</p>}
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
        <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>รอ MC กด Next เพื่อดูข่าวรอบนี้...</p>
      </div>
    );
  }

  // === PHASE 3: News Feed (การ์ดข่าว border-left style) ===
  if (phase === 'news_feed') {
    const correctCount = quizAnswers.filter((a, i) => a === questions[i]?.correct).length;
    const unlocked = correctCount >= 2;
    const roundNews = ROUND_NEWS.find((n) => n.round === round);
    return (
      <div className="bg-[#161b22] rounded-lg p-4">
        <div className="text-center mb-3">
          <span className="text-[10px] tracking-[1.5px] px-3 py-1 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF' }}>NEWS FEED</span>
          <p className="text-white text-lg font-bold mt-2">ข่าวรอบที่ {round}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>ข่าว 1 ใน 3 เป็นข่าวจริง{unlocked && <span style={{ color: '#00FFB2' }}> — คุณรู้แล้ว!</span>}</p>
        </div>
        <div className="space-y-2 mb-3">
          {roundNews?.news.map((news, i) => {
            const isV = unlocked && news.isReal;
            return (
              <div key={i} className="rounded-lg overflow-hidden" style={{ borderLeft: `3px solid ${isV ? '#00FFB2' : 'rgba(255,255,255,0.12)'}`, background: isV ? 'rgba(0,255,178,0.05)' : 'rgba(255,255,255,0.02)' }}>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1.5"><span className="text-[9px] px-2 py-0.5 rounded" style={{ background: isV ? 'rgba(0,255,178,0.12)' : 'rgba(255,255,255,0.05)', color: isV ? '#00FFB2' : 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>{isV ? 'VERIFIED' : 'UNVERIFIED'}</span></div>
                  <div className="flex items-start gap-3"><span className="text-xl leading-none flex-shrink-0">{news.emoji}</span><p className="text-sm leading-relaxed" style={{ color: isV ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}>{news.text}</p></div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>อ่านข่าวให้ดี แล้วเตรียมลงทุน! รอ MC กด Next...</p>
      </div>
    );
  }

  return null;
}
