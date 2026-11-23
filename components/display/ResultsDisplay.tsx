// FILE: components/display/ResultsDisplay.tsx — Display results phase (per-player P&L heatmap)
// VERSION: B26-fit2 — เลือก compact จากการพอดีความสูง (ไม่ใช่ n > 110) + ชดเชยความกว้างเมื่อ scale < 1 → เต็มความกว้างทุกขนาดห้อง | prev: B26-fit
// LAST MODIFIED: 20 Nov 2026
// HISTORY: [B26 FitName: คงท้าย ".X" ของชื่อเมื่อช่องแคบ] B16a-BATCH0 extracted inline results block from display/page.tsx | B16c spectator heatmap (replace sector-pills + top-earners view) | B26 large-roster fit (compact tier > 110 + useFitScale safety)
'use client';

import { useEffect, useMemo, useState } from 'react';
import FitName from '@/components/common/FitName';
import { useFitScale } from '@/hooks/useFitScale';

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
  // ✅ B26-fit2: เลือกคอลัมน์/ความหนาแน่นจาก "กี่แถว × สูงเท่าไหร่ พอดีกล่องไหม" (เดิมเกณฑ์ตายตัว n > 110 → ห้อง 73–80 และ 97–110 คน
  //    สูงเกินกล่อง ถูกย่อ 84–93% ไปอยู่กลางจอ) · พื้นที่กริด ≈ 568px · ความสูงต่อแถว: ปกติ ~61 · compact ~41
  const AVAIL = 560;
  const cols0 = data.count <= 48 ? 6 : data.count <= 80 ? 8 : 10;
  const rowsAt = (c: number) => Math.ceil(Math.max(1, data.count) / c);
  let compact = false;
  let cols = cols0;
  if (rowsAt(cols0) * 61 > AVAIL) {
    compact = true;
    cols = [cols0, 8, 10, 12, 14, 16].find((c) => c >= cols0 && rowsAt(c) * 41 <= AVAIL) || 16;
  }
  const { boxRef, innerRef, scale } = useFitScale([data.count, cols]); // กันล้นทุก N (ปกติ scale = 1)
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
      <div ref={boxRef} className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
      <div
        ref={innerRef}
        style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: compact ? 4 : 5, alignContent: 'start', transform: `scale(${scale})`, transformOrigin: scale < 1 ? 'top left' : 'top center', width: scale < 1 ? `${100 / scale}%` : undefined }}
      >
        {data.azRows.map((r, i) => {
          const { bg, border } = bucket(r.chg, data.maxAbs);
          const amtCol = r.chg > 120 ? '#4ade80' : r.chg < -120 ? '#f87171' : 'rgba(255,255,255,0.55)';
          const sign = r.chg > 0 ? '+' : r.chg < 0 ? '−' : '';
          return (
            <div
              key={r.id}
              style={{
                minHeight: compact ? 36 : 44, padding: compact ? '2px 5px' : '5px 6px', borderRadius: 7, boxSizing: 'border-box',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                background: revealed ? bg : 'rgba(255,255,255,0.05)',
                border: `1px solid ${revealed ? border : 'rgba(255,255,255,0.1)'}`,
                transition: 'background 0.45s ease, border-color 0.45s ease',
                transitionDelay: `${i * perCell}ms`,
              }}
            >
              <FitName name={r.name} style={{ fontSize: compact ? 13 : 15, lineHeight: compact ? 1.25 : undefined, color: 'rgba(255,255,255,0.9)', maxWidth: '100%' }} />
              <span
                style={{
                  fontSize: compact ? 12 : 14, lineHeight: compact ? 1.2 : undefined, fontWeight: 500, fontVariantNumeric: 'tabular-nums', marginTop: compact ? 0 : 1,
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
