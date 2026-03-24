// FILE: app/display/[roomId]/page.tsx — Display screen
// VERSION: B7-v1 — Final phase: Top 3 podium + game stats + profit/loss count
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B1 created | B3 phase sync + timer | B4 submitted count | B5 event_result + results UI | B6 leaderboard | B7 final phase
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
  RETURN_TABLE,
  STARTING_MONEY,
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

  // ✅ B4 fix: Count players who submitted portfolio THIS round
  const submittedCount = players.filter((p) => {
    return p.portfolio_submitted_round === room?.current_round;
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

          {/* ✅ B5: Event Reveal — ข่าวอย่างเดียว MC อธิบาย + เด็กแสดงความเห็น */}
          {phase === 'event' && EVENTS[round - 1] && (
            <div className="mt-8 bg-[#161b22] rounded-xl p-8 border border-[#FF6B6B]/30 max-w-lg mx-auto">
              {/* ถ้ามีรูป ใช้รูป / ไม่มี ใช้ emoji */}
              {EVENTS[round - 1].image ? (
                <img
                  src={EVENTS[round - 1].image!}
                  alt={EVENTS[round - 1].title}
                  className="w-full rounded-lg mb-4 max-h-64 object-cover"
                />
              ) : (
                <div className="text-7xl mb-4">{EVENTS[round - 1].emoji}</div>
              )}
              <h3 className="text-3xl font-bold text-[#FF6B6B] mb-3">
                {EVENTS[round - 1].title}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {EVENTS[round - 1].description}
              </p>
            </div>
          )}

          {/* ✅ B5: Event Result — เฉลย % return แต่ละบริษัท + stagger animation */}
          {phase === 'event_result' && EVENTS[round - 1] && (
            <div className="mt-8 max-w-lg mx-auto">
              {/* สรุปข่าวเล็กๆ ด้านบน */}
              <div className="bg-[#161b22] rounded-lg p-3 mb-4 border border-[#FF6B6B]/20 flex items-center gap-3 justify-center">
                <span className="text-2xl">{EVENTS[round - 1].emoji}</span>
                <span className="text-sm text-gray-400">{EVENTS[round - 1].title}</span>
              </div>

              {/* Return grid — stagger fade-in */}
              <style>{`
                @keyframes fadeSlideUp {
                  from { opacity: 0; transform: translateY(16px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .return-card {
                  opacity: 0;
                  animation: fadeSlideUp 0.4s ease-out forwards;
                }
              `}</style>
              <div className="grid grid-cols-3 gap-3">
                {COMPANIES.map((c, i) => {
                  const returnPct = RETURN_TABLE[c.id]?.[round - 1] || 0;
                  const isPositive = returnPct >= 0;
                  return (
                    <div
                      key={c.id}
                      className="return-card bg-[#161b22] rounded-lg p-4 text-center"
                      style={{
                        animationDelay: `${0.8 + i * 0.2}s`,
                        borderBottom: `3px solid ${c.color}`,
                      }}
                    >
                      <div className="text-xs font-bold mb-1" style={{ color: c.color }}>
                        {c.name}
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: isPositive ? '#22c55e' : '#ef4444' }}
                      >
                        {isPositive ? '+' : ''}{returnPct}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{c.type}</div>
                    </div>
                  );
                })}
              </div>
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

          {/* ✅ B6: Leaderboard — Top 10 stagger reveal + movement */}
          {phase === 'leaderboard' && (() => {
            // --- คำนวณ rank + movement ---
            const currentRanked = [...players]
              .sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0));

            let rankedPlayers: { id: string; name: string; money: number; rank: number; movement: number }[];

            if (round <= 1) {
              // รอบ 1: ทุกคนเพิ่งเริ่ม ไม่มี movement
              rankedPlayers = currentRanked.map((p, i) => ({
                id: p.id,
                name: p.name,
                money: parseFloat(p.money) || 0,
                rank: i + 1,
                movement: 0,
              }));
            } else {
              // รอบ 2+: เทียบกับอันดับก่อนรอบนี้ (ใช้ money_before จาก round_returns)
              const previousRanked = [...players]
                .sort((a, b) => {
                  const aBefore = a.round_returns?.[String(round)]?.money_before || parseFloat(a.money) || 0;
                  const bBefore = b.round_returns?.[String(round)]?.money_before || parseFloat(b.money) || 0;
                  return bBefore - aBefore;
                });
              const prevRankMap: Record<string, number> = {};
              previousRanked.forEach((p, i) => { prevRankMap[p.id] = i + 1; });

              rankedPlayers = currentRanked.map((p, i) => ({
                id: p.id,
                name: p.name,
                money: parseFloat(p.money) || 0,
                rank: i + 1,
                movement: (prevRankMap[p.id] || i + 1) - (i + 1),
              }));
            }

            const top10 = rankedPlayers.slice(0, 10);
            const totalPlayers = rankedPlayers.length;
            const medals = ['🥇', '🥈', '🥉'];

            return (
              <div className="mt-8 max-w-lg mx-auto">
                {/* Stagger animation CSS */}
                <style>{`
                  @keyframes leaderboardReveal {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                  }
                  .lb-row {
                    opacity: 0;
                    animation: leaderboardReveal 0.4s ease-out forwards;
                  }
                `}</style>

                <div className="space-y-2">
                  {/* Reveal ทีละอันดับ — อันดับ 10 โผล่ก่อน, อันดับ 1 โผล่ทีหลัง */}
                  {top10.map((p, i) => {
                    const isTop3 = i < 3;
                    // อันดับ 10 reveal ก่อน (delay น้อย), อันดับ 1 reveal ทีหลัง (delay มาก)
                    const revealOrder = top10.length - 1 - i;
                    const delay = 0.5 + revealOrder * 0.3;

                    return (
                      <div
                        key={p.id}
                        className="lb-row"
                        style={{ animationDelay: `${delay}s` }}
                      >
                        {isTop3 ? (
                          /* Top 3 — การ์ดพิเศษ */
                          <div
                            className="flex items-center rounded-lg"
                            style={{
                              padding: i === 0 ? '14px 16px' : '10px 16px',
                              background: i === 0 ? 'rgba(255,215,0,0.12)' :
                                          i === 1 ? 'rgba(192,192,192,0.08)' :
                                                    'rgba(205,127,50,0.08)',
                              borderLeft: `4px solid ${
                                i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32'
                              }`,
                            }}
                          >
                            <span className={`${i === 0 ? 'text-2xl' : 'text-xl'} w-9`}>
                              {medals[i]}
                            </span>
                            <span
                              className={`flex-1 font-bold ${i === 0 ? 'text-lg' : 'text-base'}`}
                              style={{
                                color: i === 0 ? '#FFD700' : i === 1 ? '#E0E0E0' : '#CD9B6A',
                              }}
                            >
                              {p.name}
                            </span>
                            {/* Movement — เฉพาะรอบ 2+ */}
                            {round > 1 && (
                              <span
                                className="text-sm mr-3"
                                style={{
                                  color: p.movement > 0 ? '#22c55e' :
                                         p.movement < 0 ? '#ef4444' : '#666',
                                }}
                              >
                                {p.movement > 0 ? `↑${p.movement}` :
                                 p.movement < 0 ? `↓${Math.abs(p.movement)}` : '—'}
                              </span>
                            )}
                            <span
                              className={`font-bold ${i === 0 ? 'text-lg' : 'text-base'}`}
                              style={{
                                color: i === 0 ? '#FFD700' : i === 1 ? '#E0E0E0' : '#CD9B6A',
                              }}
                            >
                              ฿{p.money.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          /* อันดับ 4-10 — แถวปกติ */
                          <div className="flex items-center px-4 py-2 border-b border-gray-800/50">
                            <span className="text-sm text-gray-500 w-9">#{p.rank}</span>
                            <span className="flex-1 text-sm text-gray-300">{p.name}</span>
                            {round > 1 && (
                              <span
                                className="text-xs mr-3"
                                style={{
                                  color: p.movement > 0 ? '#22c55e' :
                                         p.movement < 0 ? '#ef4444' : '#555',
                                }}
                              >
                                {p.movement > 0 ? `↑${p.movement}` :
                                 p.movement < 0 ? `↓${Math.abs(p.movement)}` : '—'}
                              </span>
                            )}
                            <span className="text-sm text-gray-400">
                              ฿{p.money.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* จำนวนคนที่เหลือ */}
                {totalPlayers > 10 && (
                  <p className="text-center text-gray-600 text-sm mt-3">
                    ... +{totalPlayers - 10} more players
                  </p>
                )}
              </div>
            );
          })()}

          {/* ✅ B5: Results — market return pills + top 3 earners */}
          {phase === 'results' && (
            <div className="mt-8 max-w-lg mx-auto">
              {/* Market returns pills */}
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {COMPANIES.map((c) => {
                  const returnPct = RETURN_TABLE[c.id]?.[round - 1] || 0;
                  const isPositive = returnPct >= 0;
                  return (
                    <div
                      key={c.id}
                      className="bg-[#161b22] rounded-full px-3 py-1.5 flex items-center gap-2"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-xs text-gray-400">{c.name}</span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: isPositive ? '#22c55e' : '#ef4444' }}
                      >
                        {isPositive ? '+' : ''}{returnPct}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Top 3 earners this round */}
              <div className="text-xs tracking-widest text-gray-600 text-center mb-3">
                TOP EARNERS THIS ROUND
              </div>
              <div className="space-y-2">
                {(() => {
                  const earners = players
                    .map((p) => ({
                      id: p.id,
                      name: p.name,
                      profit: p.round_returns?.[String(round)]?.total_return || 0,
                    }))
                    .sort((a, b) => b.profit - a.profit)
                    .slice(0, 3);

                  const medals = ['🥇', '🥈', '🥉'];

                  return earners.map((p, i) => (
                    <div
                      key={p.id}
                      className="bg-[#161b22] rounded-lg px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{medals[i]}</span>
                        <span className="text-base font-bold text-gray-200">{p.name}</span>
                      </div>
                      <span
                        className="text-lg font-bold"
                        style={{ color: p.profit >= 0 ? '#22c55e' : '#ef4444' }}
                      >
                        {p.profit >= 0 ? '+' : '-'}฿{Math.abs(p.profit).toLocaleString()}
                      </span>
                    </div>
                  ));
                })()}
              </div>

              <p className="text-gray-600 text-sm text-center mt-4">
                Check your phone for personal results!
              </p>
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

      {/* === FINAL — B7: Top 3 Podium + Game Stats + Profit/Loss === */}
      {phase === 'final' && (() => {
        const sorted = [...players].sort((a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0));
        const top3 = sorted.slice(0, 3);
        const totalPlayers = sorted.length;

        // คำนวณ avg return + profit/loss count
        const avgReturn = totalPlayers > 0
          ? sorted.reduce((sum, p) => {
              const money = parseFloat(p.money) || 0;
              return sum + ((money - STARTING_MONEY) / STARTING_MONEY) * 100;
            }, 0) / totalPlayers
          : 0;
        const profitCount = sorted.filter(p => (parseFloat(p.money) || 0) > STARTING_MONEY).length;
        const lossCount = sorted.filter(p => (parseFloat(p.money) || 0) < STARTING_MONEY).length;

        const podiumData = [
          { index: 1, medal: '🥈', color: '#C0C0C0', size: 'normal', height: 'h-[90px]' },
          { index: 0, medal: '🥇', color: '#FFD700', size: 'large', height: 'h-[120px]' },
          { index: 2, medal: '🥉', color: '#CD7F32', size: 'normal', height: 'h-[70px]' },
        ];

        return (
          <div className="text-center w-full max-w-2xl">
            {/* Stagger animation */}
            <style>{`
              @keyframes finalReveal {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .final-item {
                opacity: 0;
                animation: finalReveal 0.5s ease-out forwards;
              }
            `}</style>

            {/* Trophy + Title */}
            <div className="final-item" style={{ animationDelay: '0.2s' }}>
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-5xl font-bold text-[#FFD700] mb-1">Game Over!</h2>
              <p className="text-lg text-gray-400 mb-8">{TOTAL_ROUNDS} rounds completed</p>
            </div>

            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-3 mb-8 final-item" style={{ animationDelay: '0.8s' }}>
              {podiumData.map((pod) => {
                const p = top3[pod.index];
                if (!p) return null;
                const money = parseFloat(p.money) || 0;
                const returnPct = ((money - STARTING_MONEY) / STARTING_MONEY) * 100;
                const isLarge = pod.size === 'large';

                return (
                  <div key={p.id} className="text-center" style={{ width: isLarge ? '160px' : '140px' }}>
                    <div className={`${isLarge ? 'text-4xl' : 'text-3xl'} mb-1`}>{pod.medal}</div>
                    <div
                      className="rounded-t-lg flex flex-col items-center justify-center"
                      style={{
                        background: `linear-gradient(180deg, ${pod.color}, ${pod.color}88)`,
                        padding: isLarge ? '20px 8px 16px' : '14px 8px 12px',
                        minHeight: isLarge ? '120px' : pod.index === 1 ? '90px' : '70px',
                      }}
                    >
                      <p className={`${isLarge ? 'text-lg' : 'text-base'} font-bold text-white`}>
                        {p.name}
                      </p>
                      <p className={`${isLarge ? 'text-xl' : 'text-lg'} font-bold text-white mt-1`}>
                        ฿{money.toLocaleString()}
                      </p>
                      <p className="text-xs text-white/70 mt-0.5">
                        {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Game Stats — Players / Avg Return / Profit vs Loss */}
            <div className="grid grid-cols-3 gap-3 mb-6 final-item" style={{ animationDelay: '1.4s' }}>
              <div className="bg-[#161b22] rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Players</p>
                <p className="text-2xl font-bold text-[#00D4FF]">{totalPlayers}</p>
              </div>
              <div className="bg-[#161b22] rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Avg return</p>
                <p className="text-2xl font-bold" style={{ color: avgReturn >= 0 ? '#00FFB2' : '#FF4444' }}>
                  {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%
                </p>
              </div>
              <div className="bg-[#161b22] rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Profit / Loss</p>
                <div className="flex justify-center items-baseline gap-1">
                  <span className="text-xl font-bold text-[#00FFB2]">{profitCount}</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-xl font-bold text-[#FF4444]">{lossCount}</span>
                </div>
              </div>
            </div>

            {/* Thank you */}
            <div className="final-item" style={{ animationDelay: '1.8s' }}>
              <div className="bg-[#161b22] rounded-lg py-4 px-6">
                <p className="text-base" style={{ color: '#00FFB2' }}>Thank you for playing Market Wars!</p>
                <p className="text-xs mt-1" style={{ color: '#8b949e' }}>Powered by Dime! Kids Camp</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
