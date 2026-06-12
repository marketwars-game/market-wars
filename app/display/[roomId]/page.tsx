// FILE: app/display/[roomId]/page.tsx — Display screen (shell)
// VERSION: B16d-v2+perf-v1+B19-v5 — leaderboard rankup sync + event reveal SFX + seenFinal !loading guard (refresh re-animates); auto-replay restored (real fix in FinalPodium); ?debug=1 overlay unchanged
// LAST MODIFIED: 13 Jun 2026
// HISTORY: B1 created | B3 phase sync + timer | B4 submitted count | B5 event_result + results UI | B6 leaderboard | B7 final phase | B8 research quiz | B8R refactor | B9 FightDisplay | B12-UX dashboard layout | B13-BATCH3 ChanceCardDisplay + throttle | B15-v1 projector font+color polish | B15-v2 CSS zoom + header redesign + lobby redesign + QR popup + market_open dramatic | B16a-BATCH0 refactor shell (6 phase components) | B16a-BATCH1 sound: SoundGate + useDisplaySound wiring | B16b-BATCH1 invest live wall props | B16c leaderboard+results spectator SFX | B16d final 4-step + research_reveal sfx | perf-v1 debug overlay | B19 rankup SFX sync to leaderboard hold + event reveal SFX + seenFinal load guard
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PHASE_TIMERS } from '@/lib/constants';
import { getStepGroupProgress } from '@/lib/game-engine';
import { readDebugFlag, dnow, RateMeter } from '@/lib/debug';
import DebugPanel from '@/components/debug/DebugPanel';
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

  // === perf-v1: ?debug=1 instrumentation ===
  const [, setDbgTick] = useState(0);
  const dbg = useRef({ fetchMs: 0, fetchRows: 0, roomCh: '-', plCh: '-', lastEvt: 0 });
  const plRate = useRef(new RateMeter());
  useEffect(() => {
    if (!readDebugFlag()) return;
    const id = setInterval(() => setDbgTick((t) => t + 1), 300);
    return () => clearInterval(id);
  }, []);

  // B16a: sound
  const { isUnlocked, unlock, playSfx, playBgmForPhase } = useDisplaySound();
  const prevPhaseRef = useRef<string | null>(null);
  const prevTimeRef = useRef(0);
  const prevSfxTagRef = useRef<string>('');
  const prevSubmitCountRef = useRef(0);
  const lbTimer = useRef<NodeJS.Timeout | null>(null); // B16c: leaderboard rankup delay

  // B16d: Final 4-step — animate ครั้งแรกที่เข้า step / settled เมื่อกลับมาดูซ้ำ (เผื่อน้องถ่ายรูป)
  // ตัดสิน animate แบบ synchronous ตอน render (ดูด้านล่าง); ตรงนี้แค่ mark ว่าเปิด step ไปแล้วหลัง commit
  const seenFinal = useRef<Set<string>>(new Set());
  const forcedReplayRef = useRef<string | null>(null); // B16d-v2: MC สั่ง replay step ปัจจุบัน
  const phaseRef = useRef<string>('lobby');            // phase ปัจจุบัน (ให้ realtime handler อ่านได้)
  const [replayTick, setReplayTick] = useState(0);     // bump → remount FinalDisplay เพื่อเล่น animation ใหม่ (MC replay)
  useEffect(() => {
    const ph = room?.current_phase;
    if (!loading && ph && ph.startsWith('final')) {   // B19: mark seen only once actually displayed (not during initial load) → refresh re-animates
      seenFinal.current.add(ph);
      forcedReplayRef.current = null; // เข้า step ใหม่ → เคลียร์ replay flag
    }
  }, [room?.current_phase, loading]);

  // B15-v2: CSS zoom — client-side only, update on resize
  useEffect(() => {
    const updateZoom = () => setZoom(Math.min(window.innerWidth / 1280, 1.5));
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  const loadRoomData = useCallback(async () => {
    const t0 = dnow();
    const { data: playerData } = await supabase
      .from('players').select('*').eq('room_id', roomId).order('money', { ascending: false });
    if (playerData) setPlayers(playerData);
    dbg.current.fetchMs = Math.round(dnow() - t0);
    dbg.current.fetchRows = playerData?.length || 0;
    if (readDebugFlag()) console.log(`[display] loadRoomData ${dbg.current.fetchMs}ms rows=${dbg.current.fetchRows}`);
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        // B16d-v2: MC re-set same final phase ('set' action) = สั่งเล่น animation ใหม่ → re-animate
        // Safe now that FinalPodium no longer remounts on re-render (the mid-reveal restart was a nested-component bug, not this).
        const np = (payload.new as any)?.current_phase;
        if (np && typeof np === 'string' && np.startsWith('final') && np === phaseRef.current) {
          forcedReplayRef.current = np;
          setReplayTick((t) => t + 1);
        }
        setRoom(payload.new);
      })
      .subscribe((status) => { dbg.current.roomCh = status; });
    const playerChannel = supabase.channel(`display-players-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        plRate.current.push(); dbg.current.lastEvt = Date.now(); // perf-v1
        throttledReload();
      })
      .subscribe((status) => { dbg.current.plCh = status; });
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
    // themed cue replaces the generic transition on screens that own their SFX
    const isFinalStep = ph.startsWith('final');
    const themed = ph === 'leaderboard' || ph === 'results' || ph === 'event' || isFinalStep;
    if (!isFirst && !themed) playSfx('sfx_transition');
    if (ph === 'market_open') playSfx('sfx_market_bell');
    if (ph === 'research_reveal') playSfx('sfx_reveal');        // B16d: reveal swell synced to stagger
    if (ph === 'event') playSfx('sfx_reveal');                  // B19: dramatic event reveal swell (synced to staggered fade)
    if (ph === 'leaderboard') {
      playSfx('sfx_drumroll');                                  // roll while rows race
      lbTimer.current = setTimeout(() => playSfx('sfx_rankup'), 1700); // B19: ding as ranks lock in (after 900ms hold + 0.9s race)
    }
    if (ph === 'results') playSfx('sfx_reveal');                // swell synced to heatmap wave
    // B16d: final_podium / final_awards / final_ranking → SFX จัดการในตัว component (sync กับ animation)
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
  phaseRef.current = phase; // ให้ realtime handler เทียบ replay ได้
  // B16d: ตัดสิน animate ตอน render — ครั้งแรกของแต่ละ final step = true, กลับมาซ้ำ = false (settled),
  // ยกเว้น MC สั่ง replay step ปัจจุบัน → true อีกครั้ง
  const finalAnimate = phase.startsWith('final')
    ? (!seenFinal.current.has(phase) || forcedReplayRef.current === phase)
    : true;
  const timerDuration = PHASE_TIMERS[phase] || 0;
  const timerPercent = timerDuration > 0 ? (timeLeft / timerDuration) * 100 : 0;
  const timerColor = timeLeft <= 10 ? '#FF4444' : timeLeft <= 30 ? '#F59E0B' : '#00FFB2';
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/?room=${roomId}` : '';
  const stepProgress = getStepGroupProgress(phase);

  let content;
  if (phase === 'lobby') {
    content = <LobbyDisplay players={players} roomId={roomId} joinUrl={joinUrl} zoom={zoom} />;
  } else if (phase === 'final' || phase === 'final_podium' || phase === 'final_awards' || phase === 'final_ranking') {
    content = (
      <div className="h-screen bg-[#0D1117] text-white" style={{ zoom }}>
        <FinalDisplay key={`final-${replayTick}`} players={players} phase={phase as any} animate={finalAnimate} playSfx={playSfx} />
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
      <DebugPanel
        title="DISPLAY"
        pos="bl"
        stats={{
          phase,
          players: players.length,
          'fetch (ms/rows)': `${dbg.current.fetchMs}/${dbg.current.fetchRows}`,
          'q depth': pendingReload.current ? 1 : 0,
          'evt/s': plRate.current.rate(),
          'since evt': dbg.current.lastEvt ? `${Date.now() - dbg.current.lastEvt}ms` : '-',
          roomCh: dbg.current.roomCh,
          plCh: dbg.current.plCh,
        }}
      />
    </>
  );
}
