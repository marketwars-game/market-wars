// FILE: components/player/FinalView.tsx — Player Final Phase (share-card)
// VERSION: B24 — screenshot-ready investor card: branding frame + own-money journey + award badges + animated backdrop
// LAST MODIFIED: 11 Jul 2026
// HISTORY: B7 created (rank + profit + bars + top5) | B8R extracted to component | B11 stats + badge | B13 chance card stats + ปี labels | B15 co-winner names | B16d fix co-winner filter | B18 compareForRank | B24 redesign → share-card (branding + money journey line + AnimatedBackdrop; TOP5 moved below fold; event branding via lib/event-info)
'use client';

import { STARTING_MONEY, TOTAL_ROUNDS } from '@/lib/constants';
import { compareForRank } from '@/lib/ranking';
import { calculateAwards, getPlayerAwards, calcPlayerStats } from '@/lib/awards';
import { EVENT_INFO } from '@/lib/event-info';
import AnimatedBackdrop from '@/components/display/AnimatedBackdrop';

interface FinalViewProps {
  player: any;
  players: any[];
}

const GREEN = '#22c55e';
const RED = '#ef4444';
const GOLD = '#FCD34D';
const TEAL = '#00FFB2';
const CYAN = '#00D4FF';
const FLAT = 'rgba(255,255,255,0.4)';

export default function FinalView({ player, players }: FinalViewProps) {
  if (!player) return null;

  const sorted = [...players].sort(compareForRank);
  const rank = sorted.findIndex((p) => p.id === player.id) + 1;
  const money = parseFloat(player.money) || STARTING_MONEY;
  const profit = money - STARTING_MONEY;
  const pctReturn = (profit / STARTING_MONEY) * 100;
  const isProfit = profit >= 0;
  const profitColor = isProfit ? GREEN : RED;

  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  const isChamp = rank === 1;

  const myAwards = getPlayerAwards(player.id, calculateAwards(players));
  const stats = calcPlayerStats(player);

  // ===== Money journey (ปี 0..TOTAL_ROUNDS) — เงินจริงของผู้เล่นแต่ละปี =====
  const points: number[] = [STARTING_MONEY];
  let last = STARTING_MONEY;
  for (let r = 1; r <= TOTAL_ROUNDS; r++) {
    const after = parseFloat(player.round_returns?.[String(r)]?.money_after);
    if (!isNaN(after)) last = after;
    points.push(last);
  }

  // chart geometry (viewBox 340×150, letterbox padding)
  const X0 = 24, X1 = 316, Y_TOP = 16, Y_BOT = 116;
  const step = (X1 - X0) / TOTAL_ROUNDS;
  const xs = points.map((_, i) => X0 + step * i);
  const minV = Math.min(...points, STARTING_MONEY);
  const maxV = Math.max(...points, STARTING_MONEY);
  const pad = Math.max((maxV - minV) * 0.15, 1);
  const lo = minV - pad, hi = maxV + pad;
  const yFor = (v: number) => Y_TOP + ((hi - v) / (hi - lo)) * (Y_BOT - Y_TOP);
  const baselineY = yFor(STARTING_MONEY);

  const segs = [];
  for (let i = 1; i < points.length; i++) {
    const up = points[i] - points[i - 1];
    segs.push({
      x1: xs[i - 1], y1: yFor(points[i - 1]),
      x2: xs[i], y2: yFor(points[i]),
      color: up > 0 ? GREEN : up < 0 ? RED : FLAT,
    });
  }
  const endX = xs[xs.length - 1], endY = yFor(points[points.length - 1]);

  // Top 5 (below fold)
  const top5 = sorted.slice(0, 5);
  const isInTop5 = top5.some((p) => p.id === player.id);

  return (
    <div className="max-w-md mx-auto px-3 pt-3 pb-6">
      {/* ================= CARD (screenshot zone) ================= */}
      <div
        className="relative overflow-hidden text-white"
        style={{
          background: '#0D1117',
          borderRadius: '18px',
          border: `2px solid ${isChamp ? 'rgba(253,211,77,0.9)' : 'rgba(253,211,77,0.55)'}`,
          boxShadow: isChamp ? '0 0 24px rgba(253,211,77,0.25)' : 'none',
          padding: '18px 18px 14px',
        }}
      >
        {/* animated backdrop (shared with Display) */}
        <AnimatedBackdrop accent={TEAL} accent2={CYAN} density={14} />

        <div className="relative" style={{ zIndex: 10 }}>
          {/* header / branding */}
          <div
            className="flex flex-col items-center gap-0.5 pb-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}
          >
            <div className="font-black" style={{ fontFamily: 'monospace', letterSpacing: '4px', fontSize: '26px' }}>
              <span style={{ color: TEAL }}>MARKET</span>{' '}
              <span style={{ color: CYAN }}>WARS</span>
            </div>
            <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)' }}>
              {EVENT_INFO.program} · {EVENT_INFO.season}
            </div>
            <div style={{ marginTop: '7px', height: '3px', width: '52px', borderRadius: '3px', background: 'linear-gradient(90deg, #00FFB2, #00D4FF)' }} />
          </div>

          {/* rank + name */}
          <div className="text-center" style={{ marginTop: '14px' }}>
            {medal ? (
              <div style={{ fontSize: '44px', lineHeight: 1 }}>{medal}</div>
            ) : (
              <div
                className="inline-flex items-center justify-center font-black"
                style={{ width: '52px', height: '52px', borderRadius: '50%', fontSize: '22px', color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                #{rank}
              </div>
            )}
            <div style={{ fontSize: '15px', letterSpacing: '1px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
              อันดับ {rank} จาก {players.length}
            </div>
            <div className="font-extrabold" style={{ fontSize: '30px', marginTop: '6px', letterSpacing: '0.5px' }}>
              {player.name}
            </div>
          </div>

          {/* award badges (0 = ซ่อนแถว) */}
          {myAwards.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2" style={{ marginTop: '12px' }}>
              {myAwards.map((award) => {
                const others = (award.winnerNames || []).filter((n) => n !== player.name);
                return (
                  <span
                    key={award.id}
                    className="inline-flex items-center font-bold"
                    style={{ gap: '6px', background: 'rgba(253,211,77,0.10)', border: '1px solid rgba(253,211,77,0.4)', borderRadius: '999px', padding: '5px 12px', fontSize: '13px', color: GOLD }}
                  >
                    {award.emoji} {award.name}
                    {others.length > 0 && (
                      <small style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400, fontSize: '11px' }}>
                        ร่วม {others.length + 1} คน
                      </small>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          {/* money journey */}
          <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'rgba(255,255,255,0.5)', margin: '16px 0 4px', textAlign: 'center' }}>
            เส้นทางเงิน {TOTAL_ROUNDS} ปี
          </div>
          <div className="relative">
            <div
              className="absolute font-extrabold"
              style={{ right: '6px', top: '6px', borderRadius: '8px', padding: '3px 8px', fontSize: '13px', background: `${isProfit ? 'rgba(34,197,94,0.14)' : 'rgba(239,68,68,0.14)'}`, border: `1px solid ${isProfit ? 'rgba(34,197,94,0.45)' : 'rgba(239,68,68,0.45)'}`, color: profitColor }}
            >
              ฿{Math.round(money).toLocaleString()}
            </div>
            <svg viewBox="0 0 340 150" width="100%" xmlns="http://www.w3.org/2000/svg">
              {/* baseline = เงินเริ่มต้น */}
              <line x1={X0} y1={baselineY} x2={X1} y2={baselineY} stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="4 4" />
              <text x={X0} y={baselineY - 5} fill="rgba(255,255,255,0.45)" fontSize="9">฿{STARTING_MONEY.toLocaleString()} เริ่มต้น</text>

              {/* segments (เขียว=ปีเงินโต / แดง=ปีเงินหด / เทา=เท่าเดิม) */}
              <g strokeWidth="3" strokeLinecap="round" fill="none">
                {segs.map((s, i) => (
                  <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.color} />
                ))}
              </g>

              {/* vertex dots (ยกเว้นจุดปลาย) */}
              <g fill="rgba(255,255,255,0.6)">
                {xs.slice(0, -1).map((x, i) => (
                  <circle key={i} cx={x} cy={yFor(points[i])} r="2.5" />
                ))}
              </g>

              {/* endpoint gold dot */}
              <circle cx={endX} cy={endY} r="5.5" fill={GOLD} />
              <circle cx={endX} cy={endY} r="9" fill="none" stroke="rgba(253,211,77,0.35)" strokeWidth="2" />

              {/* x labels */}
              <g fill="rgba(255,255,255,0.45)" fontSize="9" textAnchor="middle">
                {xs.map((x, i) => (
                  <text key={i} x={x} y="140">{i === 0 ? 'ปี0' : i}</text>
                ))}
              </g>
            </svg>
          </div>

          {/* final money + profit */}
          <div className="text-center" style={{ marginTop: '8px' }}>
            <div className="font-black" style={{ fontSize: '34px', letterSpacing: '0.5px' }}>
              ฿{Math.round(money).toLocaleString()}
            </div>
            <div className="font-bold" style={{ fontSize: '16px', color: profitColor, marginTop: '2px' }}>
              {isProfit ? '+' : '-'}฿{Math.abs(Math.round(profit)).toLocaleString()}
              &nbsp;&nbsp;{isProfit ? '+' : ''}{pctReturn.toFixed(1)}%
            </div>
          </div>

          {/* stat chips */}
          <div className="flex" style={{ gap: '10px', marginTop: '14px' }}>
            <div className="text-center" style={{ flex: 1, background: 'rgba(22,27,34,0.72)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 6px' }}>
              <div className="font-extrabold" style={{ fontSize: '18px', color: CYAN }}>🧠 {stats.quizCorrect}/{stats.quizTotal}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>Quiz ถูก</div>
            </div>
            <div className="text-center" style={{ flex: 1, background: 'rgba(22,27,34,0.72)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 6px' }}>
              <div className="font-extrabold" style={{ fontSize: '18px', color: stats.chanceTotal >= 0 ? GREEN : RED }}>
                🃏 {stats.chanceTotal >= 0 ? '+' : '-'}฿{Math.abs(stats.chanceTotal).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>Chance Card</div>
            </div>
          </div>

          {/* footer */}
          <div style={{ marginTop: '14px', paddingTop: '11px', borderTop: '1px solid rgba(255,255,255,0.10)', textAlign: 'center', fontSize: '13px', letterSpacing: '1px', color: 'rgba(255,255,255,0.65)' }}>
            {EVENT_INFO.venue} · {EVENT_INFO.date}
          </div>
        </div>
      </div>

      {/* ================= BELOW FOLD (นอกรูปถ่าย) ================= */}
      <div style={{ margin: '16px auto 6px', width: '60%', borderTop: '1px dashed rgba(255,255,255,0.18)' }} />
      <div style={{ textAlign: 'center', fontSize: '11px', color: '#8b949e', letterSpacing: '1px', marginBottom: '8px' }}>
        อันดับทั้งหมด
      </div>
      <div className="bg-[#161b22] rounded-lg p-3">
        <div className="text-xs tracking-widest text-gray-500 mb-2">TOP 5</div>
        <div className="space-y-1">
          {top5.map((p, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const isMe = p.id === player.id;
            const m = parseFloat(p.money) || 0;
            return (
              <div
                key={p.id}
                className={`flex justify-between items-center px-2 py-1 rounded ${isMe ? 'bg-green-900/20 border border-green-800/30' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm w-6 text-center">{i < 3 ? medals[i] : `#${i + 1}`}</span>
                  <span className={`text-sm ${isMe ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                    {isMe ? `You (${p.name})` : p.name}
                  </span>
                </div>
                <span className="text-sm text-gray-400">฿{m.toLocaleString()}</span>
              </div>
            );
          })}
          {!isInTop5 && (
            <>
              <div className="border-t border-dashed border-gray-700 my-1" />
              <div className="flex justify-between items-center px-2 py-1 rounded bg-green-900/20 border border-green-800/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm w-6 text-center">#{rank}</span>
                  <span className="text-sm text-green-400 font-bold">You ({player.name})</span>
                </div>
                <span className="text-sm text-gray-400">฿{money.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
