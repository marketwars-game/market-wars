// FILE: app/play/[roomId]/page.tsx — Player game screen
// VERSION: B8-v2 — Research Quiz 3 phases: quiz → reveal → news_feed
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B2 created | B3 phase sync + timer | B4 InvestmentPanel | B5 event_result + ResultsPanel | B6 leaderboard | B7 final phase | B8 research quiz (v2: 3-phase flow)
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

  // ✅ B8 v2: Quiz state — เลือกคำตอบแต่ไม่เฉลยทันที
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`mw_player_${roomId}`);
    if (saved) { try { const parsed = JSON.parse(saved); setPlayer(parsed); playerIdRef.current = parsed.id; } catch {} }
  }, [roomId]);

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

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!room || room.status !== 'playing') return;
    const duration = PHASE_TIMERS[room.current_phase];
    if (!duration) { setTimeLeft(0); return; }
    setTimeLeft(duration);
    timerRef.current = setInterval(() => { setTimeLeft((prev) => { if (prev <= 1) { clearInterval(timerRef.current!); return 0; } return prev - 1; }); }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [room?.current_phase, room?.status]);

  // ✅ B8 v2: Reset quiz state เมื่อเข้า research phase ใหม่
  useEffect(() => {
    if (room?.current_phase === 'research') {
      const round = room?.current_round || 1;
      if (player?.quiz_answered_round >= round) { setQuizSubmitted(true); } else { setQuizAnswers([null, null]); setQuizSubmitted(false); }
    }
  }, [room?.current_phase, room?.current_round, player?.quiz_answered_round]);

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

  // ✅ B8 v2: เลือกคำตอบ (ไม่เฉลย)
  const handleQuizSelect = (qi: number, ci: number) => {
    if (quizSubmitted) return;
    const newA = [...quizAnswers]; newA[qi] = ci; setQuizAnswers(newA);
  };

  // ✅ B8 v2: Submit quiz
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

  if (loading) return <div className="min-h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-[#00FFB2] text-xl animate-pulse">Loading...</div></div>;

  const phase = room?.current_phase || 'lobby';
  const round = room?.current_round || 1;
  const phaseInfo = PHASE_DISPLAY[phase] || PHASE_DISPLAY.lobby;
  const timerDuration = PHASE_TIMERS[phase] || 0;
  const timerPercent = timerDuration > 0 ? (timeLeft / timerDuration) * 100 : 0;
  const timerColor = timeLeft <= 10 ? '#FF4444' : timeLeft <= 30 ? '#F59E0B' : '#00FFB2';

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

  return (
    <div className="min-h-screen bg-[#0D1117] text-white p-4">
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

      {/* Lobby */}
      {phase === 'lobby' && (
        <div className="bg-[#161b22] rounded-lg p-4">
          <p className="text-[#00FFB2] font-bold mb-2">You&apos;re in! 🎉</p>
          <p className="text-gray-400 text-sm mb-3">Starting money: ฿{STARTING_MONEY.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mb-2">Players in lobby:</p>
          <div className="flex flex-wrap gap-1">{players.map((p) => (<span key={p.id} className={`text-xs px-2 py-1 rounded-full ${p.id === player.id ? 'bg-[#00FFB2]/20 text-[#00FFB2]' : 'bg-gray-800 text-gray-400'}`}>{p.name}</span>))}</div>
        </div>
      )}

      {phase === 'invest' && <InvestmentPanel playerId={player.id} roomId={roomId} money={parseFloat(player.money) || 0} currentPortfolio={player.portfolio || {}} isRebalance={false} />}

      {phase === 'attack' && (
        <div className="bg-[#161b22] rounded-lg p-4 text-center">
          <div className="flex justify-center gap-3 mb-3"><span className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm">⚔️ Attack</span><span className="bg-[#00D4FF] text-[#0D1117] px-3 py-2 rounded-lg text-sm">🛡️ Defend</span><span className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm">🔍 Spy</span></div>
          <p className="text-gray-600 text-xs">(PvP UI in Task B9)</p>
        </div>
      )}

      {phase === 'event' && <div className="bg-[#161b22] rounded-lg p-6 text-center"><div className="text-4xl mb-2">📺</div><p className="text-gray-400">Watch the big screen!</p></div>}

      {phase === 'event_result' && <div className="bg-[#161b22] rounded-lg p-6 text-center"><div className="text-4xl mb-2">📺</div><p className="text-gray-400">Watch the big screen!</p><p className="text-gray-600 text-xs mt-1">Market impact being revealed...</p></div>}

      {phase === 'golden_deal' && (() => { const deal = GOLDEN_DEALS.find((d) => d.round === round); return (<div className="bg-[#161b22] rounded-lg p-4 text-center"><div className="text-3xl mb-2">✨</div><p className="text-[#F59E0B] font-bold">{deal?.name || 'Golden Deal'}</p><p className="text-gray-500 text-xs mt-2">(Golden Deal UI in Task B10)</p></div>); })()}

      {phase === 'results' && <ResultsPanel round={round} player={player} />}

      {/* ✅ B6: Leaderboard */}
      {phase === 'leaderboard' && (() => {
        const currentRanked = [...players].sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0));
        let myRank = 0; let myMovement = 0; const prevRankMap: Record<string, number> = {};
        if (round > 1) { const prev = [...players].sort((a, b) => { const aB = a.round_returns?.[String(round)]?.money_before || parseFloat(a.money) || 0; const bB = b.round_returns?.[String(round)]?.money_before || parseFloat(b.money) || 0; return bB - aB; }); prev.forEach((p, i) => { prevRankMap[p.id] = i + 1; }); }
        const ranked = currentRanked.map((p, i) => { const rank = i + 1; const mov = round > 1 ? (prevRankMap[p.id] || rank) - rank : 0; if (p.id === player.id) { myRank = rank; myMovement = mov; } return { ...p, rank, movement: mov, money: parseFloat(p.money) || 0 }; });
        const top5 = ranked.slice(0, 5); const myMoney = parseFloat(player.money) || 0; const isInTop5 = myRank >= 1 && myRank <= 5; const medals = ['🥇', '🥈', '🥉'];
        return (
          <div className="bg-[#161b22] rounded-lg p-4">
            <div className="text-center mb-4"><div className="text-[10px] tracking-[3px] text-gray-600 mb-1">YOUR RANK</div><div className="text-5xl font-bold text-[#00FFB2]">#{myRank}</div><div className="text-xs text-gray-500 mt-1">of {ranked.length} players</div><div className="text-xl font-bold text-white mt-2">฿{myMoney.toLocaleString()}</div>
              {round > 1 && <div className="mt-2"><span className="inline-block text-xs px-3 py-1 rounded-full" style={{ background: myMovement > 0 ? 'rgba(34,197,94,0.15)' : myMovement < 0 ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.15)', color: myMovement > 0 ? '#22c55e' : myMovement < 0 ? '#ef4444' : '#888' }}>{myMovement > 0 ? `↑${myMovement} from last round` : myMovement < 0 ? `↓${Math.abs(myMovement)} from last round` : '— same position'}</span></div>}
            </div>
            <div className="border-t border-gray-800 my-3" /><div className="text-[10px] tracking-[2px] text-gray-600 mb-2">TOP 5</div>
            <div className="space-y-1">{top5.map((p, i) => { const isMe = p.id === player.id; return (<div key={p.id} className={`flex items-center py-1.5 px-2 rounded text-sm ${isMe ? 'bg-[#00FFB2]/10' : ''}`}><span className="w-6 text-center">{i < 3 ? medals[i] : <span className="text-xs text-gray-500">#{p.rank}</span>}</span><span className={`flex-1 ml-1 ${isMe ? 'text-[#00FFB2] font-bold' : i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-[#CD9B6A]' : 'text-gray-400'}`}>{isMe ? `You (${p.name})` : p.name}</span><span className={`${isMe ? 'text-[#00FFB2] font-bold' : i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-[#CD9B6A]' : 'text-gray-400'}`}>฿{p.money.toLocaleString()}</span></div>); })}</div>
            {!isInTop5 && (<><div className="border-t border-dashed border-gray-700 my-2" /><div className="flex items-center py-1.5 px-2 rounded text-sm bg-[#00FFB2]/10"><span className="w-6 text-center text-xs text-[#00FFB2] font-bold">#{myRank}</span><span className="flex-1 ml-1 text-[#00FFB2] font-bold">You ({player.name})</span><span className="text-[#00FFB2] font-bold">฿{myMoney.toLocaleString()}</span></div></>)}
          </div>
        );
      })()}

      {phase === 'rebalance' && <InvestmentPanel playerId={player.id} roomId={roomId} money={parseFloat(player.money) || 0} currentPortfolio={player.portfolio || {}} isRebalance={true} />}

      {/* ✅ B8 v2: PHASE 1 — Research Quiz (เลือกคำตอบ ไม่เฉลย) */}
      {phase === 'research' && (() => {
        const questions = getQuizForRound(roomId, round);
        const allAnswered = quizAnswers.every((a) => a !== null);
        return (
          <div className="bg-[#161b22] rounded-lg p-4">
            <div className="text-center mb-4">
              <span className="text-[10px] tracking-[1.5px] px-3 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#A855F7' }}>RESEARCH CHALLENGE</span>
              <p className="text-gray-500 text-xs mt-2">ตอบ 2 ข้อ แล้วกด Submit</p>
            </div>
            {questions.map((q, qi) => (
              <div key={qi} className="mb-4">
                <p className="text-white font-bold text-sm mb-2">ข้อ {qi + 1}: {q.question}</p>
                <div className="space-y-1.5">
                  {q.choices.map((choice, ci) => {
                    const isSel = quizAnswers[qi] === ci;
                    return (<button key={ci} onClick={() => handleQuizSelect(qi, ci)} disabled={quizSubmitted} className="w-full text-left rounded-lg p-2.5 transition-all" style={{ border: `1px solid ${isSel ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}`, background: isSel ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.02)', color: isSel ? '#A855F7' : 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{String.fromCharCode(65 + ci)}. {choice}</button>);
                  })}
                </div>
              </div>
            ))}
            {!quizSubmitted ? (
              <button onClick={handleQuizSubmit} disabled={!allAnswered} className="w-full py-3 rounded-lg font-bold text-sm disabled:opacity-40" style={{ background: allAnswered ? 'linear-gradient(135deg, #A855F7, #00D4FF)' : 'rgba(255,255,255,0.1)', color: allAnswered ? '#fff' : 'rgba(255,255,255,0.3)' }}>Submit Quiz</button>
            ) : (
              <div className="text-center py-2"><p className="text-xs" style={{ color: '#A855F7' }}>✓ Quiz submitted — รอ MC เฉลย...</p></div>
            )}
          </div>
        );
      })()}

      {/* ✅ B8 v2: PHASE 2 — Quiz Reveal (เฉลย) */}
      {phase === 'research_reveal' && (() => {
        const questions = getQuizForRound(roomId, round);
        const correctCount = quizAnswers.filter((a, i) => a === questions[i]?.correct).length;
        const unlocked = correctCount >= 2;
        return (
          <div className="bg-[#161b22] rounded-lg p-4">
            <div className="text-center mb-4">
              <span className="text-[10px] tracking-[1.5px] px-3 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#A855F7' }}>QUIZ REVEAL</span>
              <p className="text-white text-lg font-bold mt-2">คุณตอบถูก {correctCount}/2 ข้อ</p>
              {unlocked ? <p className="text-xs mt-1" style={{ color: '#00FFB2' }}>✓ ปลดล็อกข่าวจริง!</p> : <p className="text-xs mt-1" style={{ color: '#EF4444' }}>✗ ไม่ได้ข่าวจริง — ต้องเดาเอง</p>}
            </div>
            {questions.map((q, qi) => {
              const myAns = quizAnswers[qi];
              return (
                <div key={qi} className="mb-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-sm font-bold text-white mb-2">ข้อ {qi + 1}: {q.question}</p>
                  <div className="space-y-1">{q.choices.map((choice, ci) => {
                    const isMy = myAns === ci; const isCorr = ci === q.correct;
                    let bg = 'transparent'; let bdr = 'transparent'; let clr = 'rgba(255,255,255,0.4)';
                    if (isCorr) { bg = 'rgba(0,255,178,0.1)'; bdr = 'rgba(0,255,178,0.3)'; clr = '#00FFB2'; }
                    else if (isMy) { bg = 'rgba(239,68,68,0.1)'; bdr = 'rgba(239,68,68,0.3)'; clr = '#EF4444'; }
                    return (<div key={ci} className="rounded px-2.5 py-1.5 text-xs" style={{ background: bg, border: `1px solid ${bdr}`, color: clr }}>{String.fromCharCode(65 + ci)}. {choice}{isCorr && ' ✓'}{isMy && !isCorr && ' ✗'}</div>);
                  })}</div>
                </div>
              );
            })}
            <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>รอ MC กด Next เพื่อดูข่าวรอบนี้...</p>
          </div>
        );
      })()}

      {/* ✅ B8 v2: PHASE 3 — News Feed (การ์ดข่าว border-left style) */}
      {phase === 'news_feed' && (() => {
        const questions = getQuizForRound(roomId, round);
        const correctCount = quizAnswers.filter((a, i) => a === questions[i]?.correct).length;
        const unlocked = correctCount >= 2;
        const roundNews = ROUND_NEWS.find((n) => n.round === round);
        return (
          <div className="bg-[#161b22] rounded-lg p-4">
            <div className="text-center mb-3">
              <span className="text-[10px] tracking-[1.5px] px-3 py-1 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF' }}>NEWS FEED</span>
              <p className="text-white text-lg font-bold mt-2">ข่าวรอบที่ {round}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>ข่าว 1 ใน 3 เป็นข่าวจริง{unlocked && <span style={{ color: '#00FFB2' }}> — คุณรู้แล้ว!</span>}</p>
            </div>
            <div className="space-y-2 mb-3">
              {roundNews?.news.map((news, i) => {
                const isV = unlocked && news.isReal;
                return (
                  <div key={i} className="rounded-lg overflow-hidden" style={{ borderLeft: `3px solid ${isV ? '#00FFB2' : 'rgba(255,255,255,0.12)'}`, background: isV ? 'rgba(0,255,178,0.05)' : 'rgba(255,255,255,0.02)' }}>
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1.5"><span className="text-[9px] px-2 py-0.5 rounded" style={{ background: isV ? 'rgba(0,255,178,0.12)' : 'rgba(255,255,255,0.05)', color: isV ? '#00FFB2' : 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>{isV ? 'VERIFIED' : 'UNVERIFIED'}</span></div>
                      <div className="flex items-start gap-3"><span className="text-xl leading-none flex-shrink-0">{news.emoji}</span><p className="text-sm leading-relaxed" style={{ color: isV ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}>{news.text}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>อ่านข่าวให้ดี แล้วเตรียมลงทุน! รอ MC กด Next...</p>
          </div>
        );
      })()}

      {/* ✅ B7: Final */}
      {phase === 'final' && (() => {
        const myMoney = parseFloat(player.money) || 0; const sorted = [...players].sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0)); const myRank = sorted.findIndex(p => p.id === player.id) + 1; const totalProfit = myMoney - STARTING_MONEY; const totalReturnPct = (totalProfit / STARTING_MONEY) * 100; const top5 = sorted.slice(0, 5); const isInTop5 = top5.some(p => p.id === player.id); const medals = ['🥇', '🥈', '🥉'];
        const roundReturns: { round: number; pct: number }[] = []; for (let r = 1; r <= TOTAL_ROUNDS; r++) { const rr = player.round_returns?.[String(r)]; if (rr) { const before = parseFloat(rr.money_before) || STARTING_MONEY; const after = parseFloat(rr.money_after) || before; roundReturns.push({ round: r, pct: before > 0 ? ((after - before) / before) * 100 : 0 }); } }
        const maxAbsPct = Math.max(...roundReturns.map(r => Math.abs(r.pct)), 1);
        return (
          <>
            <div className="bg-[#161b22] rounded-lg p-5 text-center mb-3"><div className="text-4xl mb-2">🏆</div><p className="text-xs text-gray-500 mb-1">Your final rank</p><p className="text-5xl font-bold text-[#00FFB2] leading-none">#{myRank}</p><p className="text-xs text-gray-500 mt-1">of {sorted.length} players</p></div>
            <div className="bg-[#161b22] rounded-lg p-4 text-center mb-3"><p className="text-xs text-gray-500 mb-1">Total profit</p><p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-[#00FFB2]' : 'text-[#FF4444]'}`}>{totalProfit >= 0 ? '+' : '-'}฿{Math.abs(totalProfit).toLocaleString()}</p><p className={`text-sm mt-1 ${totalProfit >= 0 ? 'text-[#00FFB2]' : 'text-[#FF4444]'}`}>{totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(1)}% from ฿{STARTING_MONEY.toLocaleString()}</p></div>
            {roundReturns.length > 0 && (<div className="bg-[#161b22] rounded-lg p-4 mb-3"><p className="text-xs text-gray-500 text-center mb-3">Round-by-round returns</p><div className="flex gap-1.5 items-end justify-center" style={{ height: '80px' }}>{roundReturns.map((r) => { const barH = Math.max(4, (Math.abs(r.pct) / maxAbsPct) * 64); const isPos = r.pct >= 0; return (<div key={r.round} className="flex-1 text-center"><div className="mx-auto rounded-t" style={{ height: `${barH}px`, backgroundColor: isPos ? '#00FFB2' : '#FF4444' }} /><p className="text-[10px] mt-0.5" style={{ color: isPos ? '#00FFB2' : '#FF4444' }}>{isPos ? '+' : ''}{r.pct.toFixed(0)}%</p><p className="text-[10px] text-gray-600">R{r.round}</p></div>); })}</div></div>)}
            <div className="bg-[#161b22] rounded-lg p-3 mb-3"><p className="text-xs text-gray-500 text-center mb-2">Top 5</p>{top5.map((p, i) => { const isMe = p.id === player.id; return (<div key={p.id} className={`flex items-center py-1.5 px-1 text-sm ${i < top5.length - 1 ? 'border-b border-gray-800' : ''} ${isMe ? 'bg-[#00FFB2]/10 rounded' : ''}`}><span className={`w-6 text-center text-xs ${isMe ? 'text-[#00FFB2] font-bold' : i < 3 ? (i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-gray-300' : 'text-[#CD9B6A]') : 'text-gray-500'}`}>{i < 3 ? medals[i] : `#${i+1}`}</span><span className={`flex-1 ml-1 ${isMe ? 'text-[#00FFB2] font-bold' : i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-[#CD9B6A]' : 'text-gray-400'}`}>{isMe ? `You (${p.name})` : p.name}</span><span className={`${isMe ? 'text-[#00FFB2] font-bold' : i === 0 ? 'text-[#FFD700]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-[#CD9B6A]' : 'text-gray-400'}`}>฿{(parseFloat(p.money) || 0).toLocaleString()}</span></div>); })}
              {!isInTop5 && (<><div className="border-t border-dashed border-gray-700 my-2" /><div className="flex items-center py-1.5 px-2 rounded text-sm bg-[#00FFB2]/10"><span className="w-6 text-center text-xs text-[#00FFB2] font-bold">#{myRank}</span><span className="flex-1 ml-1 text-[#00FFB2] font-bold">You ({player.name})</span><span className="text-[#00FFB2] font-bold">฿{myMoney.toLocaleString()}</span></div></>)}
            </div>
            <div className="text-center py-2"><p className="text-sm text-[#00FFB2]">Thank you for playing!</p></div>
          </>
        );
      })()}
    </div>
  );
}

export default function PlayerPage() {
  return (<Suspense fallback={<div className="min-h-screen bg-[#0D1117] flex items-center justify-center"><div className="text-[#00FFB2]">Loading...</div></div>}><PlayerContent /></Suspense>);
}
