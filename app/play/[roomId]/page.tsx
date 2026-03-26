// FILE: app/play/[roomId]/page.tsx — Player game screen
// VERSION: B13-BATCH3-v1 — ChanceCard + Realtime optimize + cut news/rebalance/attack + invest from 0%
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B2 created | B3 phase sync + timer | B4 InvestmentPanel | B5 event_result + ResultsPanel | B6 leaderboard | B7 final phase | B8 research quiz (v2: 3-phase) | B8R refactor to components | B9 MarketFight | B12-UX mini step + year_intro + market_open | B13-BATCH3 ChanceCard + Realtime optimize + cut news/rebalance/attack
'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  PHASE_DISPLAY,
  PHASE_TIMERS,
  TOTAL_ROUNDS,
  COMPANIES,
  STARTING_MONEY,
  YEAR_INTRO_TEXT,
  getQuizForRound,
} from '@/lib/constants';
import { getStepGroupProgress } from '@/lib/game-engine';
import InvestmentPanel from '@/components/player/InvestmentPanel';
import ResultsPanel from '@/components/player/ResultsPanel';
import ResearchQuiz from '@/components/player/ResearchQuiz';
import LeaderboardView from '@/components/player/LeaderboardView';
import FinalView from '@/components/player/FinalView';
import ChanceCard from '@/components/player/ChanceCard';

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

  // === ✅ B13: Realtime subscriptions — Player subscribe เฉพาะ row ตัวเอง ===
  useEffect(() => {
    const roomChannel = supabase.channel(`player-room-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => setRoom(payload.new))
      .subscribe();

    // ✅ B13: subscribe เฉพาะ player id ของตัวเอง (ลด Realtime events 98%)
    const pid = playerIdRef.current;
    let playerChannel: any = null;
    if (pid) {
      playerChannel = supabase.channel(`player-me-${pid}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players', filter: `id=eq.${pid}` }, (payload) => {
          const updated = payload.new;
          setPlayer(updated);
          localStorage.setItem(`mw_player_${roomId}`, JSON.stringify(updated));
        })
        .subscribe();
    }

    return () => {
      supabase.removeChannel(roomChannel);
      if (playerChannel) supabase.removeChannel(playerChannel);
    };
  }, [roomId, playerIdRef.current]);

  // ✅ B13: Fetch players list เมื่อ phase เปลี่ยนเป็น leaderboard/final (ต้องการ players array)
  useEffect(() => {
    const phase = room?.current_phase;
    if (phase === 'leaderboard' || phase === 'final' || phase === 'lobby') {
      supabase.from('players').select('*').eq('room_id', roomId).order('joined_at', { ascending: true })
        .then(({ data }) => { if (data) setPlayers(data); });
    }
  }, [room?.current_phase, roomId]);

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

  // === Quiz handlers ===
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

  // Step group progress for mini indicator
  const stepProgress = getStepGroupProgress(phase);
  const currentStep = stepProgress.find((s) => s.status === 'current');

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

      {/* Player header — name + year badge + money */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[#00FFB2] font-bold text-sm">{player.name}</span>
        {phase !== 'lobby' && phase !== 'final' && (
          <span className="text-[10px] text-[#00D4FF] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.1)' }}>
            ปีที่ {round}
          </span>
        )}
        <span className="text-gray-500 text-xs">฿{(parseFloat(player.money) || 0).toLocaleString()}</span>
      </div>

      {/* Mini step indicator — 6 dots + current label */}
      {phase !== 'lobby' && phase !== 'final' && phase !== 'year_intro' && (
        <div className="flex items-center gap-0 mb-3 px-1">
          <div className="flex items-center gap-0 flex-1">
            {stepProgress.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: step.status === 'current' ? 8 : 6,
                    height: step.status === 'current' ? 8 : 6,
                    background: step.status === 'current' ? '#00FFB2'
                      : step.status === 'done' ? 'rgba(0,255,178,0.35)'
                      : 'rgba(255,255,255,0.1)',
                    boxShadow: step.status === 'current' ? '0 0 6px rgba(0,255,178,0.4)' : 'none',
                  }}
                />
                {i < stepProgress.length - 1 && (
                  <div className="flex-1 h-px mx-1" style={{ background: step.status === 'done' ? 'rgba(0,255,178,0.2)' : 'rgba(255,255,255,0.06)' }} />
                )}
              </div>
            ))}
          </div>
          {currentStep && (
            <span className="text-[10px] text-[#00FFB2] font-medium ml-2 whitespace-nowrap">
              {currentStep.icon} {currentStep.label}
            </span>
          )}
        </div>
      )}

      {/* Timer */}
      {timerDuration > 0 && room?.status === 'playing' && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="flex-1 h-1.5 bg-[#2a2d35] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} /></div>
          <span className={`font-mono text-sm font-bold ${timeLeft <= 10 && timeLeft > 0 ? 'animate-pulse' : ''}`} style={{ color: timerColor }}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
        </div>
      )}

      {/* === Lobby — ✅ B13: ตัด player list (ดูบน Display แทน) === */}
      {phase === 'lobby' && (
        <div className="bg-[#161b22] rounded-lg p-4 text-center">
          <p className="text-[#00FFB2] font-bold text-lg mb-2">You&apos;re in! 🎉</p>
          <p className="text-gray-400 text-sm mb-3">Starting money: ฿{STARTING_MONEY.toLocaleString()}</p>
          <p className="text-gray-500 text-xs">📺 ดูจอใหญ่เพื่อดูรายชื่อผู้เล่น</p>
          <p className="text-gray-600 text-xs mt-1">รอ MC เริ่มเกม...</p>
        </div>
      )}

      {/* ✅ B13: Year Intro — ปรับขั้นตอน: เป่ายิงฉุบ → เปิดการ์ดโชคชะตา */}
      {phase === 'year_intro' && (() => {
        const introText = YEAR_INTRO_TEXT[round] || { title: `ปีที่ ${round} เริ่มแล้ว!`, subtitle: 'เตรียมตัวให้พร้อม' };
        return (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs tracking-[4px] text-[#00D4FF] font-medium mb-1">Y E A R</p>
            <p className="text-6xl font-black text-[#00FFB2] leading-none mb-3">{round}</p>
            <p className="text-base text-white font-medium mb-1">{introText.title}</p>
            <p className="text-sm text-gray-400 mb-5">{introText.subtitle}</p>

            <p className="text-[10px] text-gray-500 tracking-[2px] mb-3">สิ่งที่ต้องทำปีนี้</p>
            <div className="flex flex-col gap-2 w-full max-w-[220px]">
              {[
                { num: 1, text: 'ตอบ Quiz รับ Bonus เงิน' },
                { num: 2, text: 'จัดสรรงบประมาณลงทุน' },
                { num: 3, text: 'เปิดการ์ดโชคชะตา' },
                { num: 4, text: 'ดูผลตลาดประจำปี' },
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: 'rgba(0,255,178,0.15)', color: '#00FFB2' }}>{s.num}</span>
                  {s.text}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-600 mt-6">รอ MC เริ่ม...</p>
          </div>
        );
      })()}

      {/* Market Open — ตลาดเปิด */}
      {phase === 'market_open' && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-5xl mb-3">📈</p>
          <p className="text-xl font-bold text-[#FFD700] mb-2">ตลาดเปิดแล้ว!</p>
          <p className="text-sm text-gray-400 mb-1">เหตุการณ์สำคัญประจำปีที่ {round}</p>
          <p className="text-sm text-gray-400">กำลังจะถูกเปิดเผย...</p>
          <div className="flex items-center gap-1.5 mt-5 text-xs text-gray-500">
            <span>📺</span> ดูจอใหญ่!
          </div>
        </div>
      )}

      {/* Phase info — only for phases without custom UI */}
      {!['invest', 'research', 'research_reveal', 'chance_card', 'year_intro', 'market_open', 'lobby', 'final'].includes(phase) && (
        <div className="text-center py-4">
          <div className="text-3xl mb-1">{phaseInfo.icon}</div>
          <h2 className="text-xl font-bold text-[#00FFB2]">{phaseInfo.name}</h2>
          <p className="text-gray-400 text-sm mt-2">{phaseInfo.playerMessage}</p>
        </div>
      )}

      {/* === Investment — ✅ B13: ทุกรอบเริ่มจาก 0% (currentPortfolio={{}}) === */}
      {phase === 'invest' && <InvestmentPanel playerId={player.id} roomId={roomId} money={parseFloat(player.money) || 0} currentPortfolio={{}} isRebalance={false} />}

      {/* === Research Quiz (2 phases) — ✅ B13: ตัด news_feed === */}
      {(phase === 'research' || phase === 'research_reveal') && (
        <ResearchQuiz
          roomId={roomId}
          round={round}
          phase={phase as 'research' | 'research_reveal'}
          quizAnswers={quizAnswers}
          quizSubmitted={quizSubmitted}
          onSelect={handleQuizSelect}
          onSubmit={handleQuizSubmit}
        />
      )}

      {/* === ✅ B13: Chance Card (แทน MarketFight) === */}
      {phase === 'chance_card' && (
        <ChanceCard
          playerId={player.id}
          roomId={roomId}
          round={round}
          player={player}
        />
      )}

      {/* === Event / Event Result — watch big screen === */}
      {phase === 'event' && <div className="bg-[#161b22] rounded-lg p-6 text-center"><div className="text-4xl mb-2">📺</div><p className="text-gray-400">Watch the big screen!</p></div>}
      {phase === 'event_result' && <div className="bg-[#161b22] rounded-lg p-6 text-center"><div className="text-4xl mb-2">📺</div><p className="text-gray-400">Watch the big screen!</p><p className="text-gray-600 text-xs mt-1">Market impact being revealed...</p></div>}

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
