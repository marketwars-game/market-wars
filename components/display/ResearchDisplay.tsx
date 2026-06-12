// FILE: components/display/ResearchDisplay.tsx — Display Research Quiz (2 phases)
// VERSION: B18-v2 — restore 3-tier bonus breakdown (ถูก2/ถูก1/ไม่ถูก) as horizontal bar above wall
// LAST MODIFIED: 12 Jun 2026
// HISTORY: B8 created (inline) | B8R extracted | B12-UX horizontal | B13-BATCH1 cut news_feed + bonus stats | B15 projector polish | B16b live name feed | B16d reveal drama | B17-BATCH1 bilingual question/choices via <Bi> | B18 speed name-wall + compact teaching reveal | B18-v2 3-tier bonus bar
'use client';

import { useEffect, useState } from 'react';
import { getQuizForRound, QUIZ_BONUS } from '@/lib/constants';
import LiveNameFeed from '@/components/display/LiveNameFeed';
import QuizSpeedWall from '@/components/display/QuizSpeedWall';
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

  // === PHASE 2: Quiz Reveal — compact teaching (โจทย์ + คำตอบถูก) + speed name-wall (B18 Option D) ===
  if (phase === 'research_reveal') {
    const answeredPlayers = players.filter((p) => (p.quiz_answered_round || 0) >= round);
    const correct2 = answeredPlayers.filter((p) => (p.quiz_correct_this_round || 0) >= 2).length;
    const correct1 = answeredPlayers.filter((p) => (p.quiz_correct_this_round || 0) === 1).length;
    const correct0 = answeredPlayers.filter((p) => (p.quiz_correct_this_round || 0) === 0).length;
    const notAnswered = players.length - answeredPlayers.length;
    const cu = (v: number) => Math.round(v * mult);

    return (
      <div className="w-full h-full flex flex-col px-8 py-4 overflow-hidden">
        <style>{`@keyframes mwGreenPop { from { opacity:0; transform:scale(.92) } to { opacity:1; transform:scale(1) } }`}</style>

        {/* Teaching (compact) — โจทย์ + คำตอบถูกเท่านั้น (stagger ทีละข้อ) */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          {questions.map((q, qi) => {
            const shown = qi < revealed;
            const correctChoice = q.choices[q.correct];
            return (
              <div key={qi} className="rounded-xl p-4" style={{ background: '#161b22', border: '1px solid rgba(168,85,247,0.2)' }}>
                <p className="text-xs text-[#A855F7] mb-1 tracking-wider font-semibold">ข้อ {qi + 1} / QUESTION {qi + 1}</p>
                <Bi t={q.question} className="text-base text-white font-bold mb-2" />
                <div className="rounded-lg px-3 py-2 inline-block" style={{
                  background: shown ? 'rgba(0,255,178,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${shown ? 'rgba(0,255,178,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  animation: shown ? 'mwGreenPop 0.4s ease-out both' : 'none',
                }}>
                  <Bi t={correctChoice} prefix="✓ " style={{ color: shown ? '#00FFB2' : 'rgba(255,255,255,0.3)', fontSize: '16px' }} enStyle={{ opacity: 1, fontSize: '12px' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Knowledge = money — breakdown 3 ระดับ (count-up) เหมือนเดิม */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span style={{ fontSize: '20px' }}>💡</span>
            <span className="text-sm font-bold leading-tight" style={{ color: 'rgba(255,255,255,0.72)' }}>ความรู้<br />= เงิน!</span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-3">
            <div className="rounded-lg py-2 px-3 text-center" style={{ background: 'rgba(0,255,178,0.08)', border: '1px solid rgba(0,255,178,0.25)' }}>
              <p className="leading-none"><span className="text-2xl font-bold" style={{ color: '#00FFB2' }}>{cu(correct2)}</span> <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>คน</span></p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>ถูก 2 ข้อ · +฿{QUIZ_BONUS.CORRECT_2}</p>
            </div>
            <div className="rounded-lg py-2 px-3 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <p className="leading-none"><span className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{cu(correct1)}</span> <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>คน</span></p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>ถูก 1 ข้อ · +฿{QUIZ_BONUS.CORRECT_1}</p>
            </div>
            <div className="rounded-lg py-2 px-3 text-center" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)' }}>
              <p className="leading-none"><span className="text-2xl font-bold" style={{ color: '#EF4444' }}>{cu(correct0 + notAnswered)}</span> <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>คน</span></p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>ไม่ถูกเลย · ไม่ได้ bonus</p>
            </div>
          </div>
        </div>

        {/* Speed name-wall (hero) */}
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: '22px' }}>⚡</span>
          <span className="text-xl text-white font-bold">ตอบถูกครบ — เร็วที่สุด!</span>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.66)' }}>Fastest to get both right</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <QuizSpeedWall key={round} players={players} round={round} />
        </div>
      </div>
    );
  }

  return null;
}
