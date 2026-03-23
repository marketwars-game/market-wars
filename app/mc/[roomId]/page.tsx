// FILE: app/mc/[roomId]/page.tsx — MC Control screen
// VERSION: B5 — เพิ่ม event_result return table + results summary
// LAST MODIFIED: Task B5 (23 Mar 2026)
// HISTORY: B1 created | B3 phase control + timer | B4 submitted count + bug fix | B5 event_result + results
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  PHASE_DISPLAY,
  PHASE_TIMERS,
  TOTAL_ROUNDS,
  GOLDEN_DEAL_ROUNDS,
  COMPANIES,
  MC_TIPS,
  EVENTS,
  GOLDEN_DEALS,
  RETURN_TABLE,
} from '@/lib/constants';
import { getAllGameSteps } from '@/lib/game-engine';

// ==============================================
// MC Control Room — หน้าควบคุมเกมของ MC
// ==============================================
export default function MCControlRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  // --- State ---
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- PIN Check ---
  useEffect(() => {
    const pinOk = localStorage.getItem('mc_pin_verified');
    if (!pinOk) {
      router.push('/mc');
      return;
    }
  }, [router]);

  // --- Fetch room + players ---
  useEffect(() => {
    async function fetchData() {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (!roomData) {
        setError('Room not found');
        setLoading(false);
        return;
      }
      setRoom(roomData);

      const { data: playerData } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

      setPlayers(playerData || []);
      setLoading(false);
    }
    fetchData();
  }, [roomId]);

  // --- Realtime subscriptions ---
  useEffect(() => {
    const roomChannel = supabase
      .channel(`mc-room-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          setRoom(payload.new);
        }
      )
      .subscribe();

    const playerChannel = supabase
      .channel(`mc-players-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        () => {
          // Re-fetch all players on any change
          supabase
            .from('players')
            .select('*')
            .eq('room_id', roomId)
            .order('joined_at', { ascending: true })
            .then(({ data }) => {
              if (data) setPlayers(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playerChannel);
    };
  }, [roomId]);

  // --- Timer logic ---
  const startTimer = useCallback((phase: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = PHASE_TIMERS[phase];
    if (!duration) {
      setTimeLeft(0);
      return;
    }
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Start timer when phase changes
  useEffect(() => {
    if (room?.current_phase && room.status === 'playing') {
      startTimer(room.current_phase);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.current_phase, room?.status, startTimer]);

  // --- API Actions ---
  const handleAction = async (action: 'start' | 'next' | 'end') => {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch('/api/game/phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error');
    }
    setActionLoading(false);
  };

  // --- End Game with confirmation ---
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const handleEndGame = () => {
    if (!showEndConfirm) {
      setShowEndConfirm(true);
      return;
    }
    handleAction('end');
    setShowEndConfirm(false);
  };

  // --- Render helpers ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 10) return '#FF4444';
    if (timeLeft <= 30) return '#F59E0B';
    return '#00FFB2';
  };

  // ✅ B4 fix: Count players who submitted portfolio THIS round
  const submittedCount = players.filter((p) => {
    return p.portfolio_submitted_round === room?.current_round;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-[#00FFB2] text-xl">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-red-400 text-xl">Room not found</div>
      </div>
    );
  }

  const phase = room.current_phase || 'lobby';
  const round = room.current_round || 1;
  const phaseInfo = PHASE_DISPLAY[phase] || PHASE_DISPLAY.lobby;
  const allSteps = getAllGameSteps();
  const currentStepIndex = allSteps.findIndex(
    (s) => s.round === round && s.phase === phase
  );
  const timerDuration = PHASE_TIMERS[phase] || 0;
  const timerPercent = timerDuration > 0 ? (timeLeft / timerDuration) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0D1117] text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#00FFB2]">MC Control</h1>
          <p className="text-sm text-gray-400">
            Room: <span className="text-[#00D4FF] font-mono tracking-wider">{roomId}</span>
          </p>
        </div>
        <button
          onClick={() => window.open(`/display/${roomId}`, '_blank')}
          className="text-sm text-[#00D4FF] border border-[#00D4FF] px-3 py-1 rounded hover:bg-[#00D4FF]/10"
        >
          Open Display ↗
        </button>
      </div>

      {/* Progress Bar */}
      {phase !== 'lobby' && (
        <div className="flex gap-[2px] mb-4">
          {allSteps.map((step, i) => (
            <div
              key={`${step.round}-${step.phase}`}
              className="flex-1 h-1 rounded-full"
              style={{
                backgroundColor:
                  i < currentStepIndex
                    ? '#0a6847'
                    : i === currentStepIndex
                    ? '#00FFB2'
                    : '#2a2d35',
              }}
            />
          ))}
        </div>
      )}

      {/* Phase Info Card */}
      <div className="bg-[#161b22] rounded-lg p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm uppercase tracking-wider">
            {phaseInfo.icon} {phaseInfo.name}
          </span>
          {phase !== 'lobby' && phase !== 'final' && (
            <span className="bg-[#00FFB2] text-[#0D1117] text-xs font-bold px-3 py-1 rounded-full">
              Round {round}/{TOTAL_ROUNDS}
            </span>
          )}
        </div>

        {/* Player count + submitted */}
        {phase !== 'lobby' && phase !== 'final' && (
          <div className="text-gray-400 text-sm mt-1">
            Players: {players.length} connected
          </div>
        )}

        {/* Player list in lobby */}
        {phase === 'lobby' && (
          <div className="mt-3 space-y-1">
            {players.length === 0 ? (
              <p className="text-gray-500 text-sm">No players yet...</p>
            ) : (
              players.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between text-sm border-b border-gray-800 pb-1"
                >
                  <span className="text-[#00FFB2]">{p.name}</span>
                  <span className="text-gray-500">฿{(parseFloat(p.money) || 0).toLocaleString()}</span>
                </div>
              ))
            )}
            <p className="text-gray-500 text-xs mt-2">
              {players.length} player{players.length !== 1 ? 's' : ''} in lobby
            </p>
          </div>
        )}
      </div>

      {/* ✅ B4: Portfolio Submitted Count — show during invest/rebalance */}
      {(phase === 'invest' || phase === 'rebalance') && (
        <div className="rounded-lg p-3 mb-3" style={{ background: '#00D4FF15', border: '1px solid #00D4FF30' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono" style={{ color: '#00D4FF' }}>
              📊 Portfolio Submitted
            </span>
            <span className="text-lg font-bold font-mono" style={{ color: '#00FFB2' }}>
              {submittedCount}/{players.length}
            </span>
          </div>
          {submittedCount < players.length && (
            <p className="text-xs mt-1" style={{ color: '#ffffff40' }}>
              กด Next Phase ได้เลย — คนที่ไม่ส่ง = เงินไม่ลงทุนรอบนี้
            </p>
          )}
          {submittedCount === players.length && players.length > 0 && (
            <p className="text-xs mt-1" style={{ color: '#00FFB2' }}>
              ✓ ทุกคนส่งแล้ว! กด Next Phase ได้เลย
            </p>
          )}
        </div>
      )}

      {/* Timer */}
      {timerDuration > 0 && phase !== 'lobby' && phase !== 'final' && (
        <div className="flex items-center gap-3 bg-[#161b22] rounded-lg px-4 py-3 mb-3">
          <div className="flex-1 h-2 bg-[#2a2d35] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${timerPercent}%`,
                backgroundColor: getTimerColor(),
              }}
            />
          </div>
          <span
            className={`font-mono text-lg font-bold min-w-[50px] text-right ${
              timeLeft <= 10 && timeLeft > 0 ? 'animate-pulse' : ''
            }`}
            style={{ color: getTimerColor() }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      )}

      {/* MC Tip */}
      <div className="border-l-4 border-[#00D4FF] bg-[#1a1f2e] rounded-r-lg p-3 mb-3">
        <p className="text-gray-400 text-sm">💡 {phaseInfo.mcTip}</p>
        {MC_TIPS[round] && phase !== 'lobby' && phase !== 'final' && (
          <p className="text-gray-500 text-xs mt-1">📌 Round tip: {MC_TIPS[round]}</p>
        )}
      </div>

      {/* Event info for MC (during event phase) */}
      {phase === 'event' && EVENTS[round - 1] && (
        <div className="bg-[#161b22] rounded-lg p-3 mb-3 border border-[#FF6B6B]/30">
          <p className="text-[#FF6B6B] text-sm font-bold">
            {EVENTS[round - 1].emoji} {EVENTS[round - 1].title}
          </p>
          <p className="text-gray-400 text-xs mt-1">{EVENTS[round - 1].description}</p>
        </div>
      )}

      {/* ✅ B5: Event Result info for MC — แสดง return table */}
      {phase === 'event_result' && EVENTS[round - 1] && (
        <div className="bg-[#161b22] rounded-lg p-3 mb-3 border border-[#00D4FF]/30">
          <p className="text-[#00D4FF] text-sm font-bold mb-2">
            📊 Market Impact — Round {round}
          </p>
          <div className="grid grid-cols-2 gap-1">
            {COMPANIES.map((c) => {
              const returnPct = RETURN_TABLE[c.id]?.[round - 1] || 0;
              return (
                <div key={c.id} className="flex justify-between text-xs py-0.5">
                  <span style={{ color: c.color }}>{c.name}</span>
                  <span style={{ color: returnPct >= 0 ? '#22c55e' : '#ef4444' }}>
                    {returnPct > 0 ? '+' : ''}{returnPct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ✅ B5: Results summary for MC — สรุปหลัง auto-calculate */}
      {phase === 'results' && (
        <div className="bg-[#161b22] rounded-lg p-3 mb-3 border border-[#22c55e]/30">
          <p className="text-[#22c55e] text-sm font-bold mb-2">
            💰 Round {round} Results
          </p>
          {(() => {
            const profits = players
              .map((p) => p.round_returns?.[String(round)]?.total_return || 0);
            const avg = profits.length > 0
              ? Math.round(profits.reduce((a, b) => a + b, 0) / profits.length)
              : 0;
            const topEarner = players
              .map((p) => ({
                name: p.name,
                profit: p.round_returns?.[String(round)]?.total_return || 0,
              }))
              .sort((a, b) => b.profit - a.profit)[0];
            const lossCount = profits.filter((p) => p < 0).length;

            return (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Average return:</span>
                  <span style={{ color: avg >= 0 ? '#22c55e' : '#ef4444' }}>
                    {avg >= 0 ? '+' : '-'}฿{Math.abs(avg).toLocaleString()}
                  </span>
                </div>
                {topEarner && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Top earner:</span>
                    <span className="text-[#22c55e]">
                      {topEarner.name} {topEarner.profit >= 0 ? '+' : ''}฿{Math.abs(topEarner.profit).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Players with loss:</span>
                  <span className={lossCount > 0 ? 'text-[#ef4444]' : 'text-gray-500'}>
                    {lossCount}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Golden Deal info for MC */}
      {phase === 'golden_deal' && (
        <div className="bg-[#161b22] rounded-lg p-3 mb-3 border border-[#F59E0B]/30">
          {(() => {
            const deal = GOLDEN_DEALS.find((d) => d.round === round);
            if (!deal) return null;
            return (
              <>
                <p className="text-[#F59E0B] text-sm font-bold">✨ {deal.name}</p>
                <p className="text-gray-400 text-xs mt-1">{deal.description}</p>
                <p className={`text-xs mt-1 ${deal.is_trap ? 'text-red-400' : 'text-green-400'}`}>
                  Actual return: {deal.actual_return > 0 ? '+' : ''}{deal.actual_return}%
                  {deal.is_trap ? ' ⚠️ TRAP!' : ''}
                </p>
              </>
            );
          })()}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 mb-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Start Game */}
        {phase === 'lobby' && (
          <button
            onClick={() => handleAction('start')}
            disabled={actionLoading || players.length === 0}
            className="w-full py-3 rounded-lg font-bold text-[#0D1117] bg-[#00FFB2] hover:bg-[#00FFB2]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? 'Starting...' : `Start Game (${players.length} players)`}
          </button>
        )}

        {/* Next Phase */}
        {room.status === 'playing' && phase !== 'final' && (() => {
          // คำนวณชื่อปุ่ม — ใช้ require pattern เดิมจาก B3
          const isLeaderboard = phase === 'leaderboard';
          const nextLabel = isLeaderboard
            ? `Next Round → Round ${round + 1}`
            : `Next → ${(() => {
                const { getNextPhase } = require('@/lib/game-engine');
                const next = getNextPhase(phase, round);
                return next ? PHASE_DISPLAY[next.phase]?.name || next.phase : 'End';
              })()}`;

          return (
            <button
              onClick={() => handleAction('next')}
              disabled={actionLoading}
              className="w-full py-3 rounded-lg font-bold text-[#0D1117] bg-[#00D4FF] hover:bg-[#00D4FF]/90 disabled:opacity-50"
            >
              {actionLoading ? 'Loading...' : nextLabel}
            </button>
          );
        })()}

        {/* End Game */}
        {room.status === 'playing' && phase !== 'final' && (
          <div className="flex justify-end mt-2">
            {showEndConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-sm">End game now?</span>
                <button
                  onClick={handleEndGame}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded bg-red-600 text-white text-sm font-bold hover:bg-red-700"
                >
                  Yes, End Game
                </button>
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="px-4 py-2 rounded bg-gray-700 text-white text-sm hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowEndConfirm(true)}
                className="px-4 py-2 rounded bg-red-900/50 text-red-400 text-sm border border-red-800 hover:bg-red-900"
              >
                End Game
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
