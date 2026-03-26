// FILE: components/mc/ResearchMC.tsx — MC Research Quiz (2 phases)
// VERSION: B13-BATCH1-v1 — Cut news_feed, add bonus summary
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B8 created (inline) | B8R extracted to component | B13-BATCH1 cut news_feed + bonus summary
'use client';

import { getQuizForRound, QUIZ_BONUS } from '@/lib/constants';

interface ResearchMCProps {
  roomId: string;
  round: number;
  phase: 'research' | 'research_reveal'; // ✅ B13: ตัด news_feed
  players: any[];
  quizSubmittedCount: number;
}

export default function ResearchMC({ roomId, round, phase, players, quizSubmittedCount }: ResearchMCProps) {

  // === PHASE 1: Quiz Breakdown — research phase ===
  if (phase === 'research') {
    const currentRound = round;
    const correctMap: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
    const playerQuizList: { id: string; name: string; score: number; status: 'BONUS_300' | 'BONUS_150' | 'NO_BONUS' | 'PENDING' }[] = [];
    for (const p of players) {
      const answered = (p.quiz_answered_round || 0) >= currentRound;
      if (!answered) { playerQuizList.push({ id: p.id, name: p.name, score: -1, status: 'PENDING' }); continue; }
      const correct = p.quiz_correct_this_round ?? 0;
      correctMap[correct] = (correctMap[correct] || 0) + 1;
      const status = correct >= 2 ? 'BONUS_300' : correct === 1 ? 'BONUS_150' : 'NO_BONUS';
      playerQuizList.push({ id: p.id, name: p.name, score: correct, status });
    }
    playerQuizList.sort((a, b) => { if (a.status === 'PENDING' && b.status !== 'PENDING') return 1; if (a.status !== 'PENDING' && b.status === 'PENDING') return -1; return b.score - a.score; });

    return (
      <div className="rounded-lg p-3 mb-3" style={{ background: '#A855F715', border: '1px solid #A855F730' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-mono" style={{ color: '#A855F7' }}>🔍 Quiz submitted</span>
          <span className="text-lg font-bold font-mono" style={{ color: '#00FFB2' }}>{quizSubmittedCount}/{players.length}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="rounded-md p-2 text-center" style={{ background: 'rgba(0,255,178,0.1)' }}><p className="text-lg font-bold" style={{ color: '#00FFB2' }}>{correctMap[2] || 0}</p><p className="text-[10px]" style={{ color: 'rgba(0,255,178,0.6)' }}>ถูก 2 ข้อ (+฿{QUIZ_BONUS.CORRECT_2})</p></div>
          <div className="rounded-md p-2 text-center" style={{ background: 'rgba(245,158,11,0.1)' }}><p className="text-lg font-bold" style={{ color: '#F59E0B' }}>{correctMap[1] || 0}</p><p className="text-[10px]" style={{ color: 'rgba(245,158,11,0.6)' }}>ถูก 1 ข้อ (+฿{QUIZ_BONUS.CORRECT_1})</p></div>
          <div className="rounded-md p-2 text-center" style={{ background: 'rgba(239,68,68,0.1)' }}><p className="text-lg font-bold" style={{ color: '#EF4444' }}>{correctMap[0] || 0}</p><p className="text-[10px]" style={{ color: 'rgba(239,68,68,0.6)' }}>ถูก 0 ข้อ (฿0)</p></div>
        </div>
        <div className="rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center px-2 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,17,23,0.5)' }}><span className="flex-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Player</span><span className="w-12 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Score</span><span className="w-16 text-right text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Bonus</span></div>
          <div className="max-h-40 overflow-y-auto">
            {playerQuizList.map((p) => (
              <div key={p.id} className="flex items-center px-2 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="flex-1 text-xs" style={{ color: p.status === 'PENDING' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)' }}>{p.name}</span>
                <span className="w-12 text-center text-xs font-bold" style={{ color: p.score === 2 ? '#00FFB2' : p.score === 1 ? '#F59E0B' : p.score === 0 ? '#EF4444' : 'rgba(255,255,255,0.25)' }}>{p.score >= 0 ? `${p.score}/2` : '—'}</span>
                <span className="w-16 text-right"><span className="text-[9px] px-1.5 py-0.5 rounded" style={{
                  background: p.status === 'BONUS_300' ? 'rgba(0,255,178,0.12)' : p.status === 'BONUS_150' ? 'rgba(245,158,11,0.1)' : p.status === 'NO_BONUS' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                  color: p.status === 'BONUS_300' ? '#00FFB2' : p.status === 'BONUS_150' ? '#F59E0B' : p.status === 'NO_BONUS' ? '#EF4444' : 'rgba(255,255,255,0.3)',
                }}>{p.status === 'BONUS_300' ? `+฿${QUIZ_BONUS.CORRECT_2}` : p.status === 'BONUS_150' ? `+฿${QUIZ_BONUS.CORRECT_1}` : p.status === 'NO_BONUS' ? '฿0' : '—'}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // === PHASE 2: Quiz Reveal + Bonus Summary ===
  if (phase === 'research_reveal') {
    const questions = getQuizForRound(roomId, round);
    const answeredPlayers = players.filter(p => (p.quiz_answered_round || 0) >= round);
    const correct2 = answeredPlayers.filter(p => (p.quiz_correct_this_round || 0) >= 2).length;
    const correct1 = answeredPlayers.filter(p => (p.quiz_correct_this_round || 0) === 1).length;

    // ✅ B13: คำนวณ bonus รวม
    const totalBonus = (correct2 * QUIZ_BONUS.CORRECT_2) + (correct1 * QUIZ_BONUS.CORRECT_1);

    return (
      <div className="rounded-lg p-3 mb-3" style={{ background: '#A855F715', border: '1px solid #A855F730' }}>
        <p className="text-sm font-bold mb-2" style={{ color: '#A855F7' }}>📝 Quiz Reveal — เฉลย + Bonus</p>
        {questions.map((q, qi) => (
          <div key={qi} className="mb-2 rounded p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-white font-bold mb-1">ข้อ {qi + 1}: {q.question}</p>
            <p className="text-xs" style={{ color: '#00FFB2' }}>คำตอบ: {String.fromCharCode(65 + q.correct)}. {q.choices[q.correct]}</p>
          </div>
        ))}
        {/* ✅ B13: Bonus summary */}
        <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>+฿{QUIZ_BONUS.CORRECT_2} (ถูก 2 ข้อ):</span>
            <span style={{ color: '#00FFB2' }}>{correct2} คน</span>
          </div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>+฿{QUIZ_BONUS.CORRECT_1} (ถูก 1 ข้อ):</span>
            <span style={{ color: '#F59E0B' }}>{correct1} คน</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>💰 Bonus รวม:</span>
            <span className="font-bold" style={{ color: '#00FFB2' }}>฿{totalBonus.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>💡 บอกเด็ก: &quot;ความรู้ = เงิน! ตอบถูกได้ bonus จริง&quot; แล้วกด Next ไปลงทุน</p>
      </div>
    );
  }

  return null;
}
