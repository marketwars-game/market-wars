// FILE: components/display/ResultsDisplay.tsx — Display results phase (per-player P&L heatmap)
// VERSION: B16c-v1 — heatmap grid of every player (this-round gain/loss), A-Z, relative intensity, wave reveal
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16a-BATCH0 extracted inline results block from display/page.tsx | B16c spectator heatmap (replace sector-pills + top-earners view)
'use client';

import { useEffect, useMemo, useState } from 'react';

interface ResultsDisplayProps {
  players: any[];
  round: number;
}

const FLAT = 150; // |change| under this counts as ~flat (gray)

// this-round change = stock return (round_returns[round].total_return) + chance card cash (duel_money_change)
function changeOf(p: any, round: number): number {
  const stock = p.round_returns?.[String(round)]?.total_return || 0;
  const hasChance = (p.duel_submitted_round || 0) >= round;
  const chance = hasChance ? (parseFloat(p.duel_money_change) || 0) : 0;
  return stock + chance;
}

function bucket(v: number, maxAbs: number): { bg: string; border: string } {
  if (Math.abs(v) < FLAT) return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
  const lvl = Math.min(3, Math.ceil((Math.abs(v) / maxAbs) * 3));
  if (v > 0) {
    const a = [0, 0.09, 0.22, 0.42][lvl];
    return { bg: `rgba(34,197,94,${a})`, border: lvl >= 3 ? 'rgba(34,197,94,0.85)' : 'transparent' };
  }
  const a = [0, 0.1, 0.24, 0.44][lvl];
  return { bg: `rgba(239,68,68,${a})`, border: lvl >= 3 ? 'rgba(239,68,68,0.85)' : 'transparent' };
}

export default function ResultsDisplay({ players, round }: ResultsDisplayProps) {
  const [revealed, setRevealed] = useState(false);

  // wave reveal: colours sweep in over ~0.8s after mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const data = useMemo(() => {
    const rows = players.map((p) => ({ id: p.id, name: p.name, chg: changeOf(p, round) }));
    const azRows = [...rows].sort((a, b) => String(a.name).localeCompare(String(b.name)));
    const maxAbs = Math.max(800, ...rows.map((r) => Math.abs(r.chg)));
    const up = rows.filter((r) => r.chg > 120).length;
    const dn = rows.filter((r) => r.chg < -120).length;
    const best = rows.reduce((a, b) => (b.chg > a.chg ? b : a), rows[0] || { name: '—', chg: 0 });
    const worst = rows.reduce((a, b) => (b.chg < a.chg ? b : a), rows[0] || { name: '—', chg: 0 });
    return { azRows, maxAbs, up, dn, best, worst, count: rows.length };
  }, [players, round]);

  // columns scale with headcount to keep cells readable but fit-all (no scroll)
  const cols = data.count <= 48 ? 6 : data.count <= 80 ? 8 : 10;
  const perCell = Math.max(4, Math.min(10, Math.round(700 / Math.max(1, data.count))));

  return (
    <div className="w-full h-full flex flex-col px-4 pt-1 overflow-hidden">
      {/* ===== summary bar ===== */}
      <div className="flex items-center flex-wrap gap-x-6 gap-y-1 mb-3" style={{ fontSize: 16 }}>
        <span style={{ color: '#22c55e' }}>▲ <b style={{ fontWeight: 500 }}>{data.up}</b> กำไร</span>
        <span style={{ color: '#ef4444' }}>▼ <b style={{ fontWeight: 500 }}>{data.dn}</b> ขาดทุน</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span style={{ color: 'rgba(255,255,255,0.75)' }}>🏆 รอบนี้: <b style={{ color: '#22c55e', fontWeight: 500 }}>{data.best.name} +฿{Math.max(0, data.best.chg).toLocaleString()}</b></span>
        <span style={{ color: 'rgba(255,255,255,0.75)' }}>💀 เจ็บสุด: <b style={{ color: '#ef4444', fontWeight: 500 }}>{data.worst.name} −฿{Math.abs(Math.min(0, data.worst.chg)).toLocaleString()}</b></span>
      </div>

      {/* ===== heatmap grid ===== */}
      <div
        className="flex-1 overflow-hidden"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 5, alignContent: 'start' }}
      >
        {data.azRows.map((r, i) => {
          const { bg, border } = bucket(r.chg, data.maxAbs);
          const amtCol = r.chg > 120 ? '#4ade80' : r.chg < -120 ? '#f87171' : 'rgba(255,255,255,0.55)';
          const sign = r.chg > 0 ? '+' : r.chg < 0 ? '−' : '';
          return (
            <div
              key={r.id}
              style={{
                minHeight: 44, padding: '5px 6px', borderRadius: 7, boxSizing: 'border-box',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                background: revealed ? bg : 'rgba(255,255,255,0.05)',
                border: `1px solid ${revealed ? border : 'rgba(255,255,255,0.1)'}`,
                transition: 'background 0.45s ease, border-color 0.45s ease',
                transitionDelay: `${i * perCell}ms`,
              }}
            >
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{r.name}</span>
              <span
                style={{
                  fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums', marginTop: 1,
                  color: revealed ? amtCol : 'rgba(255,255,255,0.25)',
                  transition: 'color 0.45s ease', transitionDelay: `${i * perCell}ms`,
                }}
              >
                {sign}฿{Math.abs(r.chg).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {/* ===== legend ===== */}
      <div className="flex items-center gap-2 mt-2" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
        <span>กำไรมาก</span>
        <span style={{ display: 'flex', gap: 2 }}>
          {['rgba(34,197,94,0.42)', 'rgba(34,197,94,0.22)', 'rgba(34,197,94,0.09)', 'rgba(255,255,255,0.05)', 'rgba(239,68,68,0.1)', 'rgba(239,68,68,0.24)', 'rgba(239,68,68,0.44)'].map((c, i) => (
            <span key={i} style={{ width: 22, height: 12, background: c, borderRadius: 2 }} />
          ))}
        </span>
        <span>ขาดทุนมาก</span>
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.65)' }}>📱 ดูผลของตัวเองที่มือถือ · Check your phone</span>
      </div>
    </div>
  );
}
