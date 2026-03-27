// FILE: app/display/[roomId]/page.tsx — Display screen
// VERSION: B15-v4 — fix bit.ly color + room code inline style
// LAST MODIFIED: 27 Mar 2026
// HISTORY: B1 created | B3 phase sync + timer | B4 submitted count | B5 event_result + results UI | B6 leaderboard | B7 final phase | B8 research quiz | B8R refactor | B9 FightDisplay | B12-UX dashboard layout | B13-BATCH3 ChanceCardDisplay + throttle | B15-v1 projector font+color polish | B15-v2 CSS zoom + header redesign + lobby redesign + QR popup + market_open dramatic
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
} from '@/lib/constants';
import { getStepGroupProgress } from '@/lib/game-engine';
import ResearchDisplay from '@/components/display/ResearchDisplay';
import EventDisplay from '@/components/display/EventDisplay';
import LeaderboardDisplay from '@/components/display/LeaderboardDisplay';
import FinalDisplay from '@/components/display/FinalDisplay';
import ChanceCardDisplay from '@/components/display/ChanceCardDisplay';

export default function DisplayScreen() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingReload = useRef(false);
  const throttleTimer = useRef<NodeJS.Timeout | null>(null);

  // B15-v2: CSS zoom — client-side only, update on resize
  useEffect(() => {
    const updateZoom = () => setZoom(Math.min(window.innerWidth / 1280, 1.5));
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  const loadRoomData = useCallback(async () => {
    const { data: playerData } = await supabase
      .from('players').select('*').eq('room_id', roomId).order('money', { ascending: false });
    if (playerData) setPlayers(playerData);
  }, [roomId]);

  const throttledReload = useCallback(() => {
    if (throttleTimer.current) { pendingReload.current = true; return; }
    loadRoomData();
    throttleTimer.current = setTimeout(() => {
      throttleTimer.current = null;
      if (pendingReload.current) { pendingReload.current = false; loadRoomData(); }
    }, 2000);
  }, [loadRoomData]);

  useEffect(() => {
    async function fetchData() {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single();
      setRoom(roomData);
      await loadRoomData();
      setLoading(false);
    }
    fetchData();
  }, [roomId, loadRoomData]);

  useEffect(() => {
    const roomChannel = supabase.channel(`display-room-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => setRoom(payload.new))
      .subscribe();
    const playerChannel = supabase.channel(`display-players-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => throttledReload())
      .subscribe();
    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playerChannel);
      if (throttleTimer.current) clearTimeout(throttleTimer.current);
    };
  }, [roomId, throttledReload]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!room || room.status !== 'playing') return;
    const duration = PHASE_TIMERS[room.current_phase];
    if (!duration) { setTimeLeft(0); return; }
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(timerRef.current!); return 0; } return prev - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [room?.current_phase, room?.status]);

  const submittedCount = players.filter((p) => p.portfolio_submitted_round === room?.current_round).length;
  const quizSubmittedCount = players.filter((p) => (p.quiz_answered_round || 0) >= (room?.current_round || 0)).length;

  if (loading) return <div className="h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-4xl font-bold animate-pulse" style={{ color: '#00FFB2' }}>MARKET WARS</div></div>;
  if (!room) return <div className="h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-red-400 text-3xl">Room not found</div></div>;

  const phase = room.current_phase || 'lobby';
  const round = room.current_round || 1;
  const timerDuration = PHASE_TIMERS[phase] || 0;
  const timerPercent = timerDuration > 0 ? (timeLeft / timerDuration) * 100 : 0;
  const timerColor = timeLeft <= 10 ? '#FF4444' : timeLeft <= 30 ? '#F59E0B' : '#00FFB2';
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/?room=${roomId}` : '';
  const stepProgress = getStepGroupProgress(phase);

  // Header — 1 แถว: MARKET WARS | 6 phases | ปีที่ X/6
  const Header = () => (
    <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '2px solid rgba(0,255,178,0.15)' }}>
      <span className="text-xl font-black tracking-wider" style={{ fontFamily: 'monospace', color: '#00FFB2' }}>MARKET WARS</span>
      <div className="flex items-center gap-0.5">
        {stepProgress.map((step, i) => {
          const isCurrent = step.status === 'current';
          const isDone = step.status === 'done';
          return (
            <div key={step.id} className="flex items-center">
              <span className="px-3 py-1 rounded-full whitespace-nowrap font-semibold" style={{
                fontSize: isCurrent ? '15px' : '13px',
                color: isCurrent ? '#00FFB2' : isDone ? 'rgba(255,255,255,0.45)' : '#ffffff',
                background: isCurrent ? 'rgba(0,255,178,0.15)' : 'transparent',
                border: isCurrent ? '1px solid rgba(0,255,178,0.4)' : '1px solid transparent',
                textDecoration: isDone ? 'line-through' : 'none',
              }}>
                {step.icon} {step.label}
              </span>
              {i < stepProgress.length - 1 && (
                <span className="mx-0.5 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>
              )}
            </div>
          );
        })}
      </div>
      <span className="text-base font-bold px-4 py-1.5 rounded-full whitespace-nowrap" style={{ color: '#00D4FF', background: 'rgba(0,212,255,0.12)' }}>
        ปีที่ {round} / {TOTAL_ROUNDS}
      </span>
    </div>
  );

  // === LOBBY ===
  if (phase === 'lobby') {
    return (
      <div className="h-screen bg-[#0D1117] text-white overflow-hidden relative" style={{ zoom }}>
        <div className="absolute rounded-full pointer-events-none" style={{ width: '600px', height: '600px', background: 'rgba(0,255,178,0.04)', top: '-150px', right: '-150px' }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: '400px', height: '400px', background: 'rgba(0,212,255,0.05)', top: '-80px', right: '80px' }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: '300px', height: '300px', background: 'rgba(0,255,178,0.03)', bottom: '-80px', left: '120px' }} />

        <div className="relative h-full flex items-center">
          {/* Left: QR */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center px-12 h-full" style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
            <div
              className="bg-white rounded-2xl p-4 cursor-pointer mb-5"
              onClick={() => setQrOpen(true)}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
              style={{ transition: 'opacity 0.2s' }}
            >
              {joinUrl && <QRCodeSVG value={joinUrl} size={210} />}
              <p className="text-center text-xs text-gray-400 mt-2">กดเพื่อขยาย</p>
            </div>
            <p className="text-3xl font-bold font-mono tracking-[10px] mb-2" style={{ color: '#00D4FF' }}>{roomId}</p>
            <p className="text-base mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>Scan QR หรือพิมพ์รหัสเข้าร่วม</p>
            <p className="text-base font-semibold" style={{ color: '#00D4FF' }}>bit.ly/marketwars</p>
          </div>

          <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Right: Title + Players */}
          <div className="flex-1 flex flex-col justify-between px-12 py-10 h-full">
            <div>
              <h1 className="font-black tracking-widest leading-tight mb-2" style={{ fontSize: '56px', fontFamily: 'monospace' }}>
                <span style={{ color: '#00FFB2' }}>MARKET</span>{' '}
                <span style={{ color: '#00D4FF' }}>WARS</span>
              </h1>
              <p className="text-xl tracking-[3px]" style={{ color: 'rgba(255,255,255,0.65)' }}>The Investment Game</p>
              <div className="mt-3 h-1 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #00FFB2, #00D4FF)' }} />
            </div>
            <div>
              <p className="text-sm tracking-[3px] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>PLAYERS JOINED</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {players.map((p) => (
                  <span key={p.id} className="px-4 py-2 rounded-full text-lg font-semibold" style={{ background: 'rgba(0,255,178,0.1)', border: '1px solid rgba(0,255,178,0.3)', color: '#00FFB2' }}>
                    {p.name}
                  </span>
                ))}
                {players.length === 0 && <p className="text-lg" style={{ color: 'rgba(255,255,255,0.35)' }}>รอผู้เล่นเข้าร่วม...</p>}
              </div>
              <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>{players.length} players joined</p>
            </div>
          </div>
        </div>

        {/* QR Popup */}
        {qrOpen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 cursor-pointer" style={{ background: 'rgba(0,0,0,0.88)', zIndex: 50 }} onClick={() => setQrOpen(false)}>
            <div className="bg-white rounded-2xl p-6">
              {joinUrl && <QRCodeSVG value={joinUrl} size={320} />}
            </div>
            <p className="text-4xl font-bold font-mono tracking-[12px]" style={{ color: '#00D4FF' }}>{roomId}</p>
            <p className="text-2xl font-semibold" style={{ color: '#00D4FF' }}>bit.ly/marketwars</p>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>กดที่ใดก็ได้เพื่อปิด</p>
          </div>
        )}
      </div>
    );
  }

  // === FINAL ===
  if (phase === 'final') {
    return (
      <div className="h-screen bg-[#0D1117] text-white" style={{ zoom }}>
        <FinalDisplay players={players} />
      </div>
    );
  }

  // === YEAR INTRO ===
  if (phase === 'year_intro') {
    const introText = YEAR_INTRO_TEXT[round] || { title: `ปีที่ ${round} เริ่มแล้ว!`, subtitle: 'เตรียมตัวให้พร้อม' };
    return (
      <div className="h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center relative overflow-hidden" style={{ zoom }}>
        <div className="absolute rounded-full pointer-events-none" style={{ width: '700px', height: '700px', background: 'rgba(0,255,178,0.05)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: '400px', height: '400px', background: 'rgba(0,255,178,0.07)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div className="absolute font-black leading-none select-none pointer-events-none" style={{ fontSize: '320px', color: 'rgba(0,255,178,0.05)', top: '50%', left: '50%', transform: 'translate(-50%,-55%)' }}>{round}</div>
        <div className="text-center z-10">
          <p className="text-xl tracking-[8px] font-semibold mb-4" style={{ color: '#00D4FF' }}>Y E A R</p>
          <p className="font-black leading-none mb-6" style={{ color: '#00FFB2', fontSize: '160px' }}>{round}</p>
          <p className="text-4xl text-white font-bold mb-4">{introText.title}</p>
          <p className="text-2xl mb-10" style={{ color: 'rgba(255,255,255,0.75)' }}>{introText.subtitle}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            {STEP_GROUPS.map((g) => (
              <span key={g.id} className="text-base px-4 py-2 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)' }}>
                {g.icon} {g.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // === MARKET OPEN — B15-v2: dramatic ===
  if (phase === 'market_open') {
    return (
      <div className="h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center relative overflow-hidden" style={{ zoom }}>
        <svg className="absolute bottom-0 left-0 right-0" style={{ height: '45%', opacity: 0.25 }} viewBox="0 0 720 160" preserveAspectRatio="none">
          <polyline points="0,140 60,120 120,130 180,80 240,100 300,60 360,90 420,40 480,70 540,30 600,50 660,20 720,35" fill="none" stroke="#00FFB2" strokeWidth="3" />
          <polyline points="0,140 60,120 120,130 180,80 240,100 300,60 360,90 420,40 480,70 540,30 600,50 660,20 720,35 720,160 0,160" fill="#00FFB2" opacity="0.2" />
        </svg>
        <div className="absolute rounded-full pointer-events-none" style={{ width: '500px', height: '500px', background: 'rgba(255,215,0,0.05)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: '280px', height: '280px', background: 'rgba(255,215,0,0.07)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div className="text-center z-10">
          <p className="text-lg tracking-[4px] mb-5 font-semibold" style={{ color: '#00D4FF' }}>YEAR {round} OF {TOTAL_ROUNDS}</p>
          <p className="text-8xl mb-5">📈</p>
          <p className="text-5xl font-black mb-3" style={{ color: '#FFD700' }}>ตลาดปีที่ {round} กำลังเปิด!</p>
          <p className="text-2xl font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>เตรียมรับมือกับสิ่งที่จะเกิดขึ้น...</p>
          <p className="text-xl" style={{ color: 'rgba(255,255,255,0.65)' }}>มาดูกันว่าปีนี้เกิดอะไรขึ้น...</p>
        </div>
      </div>
    );
  }

  // === PLAYING PHASES ===
  return (
    <div className="h-screen bg-[#0D1117] text-white flex flex-col overflow-hidden" style={{ zoom }}>
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-6 py-3">

        {timerDuration > 0 && (
          <div className="flex items-center gap-4 mb-4 w-full max-w-2xl">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} />
            </div>
            <span className={`font-mono text-lg font-bold ${timeLeft <= 10 && timeLeft > 0 ? 'animate-pulse' : ''}`} style={{ color: timerColor }}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        )}

        {(phase === 'research' || phase === 'research_reveal') && (
          <ResearchDisplay roomId={roomId} round={round} phase={phase as 'research' | 'research_reveal'} players={players} quizSubmittedCount={quizSubmittedCount} />
        )}

        {phase === 'invest' && (
          <div className="text-center w-full">
            <p className="text-7xl font-bold font-mono" style={{ color: '#00FFB2' }}>{submittedCount}/{players.length}</p>
            <p className="text-2xl font-mono mt-3" style={{ color: 'rgba(255,255,255,0.75)' }}>portfolios submitted</p>
            <div className="mt-6 grid grid-cols-6 gap-3 max-w-3xl mx-auto">
              {COMPANIES.map((c) => (
                <div key={c.id} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${c.color}` }}>
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <div className="text-sm font-semibold" style={{ color: c.color }}>{c.name}</div>
                  <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{c.risk}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'chance_card' && <ChanceCardDisplay players={players} round={round} />}

        {(phase === 'event' || phase === 'event_result' || phase === 'golden_deal') && (
          <EventDisplay round={round} phase={phase as 'event' | 'event_result' | 'golden_deal'} players={players} />
        )}

        {phase === 'results' && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {COMPANIES.map((c) => {
                const returnPct = RETURN_TABLE[c.id]?.[round - 1] || 0;
                const isP = returnPct >= 0;
                return (
                  <div key={c.id} className="bg-[#161b22] rounded-full px-4 py-2 flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>{c.name}</span>
                    <span className="text-lg font-bold" style={{ color: isP ? '#22c55e' : '#ef4444' }}>{isP ? '+' : ''}{returnPct}%</span>
                  </div>
                );
              })}
            </div>
            <div className="text-sm tracking-widest text-center mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>TOP EARNERS THIS ROUND</div>
            <div className="space-y-2">
              {(() => {
                const earners = players.map((p) => {
                  const stockProfit = p.round_returns?.[String(round)]?.total_return || 0;
                  const hasChance = ((p.duel_submitted_round || 0) >= round);
                  const chanceProfit = hasChance ? (parseFloat(p.duel_money_change) || 0) : 0;
                  return { id: p.id, name: p.name, profit: stockProfit + chanceProfit, stockProfit, chanceProfit };
                }).sort((a, b) => b.profit - a.profit).slice(0, 3);
                const medals = ['🥇', '🥈', '🥉'];
                return earners.map((p, i) => (
                  <div key={p.id} className="bg-[#161b22] rounded-xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{medals[i]}</span>
                      <span className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold" style={{ color: p.profit >= 0 ? '#22c55e' : '#ef4444' }}>
                        {p.profit >= 0 ? '+' : '-'}฿{Math.abs(p.profit).toLocaleString()}
                      </span>
                      <div className="flex items-center justify-end gap-3 mt-1">
                        <span className="text-sm" style={{ color: p.stockProfit >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)' }}>📈{p.stockProfit >= 0 ? '+' : '-'}฿{Math.abs(p.stockProfit).toLocaleString()}</span>
                        {p.chanceProfit !== 0 && <span className="text-sm" style={{ color: p.chanceProfit > 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)' }}>🃏{p.chanceProfit > 0 ? '+' : '-'}฿{Math.abs(p.chanceProfit).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
            <p className="text-base text-center mt-4" style={{ color: 'rgba(255,255,255,0.65)' }}>Check your phone for personal results!</p>
          </div>
        )}

        {phase === 'leaderboard' && <LeaderboardDisplay players={players} round={round} />}
      </div>
    </div>
  );
}
