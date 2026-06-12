// FILE: components/display/LeaderboardDisplay.tsx — Display Leaderboard (spectator)
// VERSION: B19-v2 — hold prev positions HOLD_MS before racing; right column minmax(0,1fr) fix name overflow; narrower top-8 column
// LAST MODIFIED: 13 Jun 2026
// HISTORY: B6 created | B8R extracted | B12-UX layout | v2-v4 podium fixes | v5 fix movement calc | B15 projector polish | B16c spectator: show max players, racing reorder, dark-horse highlight | B18 compareForRank | B19 hold-then-race + overflow fix + column rebalance
'use client';

import { useEffect, useState } from 'react';
import { compareForRank } from '@/lib/ranking';

interface LeaderboardDisplayProps {
  players: any[];
  round: number;
}

const ROWH = 54;          // px height per top-8 row slot (base; parent applies CSS zoom)
const HOLD_MS = 900;      // B19: freeze at previous-round positions this long before racing (synced w/ sfx_rankup @1700ms in display/page)
const REST_CAP = 72;      // max cells in the right column before "+N more"
const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#FFD700', '#E0E0E0', '#CD9B6A'];

export default function LeaderboardDisplay({ players, round }: LeaderboardDisplayProps) {
  const [settled, setSettled] = useState(false);

  // B19: render at previous-round positions, HOLD them visible for HOLD_MS, then slide to current ranking
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), HOLD_MS);
    return () => clearTimeout(t);
  }, []);

  // current ranking (money desc)
  const ranked = [...players].sort(compareForRank);

  // previous-round rank index (by money_before), fallback to current money
  const prevIndex: Record<string, number> = {};
  if (round > 1) {
    const prev = [...players].sort((a, b) => {
      const aB = a.round_returns?.[String(round)]?.money_before ?? parseFloat(a.money) ?? 0;
      const bB = b.round_returns?.[String(round)]?.money_before ?? parseFloat(b.money) ?? 0;
      return bB - aB;
    });
    prev.forEach((p, i) => { prevIndex[p.id] = i; });
  }

  const currIndex: Record<string, number> = {};
  ranked.forEach((p, i) => { currIndex[p.id] = i; });

  const movementOf = (p: any, i: number) => (round <= 1 ? 0 : (prevIndex[p.id] ?? i) - i);

  // dark horse = biggest positive climb this round
  let darkHorse: any = null;
  let dhJump = 0;
  if (round > 1) {
    ranked.forEach((p, i) => {
      const m = movementOf(p, i);
      if (m > dhJump) { dhJump = m; darkHorse = p; }
    });
  }

  const top8 = ranked.slice(0, 8);
  const rest = ranked.slice(8);
  const restShown = rest.slice(0, REST_CAP);
  const restHidden = rest.length - restShown.length;

  const dhIndex = darkHorse ? currIndex[darkHorse.id] : -1;
  const dhInTop8 = dhIndex >= 0 && dhIndex < 8;
  const dhInRest = dhIndex >= 8 && dhIndex < 8 + restShown.length;
  const dhOffScreen = !!darkHorse && !dhInTop8 && !dhInRest;

  const Arrow = ({ m }: { m: number }) => {
    if (round <= 1 || m === 0) return null;
    const up = m > 0;
    return (
      <span style={{ fontSize: 13, fontWeight: 500, color: up ? '#22c55e' : '#ef4444', whiteSpace: 'nowrap' }}>
        {up ? `▲${m}` : `▼${Math.abs(m)}`}
      </span>
    );
  };

  return (
    <div className="w-full h-full flex flex-col px-4 pt-2 overflow-hidden">
      <style>{`
        @keyframes lbFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lbPulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } 35% { box-shadow: 0 0 22px 3px rgba(34,197,94,0.55); } 100% { box-shadow: 0 0 0 1.5px rgba(34,197,94,0.7); } }
        .lb-cell { opacity: 0; animation: lbFade 0.35s ease-out forwards; }
        .lb-dh { animation: lbPulse 1s ease-out 0.9s forwards; }
      `}</style>

      <div className="grid gap-6 flex-1 overflow-hidden" style={{ gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)' }}>

        {/* ===== LEFT — Top 8 racing ===== */}
        <div className="flex flex-col overflow-hidden">
          <div style={{ fontSize: 13, letterSpacing: 1, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>TOP 8</div>
          <div style={{ position: 'relative', height: 8 * ROWH }}>
            {top8.map((p, i) => {
              const money = parseFloat(p.money) || 0;
              const m = movementOf(p, i);
              const top3 = i < 3;
              const col = top3 ? MEDAL_COLORS[i] : 'rgba(255,255,255,0.82)';
              const startIdx = round > 1 ? Math.min(7, prevIndex[p.id] ?? i) : i;
              const y = (settled ? i : startIdx) * ROWH;
              const isDH = !!darkHorse && darkHorse.id === p.id;
              return (
                <div
                  key={p.id}
                  className={isDH ? 'lb-dh' : ''}
                  style={{
                    position: 'absolute', left: 0, right: 0, height: ROWH - 6,
                    transform: `translateY(${y}px)`,
                    transition: 'transform 0.9s cubic-bezier(.34,1.4,.5,1)',
                    display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
                    borderRadius: 10, boxSizing: 'border-box',
                    background: isDH ? 'rgba(34,197,94,0.16)'
                      : i === 0 ? 'rgba(255,215,0,0.12)'
                      : top3 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
                    boxShadow: isDH ? '0 0 0 1.5px rgba(34,197,94,0.7)' : 'none',
                  }}
                >
                  <span style={{ width: 34, textAlign: 'center', fontSize: top3 ? 26 : 18, color: 'rgba(255,255,255,0.5)' }}>
                    {top3 ? MEDALS[i] : i + 1}
                  </span>
                  {isDH && <span style={{ fontSize: 22 }}>🐎</span>}
                  <span style={{ flex: '0 1 auto', fontSize: top3 ? 24 : 20, fontWeight: 500, color: col, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </span>
                  {settled && <Arrow m={m} />}
                  <span style={{ marginLeft: 'auto', fontSize: top3 ? 22 : 18, fontWeight: 500, color: col, fontVariantNumeric: 'tabular-nums' }}>
                    ฿{money.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== RIGHT — all remaining ranks ===== */}
        <div className="flex flex-col overflow-hidden">
          <div style={{ fontSize: 13, letterSpacing: 1, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            อันดับ #9+ · {rest.length === 0 ? '—' : `แสดง ${restShown.length}/${rest.length} · Everyone`}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 4, alignContent: 'start', flex: 1, overflow: 'hidden' }}>
            {restShown.map((p, i) => {
              const rank = i + 9;
              const m = movementOf(p, i + 8);
              const isDH = !!darkHorse && darkHorse.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`lb-cell ${isDH ? 'lb-dh' : ''}`}
                  style={{
                    animationDelay: `${Math.min(i * 12, 800)}ms`,
                    display: 'flex', alignItems: 'center', gap: 5, padding: '4px 7px',
                    borderRadius: 6, height: 26, boxSizing: 'border-box',
                    background: isDH ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.035)',
                    boxShadow: isDH ? '0 0 0 1.5px rgba(34,197,94,0.7)' : 'none',
                  }}
                >
                  <span style={{ minWidth: 24, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>{rank}</span>
                  <span style={{ flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.82)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isDH ? '🐎 ' : ''}{p.name}
                  </span>
                  <Arrow m={m} />
                </div>
              );
            })}
            {restHidden > 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.5)', paddingTop: 4 }}>
                + อีก {restHidden} คน
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Dark-horse strip (only when DH is off-screen) ===== */}
      {dhOffScreen && (
        <div
          className="lb-dh"
          style={{
            margin: '8px 0 4px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 12,
            borderRadius: 8, background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.4)',
          }}
        >
          <span style={{ fontSize: 22 }}>🐎</span>
          <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: 0.5, color: '#22c55e', whiteSpace: 'nowrap' }}>ม้ามืดรอบนี้ · Dark Horse</span>
          <span style={{ fontSize: 17, fontWeight: 500, color: '#fff' }}>
            {darkHorse.name} · #{(prevIndex[darkHorse.id] ?? 0) + 1} → #{dhIndex + 1}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 500, color: '#22c55e', whiteSpace: 'nowrap' }}>
            พุ่งขึ้น {dhJump} อันดับ!
          </span>
        </div>
      )}
    </div>
  );
}
