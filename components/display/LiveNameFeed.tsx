// FILE: components/display/LiveNameFeed.tsx — Research sidebar live feed (newest on top)
// VERSION: B16b-v1 — submitted names flow in from top, push older down, fade out at bottom
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16b created — replaces plain quiz-submitted counter in ResearchDisplay right column
'use client';

import { useEffect, useRef, useState } from 'react';

interface LiveNameFeedProps {
  players: any[];
  round: number;
}

const AVATAR_COLORS = ['#22c55e', '#38bdf8', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];

function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function LiveNameFeed({ players, round }: LiveNameFeedProps) {
  const total = players.length;
  const submittedCount = players.filter((p) => (p.quiz_answered_round || 0) >= round).length;

  const seen = useRef<Set<string>>(new Set());
  const orderRef = useRef<string[]>([]);
  const prevRound = useRef(round);
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    if (prevRound.current !== round) {
      prevRound.current = round;
      seen.current = new Set();
      orderRef.current = [];
      setOrder([]);
    }
    const submittedIds = players
      .filter((p) => (p.quiz_answered_round || 0) >= round)
      .map((p) => p.id);
    const fresh = submittedIds.filter((id) => !seen.current.has(id));
    if (fresh.length) {
      fresh.forEach((id) => seen.current.add(id));
      orderRef.current = [...fresh.reverse(), ...orderRef.current];
      setOrder([...orderRef.current]);
    }
  }, [players, round]);

  const byId: Record<string, any> = {};
  players.forEach((p) => { byId[p.id] = p; });

  return (
    <div className="h-full flex flex-col" style={{ paddingLeft: 4 }}>
      <style>{`@keyframes feedIn{from{opacity:0;transform:translateY(-7px)}to{opacity:1;transform:none}}`}</style>

      {/* count */}
      <div className="text-center flex-shrink-0" style={{ marginBottom: 14 }}>
        <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 52, color: '#00FFB2', lineHeight: 1 }}>
          {submittedCount}<span style={{ fontSize: 26, color: 'rgba(255,255,255,0.4)' }}>/{total}</span>
        </p>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>ส่งคำตอบแล้ว · Answered</p>
      </div>

      {/* feed */}
      <div className="flex-1 relative" style={{ minHeight: 0, overflow: 'hidden' }}>
        <div className="flex flex-col" style={{ gap: 7 }}>
          {order.map((id, idx) => {
            const p = byId[id];
            if (!p) return null;
            const c = colorFor(id);
            const newest = idx === 0;
            return (
              <div
                key={id}
                className="flex items-center rounded-xl"
                style={{
                  gap: 9,
                  padding: '8px 11px',
                  background: 'rgba(0,255,178,0.10)',
                  border: '0.5px solid rgba(0,255,178,0.3)',
                  animation: 'feedIn .3s ease',
                }}
              >
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: `${c}22`, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
                  {(p.name || '?').charAt(0)}
                </div>
                <span style={{ color: '#eafff4', fontSize: 17, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </span>
                {newest ? (
                  <span style={{ fontSize: 12, color: '#86efac', background: 'rgba(34,197,94,0.18)', padding: '2px 8px', borderRadius: 7, flexShrink: 0 }}>เพิ่งส่ง</span>
                ) : (
                  <span style={{ color: '#4ade80', fontSize: 17, flexShrink: 0 }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
        {/* fade-out bottom */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 56, pointerEvents: 'none', background: 'linear-gradient(transparent, #0D1117)' }} />
      </div>
    </div>
  );
}
