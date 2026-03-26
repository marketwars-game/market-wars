// FILE: app/mc/[roomId]/page.tsx — MC Control screen
// VERSION: B13-BATCH3-v1 — Throttle + cut news/attack/rebalance + chance card summary
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B1 created | B3 phase control + timer | B4 submitted count + bug fix | B5 event_result + results | B6 leaderboard | B7 final phase | B8 research quiz (v2: 3-phase) | B8R refactor to components | B9 attack stats | B12-UX full step bar + year_intro + market_open | B13-BATCH3 throttle + cut news/attack/rebalance + chance card
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  PHASE_DISPLAY,
  PHASE_TIMERS,
  TOTAL_ROUNDS,
  COMPANIES,
  MC_TIPS,
  EVENTS,
  RETURN_TABLE,
  STARTING_MONEY,
  YEAR_INTRO_TEXT,
} from '@/lib/constants';
import { getNextPhase, getStepGroupProgress } from '@/lib/game-engine';
import ResearchMC from '@/components/mc/ResearchMC';
import ResultsMC from '@/components/mc/ResultsMC';
import LeaderboardMC from '@/components/mc/LeaderboardMC';
import FinalMC from '@/components/mc/FinalMC';

export default function MCControlRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ B13: Throttle refs
  const pendingReload = useRef(false);
  const throttleTimer = useRef<NodeJS.Timeout | null>(null);

  // === PIN check ===
  useEffect(() => { const pinOk = localStorage.getItem('mc_pin_verified'); if (!pinOk) { router.push('/mc'); return; } }, [router]);

  // === Load players (reusable) ===
  const loadPlayers = useCallback(async () => {
    const { data: playerData } = await supabase
      .from('players').select('*').eq('room_id', roomId).order('joined_at', { ascending: true });
    if (playerData) setPlayers(playerData);
  }, [roomId]);

  // ✅ B13: Throttled reload — max 1 reload ต่อ 2 วินาที
  const throttledReload = useCallback(() => {
    if (throttleTimer.current) {
      pendingReload.current = true;
      return;
    }
    loadPlayers();
    throttleTimer.current = setTimeout(() => {
      throttleTimer.current = null;
      if (pendingReload.current) {
        pendingReload.current = false;
        loadPlayers();
      }
    }, 2000);
  }, [loadPlayers]);

  // === Fetch initial data ===
  useEffect(() => {
    async function fetchData() {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single();
      if (!roomData) { setError('Room not found'); setLoading(false); return; }
      setRoom(roomData);
      await loadPlayers();
      setLoading(false);
    }
    fetchData();
  }, [roomId, loadPlayers]);

  // === Realtime subscriptions ===
  useEffect(() => {
    const roomChannel = supabase.channel(`mc-room-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => { setRoom(payload.new); })
      .subscribe();

    // ✅ B13: Throttled player reload
    const playerChannel = supabase.channel(`mc-players-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        throttledReload();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playerChannel);
      if (throttleTimer.current) clearTimeout(throttleTimer.current);
    };
  }, [roomId, throttledReload]);

  // === Timer ===
  const startTimer = useCallback((phase: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = PHASE_TIMERS[phase]; if (!duration) { setTimeLeft(0); return; }
    setTimeLeft(duration);
    timerRef.current = setInterval(() => { setTimeLeft((prev) => { if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; } return prev - 1; }); }, 1000);
  }, []);

  useEffect(() => {
    if (room?.current_phase && room.status === 'playing') { startTimer(room.current_phase); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [room?.current_phase, room?.status, startTimer]);

  // === Actions ===
  const handleAction = async (action: 'start' | 'next' | 'end') => {
    setActionLoading(true); setError('');
    try { const res = await fetch('/api/game/phase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room_id: roomId, action }) }); const data = await res.json(); if (!res.ok) { setError(data.error || 'Something went wrong'); } } catch (err) { setError('Network error'); }
    setActionLoading(false);
  };

  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const handleEndGame = () => { if (!showEndConfirm) { setShowEndConfirm(true); return; } handleAction('end'); setShowEndConfirm(false); };

  const formatTime = (seconds: number) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m}:${String(s).padStart(2, '0')}`; };
  const getTimerColor = () => { if (timeLeft <= 10) return '#FF4444'; if (timeLeft <= 30) return '#F59E0B'; return '#00FFB2'; };

  const submittedCount = players.filter((p) => p.portfolio_submitted_round === room?.current_round).length;
  const quizSubmittedCount = players.filter((p) => (p.quiz_answered_round || 0) >= (room?.current_round || 0)).length;

  if (loading) return <div className="min-h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-[#00FFB2] text-xl">Loading...</div></div>;
  if (!room) return <div className="min-h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-red-400 text-xl">Room not found</div></div>;

  const phase = room.current_phase || 'lobby';
  const round = room.current_round || 1;
  const phaseInfo = PHASE_DISPLAY[phase] || PHASE_DISPLAY.lobby;
  const timerDuration = PHASE_TIMERS[phase] || 0;
  const timerPercent = timerDuration > 0 ? (timeLeft / timerDuration) * 100 : 0;

  // Step group progress
  const stepProgress = getStepGroupProgress(phase);

  return (
    <div className="min-h-screen bg-[#0D1117] text-white p-4">

      {/* Header — MC CONTROL + year badge */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-lg font-bold text-[#FF6B6B]">MC CONTROL</h1>
          <p className="text-xs text-gray-500">Room: <span className="text-[#00D4FF] font-mono">{roomId}</span></p>
        </div>
        <div className="flex items-center gap-2">
          {phase !== 'lobby' && phase !== 'final' && (
            <span className="text-[10px] text-[#00D4FF] font-medium px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.1)' }}>
              ปีที่ {round} / {TOTAL_ROUNDS}
            </span>
          )}
          <button onClick={() => window.open(`/display/${roomId}`, '_blank')} className="text-[10px] text-[#00D4FF] border border-[#00D4FF]/30 px-2 py-0.5 rounded hover:bg-[#00D4FF]/10">Display ↗</button>
        </div>
      </div>

      {/* Step bar */}
      {phase !== 'lobby' && phase !== 'final' && (
        <div className="flex items-center gap-0.5 px-1 py-1.5 mb-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {stepProgress.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <span
                className="text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap"
                style={{
                  color: step.status === 'current' ? '#00FFB2' : step.status === 'done' ? 'rgba(0,255,178,0.35)' : 'rgba(255,255,255,0.2)',
                  background: step.status === 'current' ? 'rgba(0,255,178,0.1)' : 'transparent',
                  fontWeight: step.status === 'current' ? 600 : 400,
                }}
              >
                {step.icon} {step.label}
              </span>
              {i < stepProgress.length - 1 && (
                <span className="text-[7px] mx-0.5" style={{ color: 'rgba(255,255,255,0.1)' }}>›</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Phase Info Card */}
      <div className="bg-[#161b22] rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-400 text-xs uppercase tracking-wider">{phaseInfo.icon} {phaseInfo.name}</span>
          {phase !== 'lobby' && phase !== 'final' && <span className="text-gray-500 text-xs">Players: {players.length}</span>}
        </div>
        {phase === 'lobby' && (
          <div className="mt-2 space-y-1">
            {players.length === 0 ? <p className="text-gray-500 text-sm">No players yet...</p> : players.map((p) => (<div key={p.id} className="flex justify-between text-sm border-b border-gray-800 pb-1"><span className="text-[#00FFB2]">{p.name}</span><span className="text-gray-500">฿{(parseFloat(p.money) || 0).toLocaleString()}</span></div>))}
            <p className="text-gray-500 text-xs mt-2">{players.length} player{players.length !== 1 ? 's' : ''} in lobby</p>
          </div>
        )}
      </div>

      {/* Year Intro — MC tip */}
      {phase === 'year_intro' && (() => {
        const introText = YEAR_INTRO_TEXT[round] || { title: `ปีที่ ${round}`, subtitle: '' };
        return (
          <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(0,255,178,0.05)', border: '1px solid rgba(0,255,178,0.15)' }}>
            <p className="text-sm font-bold text-[#00FFB2] mb-1">📅 ปีที่ {round} — {introText.title}</p>
            <p className="text-xs text-gray-400">{introText.subtitle}</p>
            <p className="text-xs text-gray-500 mt-2">เด็กๆ เห็น &quot;ปีที่ {round}&quot; บนจอใหญ่ — พูดแนะนำว่าปีนี้จะทำอะไรบ้าง แล้วกด Next</p>
          </div>
        );
      })()}

      {/* Market Open — MC tip */}
      {phase === 'market_open' && (
        <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
          <p className="text-sm font-bold text-[#FFD700] mb-1">📈 ตลาดเปิดแล้ว!</p>
          <p className="text-xs text-gray-400">เด็กๆ เห็น transition &quot;ตลาดเปิดแล้ว!&quot; บนจอใหญ่</p>
          <p className="text-xs text-gray-500 mt-1">สร้างความตื่นเต้น &quot;มาดูกันว่าปีนี้เกิดอะไรขึ้น...&quot; แล้วกด Next เพื่อเปิดข่าว</p>
        </div>
      )}

      {/* === Research Quiz (2 phases) — ✅ B13: ตัด news_feed === */}
      {(phase === 'research' || phase === 'research_reveal') && (
        <ResearchMC roomId={roomId} round={round} phase={phase as 'research' | 'research_reveal'} players={players} quizSubmittedCount={quizSubmittedCount} />
      )}

      {/* === Portfolio Submitted + Player List — ✅ B13: invest only + mini portfolio bar === */}
      {phase === 'invest' && (() => {
        const playerInvestList = players.map(p => {
          const submitted = p.portfolio_submitted_round === round;
          const portfolio = p.portfolio || {};
          const invested = COMPANIES.filter(c => (parseFloat(portfolio[c.id]) || 0) > 0)
            .map(c => ({ id: c.id, color: c.color, pct: parseFloat(portfolio[c.id]) || 0 }));
          return { id: p.id, name: p.name, submitted, invested };
        }).sort((a, b) => { if (a.submitted && !b.submitted) return -1; if (!a.submitted && b.submitted) return 1; return 0; });

        return (
          <div className="rounded-lg p-3 mb-3" style={{ background: '#00D4FF15', border: '1px solid #00D4FF30' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono" style={{ color: '#00D4FF' }}>📊 Portfolio Submitted</span>
              <span className="text-lg font-bold font-mono" style={{ color: '#00FFB2' }}>{submittedCount}/{players.length}</span>
            </div>
            {submittedCount < players.length && <p className="text-xs mb-2" style={{ color: '#ffffff40' }}>กด Next Phase ได้เลย — คนที่ไม่ส่ง = เงินไม่ลงทุนรอบนี้</p>}
            {submittedCount === players.length && players.length > 0 && <p className="text-xs mb-2" style={{ color: '#00FFB2' }}>✓ ทุกคนส่งแล้ว!</p>}
            {/* Player list */}
            <div className="rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="max-h-48 overflow-y-auto">
                {playerInvestList.map((p) => (
                  <div key={p.id} className="flex items-center px-2 py-1.5 gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-xs flex-shrink-0" style={{ color: p.submitted ? '#00FFB2' : 'rgba(255,255,255,0.25)' }}>{p.submitted ? '✅' : '⏳'}</span>
                    <span className="text-xs w-20 truncate" style={{ color: p.submitted ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>{p.name}</span>
                    {/* Mini portfolio bar */}
                    {p.submitted && p.invested.length > 0 ? (
                      <div className="flex-1 h-3 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {p.invested.map((inv) => (
                          <div key={inv.id} style={{ width: `${inv.pct}%`, backgroundColor: inv.color }} title={`${inv.id} ${inv.pct}%`} />
                        ))}
                      </div>
                    ) : p.submitted ? (
                      <span className="text-[9px] text-gray-600 flex-1">Cash 100%</span>
                    ) : (
                      <span className="text-[9px] text-gray-600 flex-1">รอ...</span>
                    )}
                    {p.submitted && <span className="text-[9px] text-gray-500 flex-shrink-0">{p.invested.length} หุ้น</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* === ✅ B13: Chance Card stats + Player List === */}
      {phase === 'chance_card' && (() => {
        const playerCardList = players.map(p => {
          const opened = (p.duel_submitted_round || 0) >= round;
          const amount = opened ? (parseFloat(p.duel_money_change) || 0) : 0;
          return { id: p.id, name: p.name, opened, amount };
        }).sort((a, b) => { if (a.opened && !b.opened) return -1; if (!a.opened && b.opened) return 1; return b.amount - a.amount; });

        const openedCount = playerCardList.filter(p => p.opened).length;
        const positiveCount = playerCardList.filter(p => p.opened && p.amount > 0).length;
        const negativeCount = playerCardList.filter(p => p.opened && p.amount < 0).length;
        const totalChange = playerCardList.filter(p => p.opened).reduce((sum, p) => sum + p.amount, 0);

        return (
          <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono" style={{ color: '#F59E0B' }}>🃏 Chance Card</span>
              <span className="text-lg font-bold font-mono" style={{ color: '#00FFB2' }}>
                {openedCount}/{players.length}
                <span className="text-xs text-gray-500 ml-1">เปิดแล้ว</span>
              </span>
            </div>
            <div className="flex justify-around mt-2 mb-2">
              <div className="text-center">
                <div className="text-sm font-bold" style={{ color: '#00FFB2' }}>{positiveCount}</div>
                <div className="text-[10px] text-gray-500">ได้เงิน</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold" style={{ color: '#EF4444' }}>{negativeCount}</div>
                <div className="text-[10px] text-gray-500">เสียเงิน</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold" style={{ color: totalChange >= 0 ? '#00FFB2' : '#EF4444' }}>
                  {totalChange >= 0 ? '+' : '-'}฿{Math.abs(totalChange).toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-500">รวม</div>
              </div>
            </div>
            {openedCount < players.length && <p className="text-xs mb-2" style={{ color: '#ffffff40' }}>กด Next ได้เลย — คนที่ไม่เปิด = ไม่ได้/เสียเงิน</p>}
            {openedCount === players.length && players.length > 0 && <p className="text-xs mb-2" style={{ color: '#00FFB2' }}>✓ ทุกคนเปิดแล้ว!</p>}
            {/* Player list */}
            <div className="rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="max-h-48 overflow-y-auto">
                {playerCardList.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-2 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: p.opened ? '#00FFB2' : 'rgba(255,255,255,0.25)' }}>{p.opened ? '✅' : '⏳'}</span>
                      <span className="text-xs" style={{ color: p.opened ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>{p.name}</span>
                    </div>
                    {p.opened ? (
                      <span className="text-xs font-bold" style={{ color: p.amount > 0 ? '#00FFB2' : p.amount < 0 ? '#EF4444' : '#F59E0B' }}>
                        {p.amount > 0 ? '+' : p.amount < 0 ? '-' : ''}฿{Math.abs(p.amount).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[9px] text-gray-600">รอ...</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Timer */}
      {timerDuration > 0 && phase !== 'lobby' && phase !== 'final' && (
        <div className="flex items-center gap-3 bg-[#161b22] rounded-lg px-4 py-3 mb-3">
          <div className="flex-1 h-2 bg-[#2a2d35] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPercent}%`, backgroundColor: getTimerColor() }} /></div>
          <span className={`font-mono text-lg font-bold min-w-[50px] text-right ${timeLeft <= 10 && timeLeft > 0 ? 'animate-pulse' : ''}`} style={{ color: getTimerColor() }}>{formatTime(timeLeft)}</span>
        </div>
      )}

      {/* MC Tip */}
      {phase !== 'year_intro' && phase !== 'market_open' && (
        <div className="border-l-4 border-[#00D4FF] bg-[#1a1f2e] rounded-r-lg p-3 mb-3">
          <p className="text-gray-400 text-sm">💡 {phaseInfo.mcTip}</p>
          {MC_TIPS[round] && phase !== 'lobby' && phase !== 'final' && <p className="text-gray-500 text-xs mt-1">📌 Round tip: {MC_TIPS[round]}</p>}
        </div>
      )}

      {/* === Event info for MC === */}
      {phase === 'event' && EVENTS[round - 1] && (
        <div className="bg-[#161b22] rounded-lg p-3 mb-3 border border-[#FF6B6B]/30">
          <p className="text-[#FF6B6B] text-sm font-bold">{EVENTS[round - 1].emoji} {EVENTS[round - 1].title}</p>
          <p className="text-gray-400 text-xs mt-1">{EVENTS[round - 1].description}</p>
        </div>
      )}

      {/* === Event Result return table === */}
      {phase === 'event_result' && EVENTS[round - 1] && (
        <div className="bg-[#161b22] rounded-lg p-3 mb-3 border border-[#00D4FF]/30">
          <p className="text-[#00D4FF] text-sm font-bold mb-2">📊 Market Impact — Round {round}</p>
          <div className="grid grid-cols-2 gap-1">{COMPANIES.map((c) => { const returnPct = RETURN_TABLE[c.id]?.[round - 1] || 0; return (<div key={c.id} className="flex justify-between text-xs py-0.5"><span style={{ color: c.color }}>{c.name}</span><span style={{ color: returnPct >= 0 ? '#22c55e' : '#ef4444' }}>{returnPct > 0 ? '+' : ''}{returnPct}%</span></div>); })}</div>
        </div>
      )}

      {/* === Results — Component === */}
      {phase === 'results' && <ResultsMC round={round} players={players} />}

      {/* === Leaderboard — Component === */}
      {phase === 'leaderboard' && <LeaderboardMC round={round} players={players} />}

      {/* === Final — Component === */}
      {phase === 'final' && <FinalMC players={players} />}

      {/* Error */}
      {error && <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 mb-3 text-red-400 text-sm">{error}</div>}

      {/* Action Buttons */}
      <div className="space-y-2">
        {phase === 'lobby' && <button onClick={() => handleAction('start')} disabled={actionLoading || players.length === 0} className="w-full py-3 rounded-lg font-bold text-[#0D1117] bg-[#00FFB2] hover:bg-[#00FFB2]/90 disabled:opacity-50 disabled:cursor-not-allowed">{actionLoading ? 'Starting...' : `Start Game (${players.length} players)`}</button>}

        {room.status === 'playing' && phase !== 'final' && (() => {
          const isLeaderboard = phase === 'leaderboard';
          const isLastRound = round >= TOTAL_ROUNDS;
          let nextLabel = '';
          if (isLeaderboard) {
            nextLabel = isLastRound ? 'Next → Final Summary 🏆' : `Next Year → ปีที่ ${round + 1}`;
          } else {
            const next = getNextPhase(phase, round);
            const nextName = next ? (PHASE_DISPLAY[next.phase]?.name || next.phase) : 'End';
            nextLabel = `Next → ${nextName}`;
          }
          return <button onClick={() => handleAction('next')} disabled={actionLoading} className="w-full py-3 rounded-lg font-bold text-[#0D1117] bg-[#00D4FF] hover:bg-[#00D4FF]/90 disabled:opacity-50">{actionLoading ? 'Loading...' : nextLabel}</button>;
        })()}

        {room.status === 'playing' && phase !== 'final' && (
          <div className="flex justify-end mt-2">
            {showEndConfirm ? (
              <div className="flex items-center gap-2"><span className="text-red-400 text-sm">End game now?</span><button onClick={handleEndGame} disabled={actionLoading} className="px-4 py-2 rounded bg-red-600 text-white text-sm font-bold hover:bg-red-700">Yes, End Game</button><button onClick={() => setShowEndConfirm(false)} className="px-4 py-2 rounded bg-gray-700 text-white text-sm hover:bg-gray-600">Cancel</button></div>
            ) : <button onClick={() => setShowEndConfirm(true)} className="px-4 py-2 rounded bg-red-900/50 text-red-400 text-sm border border-red-800 hover:bg-red-900">End Game</button>}
          </div>
        )}
      </div>
    </div>
  );
}
