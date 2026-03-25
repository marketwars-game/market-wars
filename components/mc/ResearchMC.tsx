// FILE: components/mc/ResearchMC.tsx — MC Research Quiz (3 phases)
// VERSION: B8R-v1 — Extracted from mc/[roomId]/page.tsx
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B8 created (inline) | B8R extracted to component
'use client';

import { getQuizForRound, ROUND_NEWS } from '@/lib/constants';

interface ResearchMCProps {
  roomId: string;
  round: number;
  phase: 'research' | 'research_reveal' | 'news_feed';
  players: any[];
  quizSubmittedCount: number;
}

export default function ResearchMC({ roomId, round, phase, players, quizSubmittedCount }: ResearchMCProps) {

  // === PHASE 1: Quiz Breakdown — research phase ===
  if (phase === 'research') {
    const currentRound = round;
    const correctMap: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
    const playerQuizList: { id: string; name: string; score: number; status: 'UNLOCKED' | 'LOCKED' | 'PENDING' }[] = [];
    for (const p of players) {
      const answered = (p.quiz_answered_round || 0) >= currentRound;
      if (!answered) { playerQuizList.push({ id: p.id, name: p.name, score: -1, status: 'PENDING' }); continue; }
      const correct = p.quiz_correct_this_round ?? 0;
      correctMap[correct] = (correctMap[correct] || 0) + 1;
      playerQuizList.push({ id: p.id, name: p.name, score: correct, status: correct >= 2 ? 'UNLOCKED' : 'LOCKED' });
    }
    playerQuizList.sort((a, b) => { if (a.status === 'PENDING' && b.status !== 'PENDING') return 1; if (a.status !== 'PENDING' && b.status === 'PENDING') return -1; return b.score - a.score; });

    return (
      <div className="rounded-lg p-3 mb-3" style={{ background: '#A855F715', border: '1px solid #A855F730' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-mono" style={{ color: '#A855F7' }}>🔍 Quiz submitted</span>
          <span className="text-lg font-bold font-mono" style={{ color: '#00FFB2' }}>{quizSubmittedCount}/{players.length}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="rounded-md p-2 text-center" style={{ background: 'rgba(0,255,178,0.1)' }}><p className="text-lg font-bold" style={{ color: '#00FFB2' }}>{correctMap[2] || 0}</p><p className="text-[10px]" style={{ color: 'rgba(0,255,178,0.6)' }}>ถูก 2 ข้อ (ปลดล็อก)</p></div>
          <div className="rounded-md p-2 text-center" style={{ background: 'rgba(245,158,11,0.1)' }}><p className="text-lg font-bold" style={{ color: '#F59E0B' }}>{correctMap[1] || 0}</p><p className="text-[10px]" style={{ color: 'rgba(245,158,11,0.6)' }}>ถูก 1 ข้อ</p></div>
          <div className="rounded-md p-2 text-center" style={{ background: 'rgba(239,68,68,0.1)' }}><p className="text-lg font-bold" style={{ color: '#EF4444' }}>{correctMap[0] || 0}</p><p className="text-[10px]" style={{ color: 'rgba(239,68,68,0.6)' }}>ถูก 0 ข้อ</p></div>
        </div>
        <div className="rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center px-2 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,17,23,0.5)' }}><span className="flex-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Player</span><span className="w-12 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Score</span><span className="w-16 text-right text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Status</span></div>
          <div className="max-h-40 overflow-y-auto">
            {playerQuizList.map((p) => (
              <div key={p.id} className="flex items-center px-2 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="flex-1 text-xs" style={{ color: p.status === 'PENDING' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)' }}>{p.name}</span>
                <span className="w-12 text-center text-xs font-bold" style={{ color: p.score === 2 ? '#00FFB2' : p.score === 1 ? '#F59E0B' : p.score === 0 ? '#EF4444' : 'rgba(255,255,255,0.25)' }}>{p.score >= 0 ? `${p.score}/2` : '—'}</span>
                <span className="w-16 text-right"><span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: p.status === 'UNLOCKED' ? 'rgba(0,255,178,0.12)' : p.status === 'LOCKED' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)', color: p.status === 'UNLOCKED' ? '#00FFB2' : p.status === 'LOCKED' ? '#EF4444' : 'rgba(255,255,255,0.3)' }}>{p.status}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // === PHASE 2: Quiz Reveal — เฉลย + สถิติ ===
  if (phase === 'research_reveal') {
    const questions = getQuizForRound(roomId, round);
    const answeredPlayers = players.filter(p => (p.quiz_answered_round || 0) >= round);
    const correct2 = answeredPlayers.filter(p => (p.quiz_correct_this_round || 0) >= 2).length;

    return (
      <div className="rounded-lg p-3 mb-3" style={{ background: '#A855F715', border: '1px solid #A855F730' }}>
        <p className="text-sm font-bold mb-2" style={{ color: '#A855F7' }}>📝 Quiz Reveal — เฉลย</p>
        {questions.map((q, qi) => (
          <div key={qi} className="mb-2 rounded p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-white font-bold mb-1">ข้อ {qi + 1}: {q.question}</p>
            <p className="text-xs" style={{ color: '#00FFB2' }}>คำตอบ: {String.fromCharCode(65 + q.correct)}. {q.choices[q.correct]}</p>
          </div>
        ))}
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>ปลดล็อกข่าว: <span style={{ color: '#00FFB2' }}>{correct2} คน</span> จาก {answeredPlayers.length} ที่ตอบ</p>
      </div>
    );
  }

  // === PHASE 3: News Feed — MC เห็นจริง/มั่ว (คนเดียว!) ===
  if (phase === 'news_feed') {
    const roundNews = ROUND_NEWS.find((n) => n.round === round);
    if (!roundNews) return null;
    return (
      <div className="rounded-lg p-3 mb-3" style={{ background: '#00D4FF15', border: '1px solid #00D4FF30' }}>
        <p className="text-sm font-bold mb-2" style={{ color: '#00D4FF' }}>📰 News Feed — ข่าวรอบ {round} (MC เท่านั้นที่เห็น)</p>
        {roundNews.news.map((news, i) => (
          <div key={i} className="flex items-start gap-2 mb-1.5 rounded p-2" style={{ background: news.isReal ? 'rgba(0,255,178,0.08)' : 'rgba(255,255,255,0.03)', borderLeft: `2px solid ${news.isReal ? '#00FFB2' : 'rgba(255,255,255,0.1)'}` }}>
            <span className="text-base flex-shrink-0">{news.emoji}</span>
            <div className="flex-1">
              <p className="text-xs" style={{ color: news.isReal ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}>{news.text}</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: news.isReal ? 'rgba(0,255,178,0.15)' : 'rgba(239,68,68,0.1)', color: news.isReal ? '#00FFB2' : '#EF4444' }}>{news.isReal ? 'จริง' : 'มั่ว'}</span>
            </div>
          </div>
        ))}
        <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>⚠️ ข้อมูลนี้เห็นเฉพาะ MC — อย่าบอกเด็กว่าข่าวไหนจริง!</p>
      </div>
    );
  }

  return null;
}
