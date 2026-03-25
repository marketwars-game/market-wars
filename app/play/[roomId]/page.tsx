// FILE: app/play/[roomId]/page.tsx — Player game screen
// VERSION: B8R-v1 — Refactored: ResearchQuiz + LeaderboardView + FinalView extracted
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B2 created | B3 phase sync + timer | B4 InvestmentPanel | B5 event_result + ResultsPanel | B6 leaderboard | B7 final phase | B8 research quiz (v2: 3-phase) | B8R refactor to components
'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  PHASE_DISPLAY,
  PHASE_TIMERS,
  TOTAL_ROUNDS,
  COMPANIES,
  STARTING_MONEY,
  GOLDEN_DEALS,
  ROUND_NEWS,
  getQuizForRound,
} from '@/lib/constants';
import InvestmentPanel from '@/components/player/InvestmentPanel';
import ResultsPanel from '@/components/player/ResultsPanel';
import ResearchQuiz from '@/components/player/ResearchQuiz';
import LeaderboardView from '@/components/player/LeaderboardView';
import FinalView from '@/components/player/FinalView';

function PlayerContent() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [room, setRoom] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playerIdRef = useRef<string | null>(null);
  const [name, setName] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // === Load saved player from localStorage ===
  useEffect(() => {
    const saved = localStorage.getItem(`mw_player_${roomId}`);
    if (saved) { try { const parsed = JSON.parse(saved); setPlayer(parsed); playerIdRef.current = parsed.id; } catch {} }
  }, [roomId]);

  // === Fetch initial data ===
  useEffect(() => {
    async function fetchData() {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single();
      setRoom(roomData);
      const { data: playerData } = await supabase.from('players').select('*').eq('room_id', roomId).order('joined_at', { ascending: true });
      setPlayers(playerData || []);
      if (playerIdRef.current && playerData) {
        const me = playerData.find((p) => p.id === playerIdRef.current);
        if (me) { setPlayer(me); localStorage.setItem(`mw_player_${roomId}`, JSON.stringify(me)); }
      }
      setLoading(false);
    }
    fetchData();
  }, [roomId]);

  // === Realtime subscriptions ===
  useEffect(() => {
    const roomChannel = supabase.channel(`player-room-${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => setRoom(payload.new)).subscribe();
    const playerChannel = supabase.channel(`player-players-${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
      supabase.from('players').select('*').eq('room_id', roomId).order('joined_at', { ascending: true }).then(({ data }) => {
        if (data) setPlayers(data);
        const pid = playerIdRef.current;
        if (pid) { const me = data?.find((p) => p.id === pid); if (me) { setPlayer(me); localStorage.setItem(`mw_player_${roomId}`, JSON.stringify(me)); } }
      });
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

  // === Reset quiz state on new research phase ===
  useEffect(() => {
    if (room?.current_phase === 'research') {
      const round = room?.current_round || 1;
      if (player?.quiz_answered_round >= round) { setQuizSubmitted(true); } else { setQuizAnswers([null, null]); setQuizSubmitted(false); }
    }
  }, [room?.current_phase, room?.current_round, player?.quiz_answered_round]);

  // === Join handler ===
  const handleJoin = async (forceReconnect = false) => {
    setJoining(true); setJoinError('');
    try {
      const res = await fetch('/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), room_id: roomId, force_reconnect: forceReconnect }) });
      const data = await res.json();
      if (data.duplicate && !forceReconnect) { setShowDuplicatePopup(true); setJoining(false); return; }
      if (!res.ok) { setJoinError(data.error || 'Failed to join'); setJoining(false); return; }
      setPlayer(data.player); playerIdRef.current = data.player.id; localStorage.setItem(`mw_player_${roomId}`, JSON.stringify(data.player)); setShowDuplicatePopup(false);
    } catch { setJoinError('Network error'); }
    setJoining(false);
  };

  // === Quiz handlers (passed to ResearchQuiz component) ===
  const handleQuizSelect = (qi: number, ci: number) => {
    if (quizSubmitted) return;
    const newA = [...quizAnswers]; newA[qi] = ci; setQuizAnswers(newA);
  };

  const handleQuizSubmit = async () => {
    if (quizSubmitted) return;
    setQuizSubmitted(true);
    const round = room?.current_round || 1;
    const questions = getQuizForRound(roomId, round);
    const correctCount = quizAnswers.filter((a, i) => a === questions[i].correct).length;
    try {
      await fetch('/api/players/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player_id: player.id, room_id: roomId, round, correct_count: correctCount }) });
    } catch {}
  };

  // === Loading ===
  if (loading) return <div className="min-h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-[#00FFB2] text-xl animate-pulse">Loading...</div></div>;

  const phase = room?.current_phase || 'lobby';
  const round = room?.current_round || 1;
  const phaseInfo = PHASE_DISPLAY[phase] || PHASE_DISPLAY.lobby;
  const timerDuration = PHASE_TIMERS[phase] || 0;
  const timerPercent = timerDuration > 0 ? (timeLeft / timerDuration) * 100 : 0;
  const timerColor = timeLeft <= 10 ? '#FF4444' : timeLeft <= 30 ? '#F59E0B' : '#00FFB2';

  // === Join Screen (no player yet) ===
  if (!player) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-[#00FFB2] mb-1">MARKET WARS</h1>
        <p className="text-gray-400 text-sm mb-6">Room: <span className="text-[#00D4FF] font-mono">{roomId}</span></p>
        <div className="w-full max-w-xs">
          <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-lg focus:border-[#00FFB2] focus:outline-none mb-3" />
          <button onClick={() => handleJoin(false)} disabled={joining || !name.trim()} className="w-full py-3 rounded-lg font-bold text-[#0D1117] bg-[#00FFB2] hover:bg-[#00FFB2]/90 disabled:opacity-50">{joining ? 'Joining...' : 'Join Game'}</button>
          {joinError && <p className="text-red-400 text-sm text-center mt-2">{joinError}</p>}
        </div>
        {showDuplicatePopup && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-[#161b22] rounded-xl p-6 max-w-sm w-full">
              <p className="text-white text-center mb-4">Name &quot;{name}&quot; is already taken. Is this you?</p>
              <button onClick={() => handleJoin(true)} className="w-full py-2 rounded-lg bg-[#00FFB2] text-[#0D1117] font-bold mb-2">Yes, reconnect me</button>
              <button onClick={() => { setShowDuplicatePopup(false); setName(''); }} className="w-full py-2 rounded-lg bg-gray-700 text-white">No, change name</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === Main Game Screen ===
  return (
    <div className="min-h-screen bg-[#0D1117] text-white p-4">
      {/* Player header */}
      <div className="flex items-center justify-between mb-3">
        <div><span className="text-[#00FFB2] font-bold">{player.name}</span><span className="text-gray-500 text-sm ml-2">฿{(parseFloat(player.money) || 0).toLocaleString()}</span></div>
        {phase !== 'lobby' && phase !== 'final' && <span className="bg-[#00FFB2] text-[#0D1117] text-xs font-bold px-2 py-1 rounded-full">R{round}</span>}
      </div>

      {/* Phase info — hide for phases with custom UI */}
      {!['invest', 'rebalance', 'research', 'research_reveal', 'news_feed'].includes(phase) && (
        <div className="text-center py-4">
          <div className="text-3xl mb-1">{phaseInfo.icon}</div>
          <h2 className="text-xl font-bold text-[#00FFB2]">{phaseInfo.name}</h2>
          {phase !== 'lobby' && phase !== 'final' && <p className="text-gray-500 text-xs">Round {round}</p>}
          <p className="text-gray-400 text-sm mt-2">{phaseInfo.playerMessage}</p>
        </div>
      )}

      {/* Timer */}
      {timerDuration > 0 && room?.status === 'playing' && (
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="flex-1 h-1.5 bg-[#2a2d35] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} /></div>
          <span className={`font-mono text-sm font-bold ${timeLeft <= 10 && timeLeft > 0 ? 'animate-pulse' : ''}`} style={{ color: timerColor }}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
        </div>
      )}

      {/* === Lobby === */}
      {phase === 'lobby' && (
        <div className="bg-[#161b22] rounded-lg p-4">
          <p className="text-[#00FFB2] font-bold mb-2">You&apos;re in! 🎉</p>
          <p className="text-gray-400 text-sm mb-3">Starting money: ฿{STARTING_MONEY.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mb-2">Players in lobby:</p>
          <div className="flex flex-wrap gap-1">{players.map((p) => (<span key={p.id} className={`text-xs px-2 py-1 rounded-full ${p.id === player.id ? 'bg-[#00FFB2]/20 text-[#00FFB2]' : 'bg-gray-800 text-gray-400'}`}>{p.name}</span>))}</div>
        </div>
      )}

      {/* === Investment === */}
      {phase === 'invest' && <InvestmentPanel playerId={player.id} roomId={roomId} money={parseFloat(player.money) || 0} currentPortfolio={player.portfolio || {}} isRebalance={false} />}
      {phase === 'rebalance' && <InvestmentPanel playerId={player.id} roomId={roomId} money={parseFloat(player.money) || 0} currentPortfolio={player.portfolio || {}} isRebalance={true} />}

      {/* === Research Quiz (3 phases) — Component === */}
      {(phase === 'research' || phase === 'research_reveal' || phase === 'news_feed') && (
        <ResearchQuiz
          roomId={roomId}
          round={round}
          phase={phase as 'research' | 'research_reveal' | 'news_feed'}
          quizAnswers={quizAnswers}
          quizSubmitted={quizSubmitted}
          onSelect={handleQuizSelect}
          onSubmit={handleQuizSubmit}
        />
      )}

      {/* === Attack placeholder === */}
      {phase === 'attack' && (
        <div className="bg-[#161b22] rounded-lg p-4 text-center">
          <div className="flex justify-center gap-3 mb-3"><span className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm">⚔️ Attack</span><span className="bg-[#00D4FF] text-[#0D1117] px-3 py-2 rounded-lg text-sm">🛡️ Defend</span><span className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm">🔍 Spy</span></div>
          <p className="text-gray-600 text-xs">(PvP UI in Task B9)</p>
        </div>
      )}

      {/* === Event / Event Result — watch big screen === */}
      {phase === 'event' && <div className="bg-[#161b22] rounded-lg p-6 text-center"><div className="text-4xl mb-2">📺</div><p className="text-gray-400">Watch the big screen!</p></div>}
      {phase === 'event_result' && <div className="bg-[#161b22] rounded-lg p-6 text-center"><div className="text-4xl mb-2">📺</div><p className="text-gray-400">Watch the big screen!</p><p className="text-gray-600 text-xs mt-1">Market impact being revealed...</p></div>}

      {/* === Golden Deal placeholder === */}
      {phase === 'golden_deal' && (() => { const deal = GOLDEN_DEALS.find((d) => d.round === round); return (<div className="bg-[#161b22] rounded-lg p-4 text-center"><div className="text-3xl mb-2">✨</div><p className="text-[#F59E0B] font-bold">{deal?.name || 'Golden Deal'}</p><p className="text-gray-500 text-xs mt-2">(Golden Deal UI in Task B10)</p></div>); })()}

      {/* === Results — Component === */}
      {phase === 'results' && <ResultsPanel round={round} player={player} />}

      {/* === Leaderboard — Component === */}
      {phase === 'leaderboard' && <LeaderboardView player={player} players={players} round={round} />}

      {/* === Final — Component === */}
      {phase === 'final' && <FinalView player={player} players={players} />}
    </div>
  );
}

export default function PlayerPage() {
  return (<Suspense fallback={<div className="min-h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-[#00FFB2]">Loading...</div></div>}><PlayerContent /></Suspense>);
}
