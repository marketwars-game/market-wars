// FILE: app/display/[roomId]/page.tsx — Display screen (shell)
// VERSION: B16c-v1 — leaderboard drumroll/rankup + results reveal swell SFX (post-round spectator)
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B1 created | B3 phase sync + timer | B4 submitted count | B5 event_result + results UI | B6 leaderboard | B7 final phase | B8 research quiz | B8R refactor | B9 FightDisplay | B12-UX dashboard layout | B13-BATCH3 ChanceCardDisplay + throttle | B15-v1 projector font+color polish | B15-v2 CSS zoom + header redesign + lobby redesign + QR popup + market_open dramatic | B16a-BATCH0 refactor shell (6 phase components) | B16a-BATCH1 sound: SoundGate + useDisplaySound wiring | B16b-BATCH1 invest live wall props | B16c leaderboard+results spectator SFX
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PHASE_TIMERS } from '@/lib/constants';
import { getStepGroupProgress } from '@/lib/game-engine';
import { useDisplaySound } from '@/hooks/useDisplaySound';
import type { SfxKey } from '@/lib/sound';
import ResearchDisplay from '@/components/display/ResearchDisplay';
import EventDisplay from '@/components/display/EventDisplay';
import LeaderboardDisplay from '@/components/display/LeaderboardDisplay';
import FinalDisplay from '@/components/display/FinalDisplay';
import ChanceCardDisplay from '@/components/display/ChanceCardDisplay';
import DisplayHeader from '@/components/display/DisplayHeader';
import LobbyDisplay from '@/components/display/LobbyDisplay';
import YearIntroDisplay from '@/components/display/YearIntroDisplay';
import MarketOpenDisplay from '@/components/display/MarketOpenDisplay';
import InvestDisplay from '@/components/display/InvestDisplay';
import ResultsDisplay from '@/components/display/ResultsDisplay';
import SoundGate from '@/components/display/SoundGate';

export default function DisplayScreen() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [zoom, setZoom] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingReload = useRef(false);
  const throttleTimer = useRef<NodeJS.Timeout | null>(null);

  // B16a: sound
  const { isUnlocked, unlock, playSfx, playBgmForPhase } = useDisplaySound();
  const prevPhaseRef = useRef<string | null>(null);
  const prevTimeRef = useRef(0);
  const prevSfxTagRef = useRef<string>('');
  const prevSubmitCountRef = useRef(0);
  const lbTimer = useRef<NodeJS.Timeout | null>(null); // B16c: leaderboard rankup delay

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

  // B16a: phase change → BGM crossfade + transition/bell SFX
  // B16c: leaderboard drumroll→rankup, results reveal swell
  useEffect(() => {
    if (!isUnlocked) return;
    const ph = room?.current_phase;
    if (!ph) return;
    if (prevPhaseRef.current === ph) return;
    const isFirst = prevPhaseRef.current === null;
    prevPhaseRef.current = ph;
    if (lbTimer.current) { clearTimeout(lbTimer.current); lbTimer.current = null; }
    playBgmForPhase(ph);
    // themed cue replaces the generic transition on the two post-round spectator screens
    const themed = ph === 'leaderboard' || ph === 'results';
    if (!isFirst && !themed) playSfx('sfx_transition');
    if (ph === 'market_open') playSfx('sfx_market_bell');
    if (ph === 'leaderboard') {
      playSfx('sfx_drumroll');                                  // roll while rows race
      lbTimer.current = setTimeout(() => playSfx('sfx_rankup'), 1100); // ding as ranks settle / dark horse pops
    }
    if (ph === 'results') playSfx('sfx_reveal');                // swell synced to heatmap wave
  }, [room?.current_phase, isUnlocked, playBgmForPhase, playSfx]);

  // B16a: countdown tick (last 10s) + time-up SFX
  useEffect(() => {
    if (!isUnlocked) { prevTimeRef.current = timeLeft; return; }
    const prev = prevTimeRef.current;
    prevTimeRef.current = timeLeft;
    const dur = room?.current_phase ? (PHASE_TIMERS[room.current_phase] || 0) : 0;
    if (dur <= 0) return;
    if (timeLeft > 0 && timeLeft <= 10 && timeLeft < prev) playSfx('sfx_countdown');
    if (timeLeft === 0 && prev === 1) playSfx('sfx_timeup');
  }, [timeLeft, isUnlocked, room?.current_phase, playSfx]);

  // B16b: per-wave SFX when submitted count rises (sfx_join / sfx_card_flip)
  // ผูกกับ count ที่เพิ่มขึ้นต่อรอบ throttled reload → 1 เสียงต่อคลื่น (ไม่รัวต่อคน)
  useEffect(() => {
    const ph = room?.current_phase;
    const r = room?.current_round || 0;
    if (!ph) return;
    let count = 0;
    let key: SfxKey | null = null;
    if (ph === 'research') {
      count = players.filter((p) => (p.quiz_answered_round || 0) >= r).length;
      key = 'sfx_join';
    } else if (ph === 'invest') {
      count = players.filter((p) => p.portfolio_submitted_round === r).length;
      key = 'sfx_join';
    } else if (ph === 'chance_card') {
      count = players.filter((p) => (p.duel_submitted_round || 0) >= r).length;
      key = 'sfx_card_flip';
    } else {
      prevSfxTagRef.current = `${ph}-${r}`;
      prevSubmitCountRef.current = 0;
      return;
    }
    const tag = `${ph}-${r}`;
    // เข้า phase/รอบใหม่ → ตั้ง baseline ไม่เล่นเสียง (กันเสียงตอน reconnect/เข้าหน้า)
    if (prevSfxTagRef.current !== tag) {
      prevSfxTagRef.current = tag;
      prevSubmitCountRef.current = count;
      return;
    }
    if (isUnlocked && key && count > prevSubmitCountRef.current) playSfx(key);
    prevSubmitCountRef.current = count;
  }, [players, room?.current_phase, room?.current_round, isUnlocked, playSfx]);

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

  let content;
  if (phase === 'lobby') {
    content = <LobbyDisplay players={players} roomId={roomId} joinUrl={joinUrl} zoom={zoom} />;
  } else if (phase === 'final') {
    content = (
      <div className="h-screen bg-[#0D1117] text-white" style={{ zoom }}>
        <FinalDisplay players={players} />
      </div>
    );
  } else if (phase === 'year_intro') {
    content = <YearIntroDisplay round={round} zoom={zoom} />;
  } else if (phase === 'market_open') {
    content = <MarketOpenDisplay round={round} zoom={zoom} />;
  } else {
    content = (
      <div className="h-screen bg-[#0D1117] text-white flex flex-col overflow-hidden" style={{ zoom }}>
        <DisplayHeader steps={stepProgress} round={round} />
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
            <InvestDisplay players={players} round={round} />
          )}

          {phase === 'chance_card' && <ChanceCardDisplay players={players} round={round} />}

          {(phase === 'event' || phase === 'event_result' || phase === 'golden_deal') && (
            <EventDisplay round={round} phase={phase as 'event' | 'event_result' | 'golden_deal'} players={players} />
          )}

          {phase === 'results' && (
            <ResultsDisplay players={players} round={round} />
          )}

          {phase === 'leaderboard' && <LeaderboardDisplay players={players} round={round} />}
        </div>
      </div>
    );
  }

  return (
    <>
      {content}
      {!isUnlocked && <SoundGate onUnlock={unlock} />}
    </>
  );
}
