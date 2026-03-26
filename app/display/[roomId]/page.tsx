// FILE: app/display/[roomId]/page.tsx — Display screen
// VERSION: B12-UX-v1 — New dashboard layout + year_intro + market_open + step indicator
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B1 created | B3 phase sync + timer | B4 submitted count | B5 event_result + results UI | B6 leaderboard | B7 final phase | B8 research quiz (v2: 3-phase) | B8R refactor to components | B9 FightDisplay | B9-v2 fix earners | B12-UX dashboard layout + year_intro + market_open + step indicator
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import {
  PHASE_DISPLAY,
  PHASE_TIMERS,
  TOTAL_ROUNDS,
  COMPANIES,
  RETURN_TABLE,
  STARTING_MONEY,
  STEP_GROUPS,
  YEAR_INTRO_TEXT,
  EVENTS,
} from '@/lib/constants';
import { getStepGroupProgress } from '@/lib/game-engine';
import ResearchDisplay from '@/components/display/ResearchDisplay';
import EventDisplay from '@/components/display/EventDisplay';
import LeaderboardDisplay from '@/components/display/LeaderboardDisplay';
import FinalDisplay from '@/components/display/FinalDisplay';
import FightDisplay from '@/components/display/FightDisplay';

export default function DisplayScreen() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // === Fetch initial data ===
  useEffect(() => {
    async function fetchData() {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single();
      setRoom(roomData);
      const { data: playerData } = await supabase.from('players').select('*').eq('room_id', roomId).order('joined_at', { ascending: true });
      setPlayers(playerData || []);
      setLoading(false);
    }
    fetchData();
  }, [roomId]);

  // === Realtime subscriptions ===
  useEffect(() => {
    const roomChannel = supabase.channel(`display-room-${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => setRoom(payload.new)).subscribe();
    const playerChannel = supabase.channel(`display-players-${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
      supabase.from('players').select('*').eq('room_id', roomId).order('money', { ascending: false }).then(({ data }) => { if (data) setPlayers(data); });
    }).subscribe();
    return () => { supabase.removeChannel(roomChannel); supabase.removeChannel(playerChannel); };
  }, [roomId]);

  // === Timer ===
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!room || room.status !== 'playing') return;
    const duration = PHASE_TIMERS[room.current_phase];
    if (!duration) { setTimeLeft(0); return; }
    setTimeLeft(duration);
    timerRef.current = setInterval(() => { setTimeLeft((prev) => { if (prev <= 1) { clearInterval(timerRef.current!); return 0; } return prev - 1; }); }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [room?.current_phase, room?.status]);

  const submittedCount = players.filter((p) => p.portfolio_submitted_round === room?.current_round).length;
  const quizSubmittedCount = players.filter((p) => (p.quiz_answered_round || 0) >= (room?.current_round || 0)).length;

  if (loading) return <div className="h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-[#00FFB2] text-3xl font-bold animate-pulse">MARKET WARS</div></div>;
  if (!room) return <div className="h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-red-400 text-2xl">Room not found</div></div>;

  const phase = room.current_phase || 'lobby';
  const round = room.current_round || 1;
  const phaseInfo = PHASE_DISPLAY[phase] || PHASE_DISPLAY.lobby;
  const timerDuration = PHASE_TIMERS[phase] || 0;
  const timerPercent = timerDuration > 0 ? (timeLeft / timerDuration) * 100 : 0;
  const timerColor = timeLeft <= 10 ? '#FF4444' : timeLeft <= 30 ? '#F59E0B' : '#00FFB2';
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/?room=${roomId}` : '';

  // ✅ B12-UX: Step group progress
  const stepProgress = getStepGroupProgress(phase);

  // ============================================================
  // === LOBBY — ไม่เปลี่ยน layout ===
  // ============================================================
  if (phase === 'lobby') {
    return (
      <div className="h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-5xl font-bold text-[#00FFB2] mb-2">MARKET WARS</h1>
        <p className="text-xl text-gray-400 mb-8">The Investment Game</p>
        <div className="bg-white p-6 rounded-2xl inline-block mb-4">{joinUrl && <QRCodeSVG value={joinUrl} size={200} />}</div>
        <p className="text-3xl font-mono font-bold text-[#00D4FF] tracking-[8px] mb-4">{roomId}</p>
        <p className="text-gray-400 mb-6">Scan QR or enter room code to join!</p>
        <div className="max-w-md mx-auto">
          {players.length === 0 ? <p className="text-gray-600">Waiting for players...</p> : (
            <div className="flex flex-wrap gap-2 justify-center">{players.map((p) => (<span key={p.id} className="bg-[#161b22] text-[#00FFB2] px-3 py-1 rounded-full text-sm">{p.name}</span>))}</div>
          )}
          <p className="text-gray-500 text-sm mt-3">{players.length} player{players.length !== 1 ? 's' : ''} joined</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // === FINAL — เต็มจอ ไม่มี header/step bar ===
  // ============================================================
  if (phase === 'final') {
    return (
      <div className="h-screen bg-[#0D1117] text-white">
        <FinalDisplay players={players} />
      </div>
    );
  }

  // ============================================================
  // === YEAR INTRO — splash เต็มจอ ===
  // ============================================================
  if (phase === 'year_intro') {
    const introText = YEAR_INTRO_TEXT[round] || { title: `ปีที่ ${round} เริ่มแล้ว!`, subtitle: 'เตรียมตัวให้พร้อม' };
    return (
      <div className="h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background year number */}
        <div className="absolute text-[200px] font-black leading-none select-none pointer-events-none" style={{ color: 'rgba(0,255,178,0.04)', top: '50%', left: '50%', transform: 'translate(-50%,-55%)' }}>{round}</div>

        <div className="text-center z-10">
          <p className="text-sm tracking-[6px] text-[#00D4FF] font-medium mb-1">Y E A R</p>
          <p className="text-8xl font-black text-[#00FFB2] leading-none mb-3">{round}</p>
          <p className="text-2xl text-white font-medium mb-2">{introText.title}</p>
          <p className="text-base text-gray-400 mb-8">{introText.subtitle}</p>

          {/* Step pills */}
          <div className="flex gap-2 justify-center flex-wrap">
            {STEP_GROUPS.map((g) => (
              <span key={g.id} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                {g.icon} {g.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // === MARKET OPEN — splash transition ===
  // ============================================================
  if (phase === 'market_open') {
    return (
      <div className="h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center relative overflow-hidden">
        {/* Chart line background */}
        <svg className="absolute bottom-0 left-0 right-0 opacity-10" style={{ height: '40%' }} viewBox="0 0 720 160" preserveAspectRatio="none">
          <polyline points="0,140 60,120 120,130 180,80 240,100 300,60 360,90 420,40 480,70 540,30 600,50 660,20 720,35" fill="none" stroke="#00FFB2" strokeWidth="2" />
          <polyline points="0,140 60,120 120,130 180,80 240,100 300,60 360,90 420,40 480,70 540,30 600,50 660,20 720,35 720,160 0,160" fill="#00FFB2" opacity="0.15" />
        </svg>

        <div className="text-center z-10">
          <p className="text-xs tracking-[3px] text-[#00D4FF] mb-4">YEAR {round}</p>
          <p className="text-5xl mb-2">📈</p>
          <p className="text-3xl font-bold text-[#FFD700] mb-2">ตลาดเปิดแล้ว!</p>
          <p className="text-lg text-gray-400">มาดูกันว่าปีนี้เกิดอะไรขึ้น...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // === PLAYING PHASES — Dashboard layout ===
  // ============================================================
  return (
    <div className="h-screen bg-[#0D1117] text-white flex flex-col overflow-hidden">

      {/* === Header bar === */}
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-bold text-[#00FFB2] tracking-wider">MARKET WARS</span>
        <span className="text-[11px] text-[#00D4FF] font-medium px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.1)' }}>
          ปีที่ {round} / {TOTAL_ROUNDS}
        </span>
      </div>

      {/* === Step indicator bar === */}
      <div className="flex items-center gap-0.5 px-3 py-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {stepProgress.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <span
              className="text-[10px] px-2 py-0.5 rounded whitespace-nowrap"
              style={{
                color: step.status === 'current' ? '#00FFB2' : step.status === 'done' ? 'rgba(0,255,178,0.35)' : 'rgba(255,255,255,0.2)',
                background: step.status === 'current' ? 'rgba(0,255,178,0.1)' : 'transparent',
                fontWeight: step.status === 'current' ? 600 : 400,
              }}
            >
              {step.icon} {step.label}
            </span>
            {i < stepProgress.length - 1 && (
              <span className="text-[8px] mx-0.5" style={{ color: 'rgba(255,255,255,0.1)' }}>›</span>
            )}
          </div>
        ))}
      </div>

      {/* === Main content area — flex-1 fills remaining space === */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-4 py-2">

        {/* Timer bar (if applicable) */}
        {timerDuration > 0 && (
          <div className="flex items-center gap-3 mb-3 w-full max-w-md">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} />
            </div>
            <span className={`font-mono text-sm font-bold ${timeLeft <= 10 && timeLeft > 0 ? 'animate-pulse' : ''}`} style={{ color: timerColor }}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* === Research Quiz (3 phases) — Component === */}
        {(phase === 'research' || phase === 'research_reveal' || phase === 'news_feed') && (
          <ResearchDisplay
            roomId={roomId}
            round={round}
            phase={phase as 'research' | 'research_reveal' | 'news_feed'}
            players={players}
            quizSubmittedCount={quizSubmittedCount}
          />
        )}

        {/* === Submitted count during invest/rebalance === */}
        {(phase === 'invest' || phase === 'rebalance') && (
          <div className="text-center">
            <p className="text-6xl font-bold font-mono" style={{ color: '#00FFB2' }}>{submittedCount}/{players.length}</p>
            <p className="text-xl font-mono mt-2" style={{ color: '#ffffff40' }}>portfolios submitted</p>
            <div className="mt-4 grid grid-cols-3 gap-2 max-w-sm mx-auto">
              {COMPANIES.map((c) => (
                <div key={c.id} className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', borderLeft: `2px solid ${c.color}` }}>
                  <div className="text-lg">{c.icon}</div>
                  <div className="text-[10px] font-semibold" style={{ color: c.color }}>{c.name}</div>
                  <div className="text-[9px] text-gray-500">{c.risk}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === Market Fight (B9) — Component === */}
        {(phase === 'attack' || phase === 'attack_result') && (
          <FightDisplay players={players} round={round} />
        )}

        {/* === Event + Event Result + Golden Deal — Component === */}
        {(phase === 'event' || phase === 'event_result' || phase === 'golden_deal') && (
          <EventDisplay round={round} phase={phase as 'event' | 'event_result' | 'golden_deal'} players={players} />
        )}

        {/* === Results === */}
        {phase === 'results' && (
          <div className="w-full max-w-lg mx-auto">
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {COMPANIES.map((c) => {
                const returnPct = RETURN_TABLE[c.id]?.[round - 1] || 0;
                const isP = returnPct >= 0;
                return (
                  <div key={c.id} className="bg-[#161b22] rounded-full px-3 py-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-xs text-gray-400">{c.name}</span>
                    <span className="text-sm font-bold" style={{ color: isP ? '#22c55e' : '#ef4444' }}>{isP ? '+' : ''}{returnPct}%</span>
                  </div>
                );
              })}
            </div>
            <div className="text-xs tracking-widest text-gray-600 text-center mb-2">TOP EARNERS THIS ROUND</div>
            <div className="space-y-1.5">
              {(() => {
                const earners = players.map((p) => ({
                  id: p.id, name: p.name,
                  profit: (p.round_returns?.[String(round)]?.total_return || 0) + (parseFloat(p.duel_money_change) || 0),
                })).sort((a, b) => b.profit - a.profit).slice(0, 3);
                const medals = ['🥇', '🥈', '🥉'];
                return earners.map((p, i) => (
                  <div key={p.id} className="bg-[#161b22] rounded-lg px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{medals[i]}</span>
                      <span className="text-base font-bold text-gray-200">{p.name}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: p.profit >= 0 ? '#22c55e' : '#ef4444' }}>
                      {p.profit >= 0 ? '+' : '-'}฿{Math.abs(p.profit).toLocaleString()}
                    </span>
                  </div>
                ));
              })()}
            </div>
            <p className="text-gray-600 text-xs text-center mt-3">Check your phone for personal results!</p>
          </div>
        )}

        {/* === Leaderboard — Component === */}
        {phase === 'leaderboard' && <LeaderboardDisplay players={players} round={round} />}
      </div>
    </div>
  );
}
