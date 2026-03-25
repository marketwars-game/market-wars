// FILE: app/display/[roomId]/page.tsx — Display screen
// VERSION: B8R-v1 — Refactored: ResearchDisplay + EventDisplay + LeaderboardDisplay + FinalDisplay extracted
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B1 created | B3 phase sync + timer | B4 submitted count | B5 event_result + results UI | B6 leaderboard | B7 final phase | B8 research quiz (v2: 3-phase) | B8R refactor to components
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
} from '@/lib/constants';
import ResearchDisplay from '@/components/display/ResearchDisplay';
import EventDisplay from '@/components/display/EventDisplay';
import LeaderboardDisplay from '@/components/display/LeaderboardDisplay';
import FinalDisplay from '@/components/display/FinalDisplay';

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

  if (loading) return <div className="min-h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-[#00FFB2] text-3xl font-bold animate-pulse">MARKET WARS</div></div>;
  if (!room) return <div className="min-h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-red-400 text-2xl">Room not found</div></div>;

  const phase = room.current_phase || 'lobby';
  const round = room.current_round || 1;
  const phaseInfo = PHASE_DISPLAY[phase] || PHASE_DISPLAY.lobby;
  const timerDuration = PHASE_TIMERS[phase] || 0;
  const timerPercent = timerDuration > 0 ? (timeLeft / timerDuration) * 100 : 0;
  const timerColor = timeLeft <= 10 ? '#FF4444' : timeLeft <= 30 ? '#F59E0B' : '#00FFB2';
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/?room=${roomId}` : '';

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center p-8">

      {/* === LOBBY === */}
      {phase === 'lobby' && (
        <div className="text-center">
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
      )}

      {/* === PLAYING PHASES === */}
      {phase !== 'lobby' && phase !== 'final' && (
        <div className="text-center w-full max-w-2xl">
          <div className="text-6xl mb-2">{phaseInfo.icon}</div>
          <h2 className="text-4xl font-bold text-[#00FFB2] mb-1">{phaseInfo.name}</h2>
          <p className="text-lg text-gray-400 mb-6">Round {round} of {TOTAL_ROUNDS}</p>

          {/* Timer bar */}
          {timerDuration > 0 && (
            <div className="flex items-center gap-4 mb-6 max-w-lg mx-auto">
              <div className="flex-1 h-3 bg-[#2a2d35] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} /></div>
              <span className={`font-mono text-2xl font-bold min-w-[70px] text-right ${timeLeft <= 10 && timeLeft > 0 ? 'animate-pulse' : ''}`} style={{ color: timerColor }}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
            </div>
          )}

          <p className="text-xl text-[#00D4FF]">{phaseInfo.displayMessage}</p>

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
            <div className="mt-8">
              <p className="text-6xl font-bold font-mono" style={{ color: '#00FFB2' }}>{submittedCount}/{players.length}</p>
              <p className="text-2xl font-mono mt-2" style={{ color: '#ffffff60' }}>portfolios submitted</p>
            </div>
          )}

          {/* === Event + Event Result + Golden Deal — Component === */}
          {(phase === 'event' || phase === 'event_result' || phase === 'golden_deal') && (
            <EventDisplay round={round} phase={phase as 'event' | 'event_result' | 'golden_deal'} players={players} />
          )}

          {/* === Results === */}
          {phase === 'results' && (
            <div className="mt-8 max-w-lg mx-auto">
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {COMPANIES.map((c) => { const returnPct = RETURN_TABLE[c.id]?.[round - 1] || 0; const isP = returnPct >= 0; return (<div key={c.id} className="bg-[#161b22] rounded-full px-3 py-1.5 flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} /><span className="text-xs text-gray-400">{c.name}</span><span className="text-sm font-bold" style={{ color: isP ? '#22c55e' : '#ef4444' }}>{isP ? '+' : ''}{returnPct}%</span></div>); })}
              </div>
              <div className="text-xs tracking-widest text-gray-600 text-center mb-3">TOP EARNERS THIS ROUND</div>
              <div className="space-y-2">
                {(() => { const earners = players.map((p) => ({ id: p.id, name: p.name, profit: p.round_returns?.[String(round)]?.total_return || 0 })).sort((a, b) => b.profit - a.profit).slice(0, 3); const medals = ['🥇', '🥈', '🥉']; return earners.map((p, i) => (<div key={p.id} className="bg-[#161b22] rounded-lg px-4 py-3 flex items-center justify-between"><div className="flex items-center gap-3"><span className="text-lg">{medals[i]}</span><span className="text-base font-bold text-gray-200">{p.name}</span></div><span className="text-lg font-bold" style={{ color: p.profit >= 0 ? '#22c55e' : '#ef4444' }}>{p.profit >= 0 ? '+' : '-'}฿{Math.abs(p.profit).toLocaleString()}</span></div>)); })()}
              </div>
              <p className="text-gray-600 text-sm text-center mt-4">Check your phone for personal results!</p>
            </div>
          )}

          {/* === Leaderboard — Component === */}
          {phase === 'leaderboard' && <LeaderboardDisplay players={players} round={round} />}

          {/* === Companies during invest === */}
          {phase === 'invest' && (
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg mx-auto">
              {COMPANIES.map((c) => (<div key={c.id} className="bg-[#161b22] rounded-lg p-3 text-center" style={{ borderLeft: `3px solid ${c.color}` }}><div className="text-2xl mb-1">{c.icon}</div><div className="text-sm font-bold" style={{ color: c.color }}>{c.name}</div><div className="text-xs text-gray-500">{c.risk}</div></div>))}
            </div>
          )}
        </div>
      )}

      {/* === FINAL — Component === */}
      {phase === 'final' && <FinalDisplay players={players} />}
    </div>
  );
}
