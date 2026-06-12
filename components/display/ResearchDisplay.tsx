// FILE: components/display/ResearchDisplay.tsx — Display Research Quiz (2 phases)
// VERSION: B17-BATCH1-v1 — Bilingual: wrap question + choices in <Bi> (th/en); B16d reveal drama preserved
// LAST MODIFIED: 12 Jun 2026
// HISTORY: B8 created (inline) | B8R extracted | B12-UX horizontal | B13-BATCH1 cut news_feed + bonus stats | B15 projector polish | B16b live name feed | B16d reveal drama | B17-BATCH1 bilingual question/choices via <Bi>
'use client';

import { useEffect, useState } from 'react';
import { getQuizForRound, QUIZ_BONUS } from '@/lib/constants';
import LiveNameFeed from '@/components/display/LiveNameFeed';
import Bi from '@/components/common/Bi';

interface ResearchDisplayProps {
  roomId: string;
  round: number;
  phase: 'research' | 'research_reveal';
  players: any[];
  quizSubmittedCount: number;
}

export default function ResearchDisplay({ roomId, round, phase, players }: ResearchDisplayProps) {
  const questions = getQuizForRound(roomId, round);

  // B16d: reveal drama state (hooks ต้องอยู่บนสุด ก่อน early-return)
  const [revealed, setRevealed] = useState(0); // กี่ข้อที่เฉลยแล้ว (stagger)
  const [mult, setMult] = useState(1);          // 0→1 count-up multiplier

  useEffect(() => {
    if (phase !== 'research_reveal') return;
    // stagger เฉลยทีละข้อ
    setRevealed(0);
    const timers = questions.map((_, qi) =>
      setTimeout(() => setRevealed((r) => Math.max(r, qi + 1)), 400 + qi * 700)
    );
    // count-up โบนัส 0→1 ใน 0.8s
    setMult(0);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 800);
      setMult(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }, [phase, round]); // eslint-disable-line react-hooks/exhaustive-deps

  // === PHASE 1: Research Quiz — ซ้าย: คำถาม | ขวา: ชื่อสด (feed) ===
  if (phase === 'research') {
    return (
      <div className="w-full h-full flex">
        <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {questions.map((q, qi) => (
            <div key={qi} className="mb-5 last:mb-0 rounded-xl p-5 text-left" style={{ background: '#161b22', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-sm text-[#A855F7] mb-2 tracking-wider font-semibold">QUESTION {qi + 1} / 2</p>
              <Bi t={q.question} className="text-xl text-white font-bold mb-4" />
              <div className="grid grid-cols-2 gap-2.5">
                {q.choices.map((choice, ci) => (
                  <div key={ci} className="rounded-lg px-4 py-3 text-base" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>
                    <Bi t={choice} prefix={`${String.fromCharCode(65 + ci)}. `} enStyle={{ opacity: 1, fontSize: '13px' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="w-72 flex-shrink-0 px-5 py-2">
          <LiveNameFeed players={players} round={round} />
        </div>
      </div>
    );
  }

  // === PHASE 2: Quiz Reveal + Bonus Stats (B16d drama) ===
  if (phase === 'research_reveal') {
    const answeredPlayers = players.filter((p) => (p.quiz_answered_round || 0) >= round);
    const correct2 = answeredPlayers.filter((p) => (p.quiz_correct_this_round || 0) >= 2).length;
    const correct1 = answeredPlayers.filter((p) => (p.quiz_correct_this_round || 0) === 1).length;
    const correct0 = answeredPlayers.filter((p) => (p.quiz_correct_this_round || 0) === 0).length;
    const notAnswered = players.length - answeredPlayers.length;
    const totalBonus = correct2 * QUIZ_BONUS.CORRECT_2 + correct1 * QUIZ_BONUS.CORRECT_1;
    const cu = (v: number) => Math.round(v * mult);

    return (
      <div className="w-full h-full flex">
        <style>{`@keyframes mwGreenPop { from { opacity:0; transform:scale(.92) } to { opacity:1; transform:scale(1) } }`}</style>
        {/* Left: Answers — stagger reveal */}
        <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {questions.map((q, qi) => {
            const shown = qi < revealed; // ข้อนี้เฉลยแล้วหรือยัง
            return (
              <div key={qi} className="mb-5 last:mb-0 rounded-xl p-5 text-left" style={{ background: '#161b22', border: '1px solid rgba(168,85,247,0.2)' }}>
                <p className="text-sm text-[#A855F7] mb-2 tracking-wider font-semibold">QUESTION {qi + 1}</p>
                <Bi t={q.question} className="text-xl text-white font-bold mb-4" />
                <div className="grid grid-cols-2 gap-2.5">
                  {q.choices.map((choice, ci) => {
                    const isCorrect = ci === q.correct;
                    const lit = isCorrect && shown; // ไฮไลต์เขียวเฉพาะเมื่อเฉลยถึงข้อนี้
                    return (
                      <div key={ci} className="rounded-lg px-4 py-3 text-base" style={{
                        background: lit ? 'rgba(0,255,178,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${lit ? 'rgba(0,255,178,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: lit ? '#00FFB2' : 'rgba(255,255,255,0.45)',
                        animation: lit ? 'mwGreenPop 0.4s ease-out both' : 'none',
                      }}>
                        <Bi t={choice} prefix={`${String.fromCharCode(65 + ci)}. `} suffix={lit ? ' ✓' : ''} enStyle={{ opacity: 1, fontSize: '13px' }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {/* Right: Bonus Stats — count up */}
        <div className="w-60 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: '#00FFB2' }}>{cu(correct2)}</p>
            <p className="text-base mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>ถูก 2 ข้อ (+฿{QUIZ_BONUS.CORRECT_2})</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: '#F59E0B' }}>{cu(correct1)}</p>
            <p className="text-base mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>ถูก 1 ข้อ (+฿{QUIZ_BONUS.CORRECT_1})</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: '#EF4444' }}>{cu(correct0 + notAnswered)}</p>
            <p className="text-base mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>ไม่ได้ bonus</p>
          </div>
          <div className="mt-1 text-center rounded-xl px-4 py-3" style={{ background: 'rgba(0,255,178,0.08)' }}>
            <p className="text-base" style={{ color: '#00FFB2' }}>💰 Bonus รวม: ฿{cu(totalBonus).toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
