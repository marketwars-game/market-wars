// FILE: app/display/[roomId]/page.tsx — Display screen
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
  EVENTS,
  GOLDEN_DEALS,
} from '@/lib/constants';

// ==============================================
// Display Screen — จอใหญ่/Projector (read-only)
// ==============================================
export default function DisplayScreen() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Fetch room + players ---
  useEffect(() => {
    async function fetchData() {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
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
      .channel(`display-room-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => setRoom(payload.new)
      )
      .subscribe();

    const playerChannel = supabase
      .channel(`display-players-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        () => {
          supabase
            .from('players')
            .select('*')
            .eq('room_id', roomId)
            .order('money', { ascending: false })
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

  // --- Timer ---
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!room || room.status !== 'playing') return;

    const duration = PHASE_TIMERS[room.current_phase];
    if (!duration) { setTimeLeft(0); return; }

    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [room?.current_phase, room?.status]);

  // ✅ B4: Count players who submitted portfolio
  const submittedCount = players.filter((p) => {
    const portfolio = p.portfolio || {};
    return Object.values(portfolio).some((v: any) => Number(v) > 0);
  }).length;

  // --- Render ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-[#00FFB2] text-3xl font-bold animate-pulse">
          MARKET WARS
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-red-400 text-2xl">Room not found</div>
      </div>
    );
  }

  const phase = room.current_phase || 'lobby';
  const round = room.current_round || 1;
  const phaseInfo = PHASE_DISPLAY[phase] || PHASE_DISPLAY.lobby;
  const timerDuration = PHASE_TIMERS[phase] || 0;
  const timerPercent = timerDuration > 0 ? (timeLeft / timerDuration) * 100 : 0;
  const timerColor = timeLeft <= 10 ? '#FF4444' : timeLeft <= 30 ? '#F59E0B' : '#00FFB2';

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${roomId}`
    : '';

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center p-8">

      {/* === LOBBY === */}
      {phase === 'lobby' && (
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#00FFB2] mb-2">MARKET WARS</h1>
          <p className="text-xl text-gray-400 mb-8">The Investment Game</p>

          <div className="bg-white p-6 rounded-2xl inline-block mb-4">
            {joinUrl && <QRCodeSVG value={joinUrl} size={200} />}
          </div>

          <p className="text-3xl font-mono font-bold text-[#00D4FF] tracking-[8px] mb-4">
            {roomId}
          </p>

          <p className="text-gray-400 mb-6">Scan QR or enter room code to join!</p>

          {/* Player list */}
          <div className="max-w-md mx-auto">
            {players.length === 0 ? (
              <p className="text-gray-600">Waiting for players...</p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {players.map((p) => (
                  <span
                    key={p.id}
                    className="bg-[#161b22] text-[#00FFB2] px-3 py-1 rounded-full text-sm"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            )}
            <p className="text-gray-500 text-sm mt-3">
              {players.length} player{players.length !== 1 ? 's' : ''} joined
            </p>
          </div>
        </div>
      )}

      {/* === PLAYING PHASES === */}
      {phase !== 'lobby' && phase !== 'final' && (
        <div className="text-center w-full max-w-2xl">
          {/* Phase name + round */}
          <div className="text-6xl mb-2">{phaseInfo.icon}</div>
          <h2 className="text-4xl font-bold text-[#00FFB2] mb-1">{phaseInfo.name}</h2>
          <p className="text-lg text-gray-400 mb-6">
            Round {round} of {TOTAL_ROUNDS}
          </p>

          {/* Timer bar */}
          {timerDuration > 0 && (
            <div className="flex items-center gap-4 mb-6 max-w-lg mx-auto">
              <div className="flex-1 h-3 bg-[#2a2d35] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${timerPercent}%`, backgroundColor: timerColor }}
                />
              </div>
              <span
                className={`font-mono text-2xl font-bold min-w-[70px] text-right ${
                  timeLeft <= 10 && timeLeft > 0 ? 'animate-pulse' : ''
                }`}
                style={{ color: timerColor }}
              >
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Phase-specific content */}
          <p className="text-xl text-[#00D4FF]">{phaseInfo.displayMessage}</p>

          {/* ✅ B4: Submitted count during invest/rebalance */}
          {(phase === 'invest' || phase === 'rebalance') && (
            <div className="mt-8">
              <p className="text-6xl font-bold font-mono" style={{ color: '#00FFB2' }}>
                {submittedCount}/{players.length}
              </p>
              <p className="text-2xl font-mono mt-2" style={{ color: '#ffffff60' }}>
                portfolios submitted
              </p>
            </div>
          )}

          {/* Event Reveal */}
          {phase === 'event' && EVENTS[round - 1] && (
            <div className="mt-8 bg-[#161b22] rounded-xl p-6 border border-[#FF6B6B]/30 max-w-lg mx-auto">
              <div className="text-5xl mb-3">{EVENTS[round - 1].emoji}</div>
              <h3 className="text-2xl font-bold text-[#FF6B6B] mb-2">
                {EVENTS[round - 1].title}
              </h3>
              <p className="text-gray-300">{EVENTS[round - 1].description}</p>
            </div>
          )}

          {/* Golden Deal */}
          {phase === 'golden_deal' && (() => {
            const deal = GOLDEN_DEALS.find((d) => d.round === round);
            if (!deal) return null;
            return (
              <div className="mt-8 bg-[#161b22] rounded-xl p-6 border border-[#F59E0B]/30 max-w-lg mx-auto">
                <div className="text-5xl mb-3">✨</div>
                <h3 className="text-2xl font-bold text-[#F59E0B] mb-2">{deal.name}</h3>
                <p className="text-gray-300">{deal.description}</p>
                <p className="text-sm text-gray-500 mt-2">Only 3 spots available!</p>
              </div>
            );
          })()}

          {/* Leaderboard placeholder */}
          {phase === 'leaderboard' && (
            <div className="mt-8 max-w-lg mx-auto">
              {players
                .sort((a, b) => Number(b.money) - Number(a.money))
                .map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex justify-between items-center py-2 border-b border-gray-800 ${
                      i === 0 ? 'text-yellow-400 font-bold text-lg' :
                      i === 1 ? 'text-gray-300 font-bold' :
                      i === 2 ? 'text-amber-600 font-bold' : 'text-gray-400'
                    }`}
                  >
                    <span>#{i + 1} {p.name}</span>
                    <span>฿{(parseFloat(p.money) || 0).toLocaleString()}</span>
                  </div>
                ))}
            </div>
          )}

          {/* Results placeholder */}
          {phase === 'results' && (
            <div className="mt-8 text-gray-400">
              <p className="text-lg">Results calculating...</p>
              <p className="text-sm mt-2">(Full results UI in Task B5)</p>
            </div>
          )}

          {/* Companies during invest phase — show below submitted count */}
          {phase === 'invest' && (
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg mx-auto">
              {COMPANIES.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#161b22] rounded-lg p-3 text-center"
                  style={{ borderLeft: `3px solid ${c.color}` }}
                >
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <div className="text-sm font-bold" style={{ color: c.color }}>
                    {c.name}
                  </div>
                  <div className="text-xs text-gray-500">{c.risk}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === FINAL === */}
      {phase === 'final' && (
        <div className="text-center">
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-5xl font-bold text-[#FFD700] mb-2">Game Over!</h2>
          <p className="text-xl text-gray-400 mb-8">Final Results</p>

          {/* Top 3 */}
          <div className="max-w-md mx-auto">
            {players
              .sort((a, b) => Number(b.money) - Number(a.money))
              .slice(0, 3)
              .map((p, i) => (
                <div
                  key={p.id}
                  className={`flex justify-between items-center py-3 border-b border-gray-800 text-lg ${
                    i === 0 ? 'text-yellow-400 font-bold text-2xl' :
                    i === 1 ? 'text-gray-300 font-bold' :
                    'text-amber-600 font-bold'
                  }`}
                >
                  <span>{['🥇', '🥈', '🥉'][i]} {p.name}</span>
                  <span>฿{(parseFloat(p.money) || 0).toLocaleString()}</span>
                </div>
              ))}
          </div>

          <p className="text-gray-500 text-sm mt-6">(Full summary UI in Task B11)</p>
        </div>
      )}
    </div>
  );
}
