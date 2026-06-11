// FILE: components/display/LiveNameBoard.tsx — Spectator name wall (invest + chance_card)
// VERSION: B16b-v1 — fit-all roster grid, A-Z sort, degrade tiers, light-in-place
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16b created — shared grid wall for invest (allocation bar) + chance_card (luck amount)
'use client';

import { useEffect, useRef, useState } from 'react';
import { COMPANIES } from '@/lib/constants';

interface LiveNameBoardProps {
  players: any[];
  round: number;
  variant: 'invest' | 'chance';
}

const PAGE_SIZE = 96;
const PAGE_ROTATE_MS = 9000;

function sortByName(players: any[]) {
  return [...players].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', 'th', { sensitivity: 'base' })
  );
}

function isSubmitted(p: any, round: number, variant: 'invest' | 'chance') {
  return variant === 'invest'
    ? p.portfolio_submitted_round === round
    : (p.duel_submitted_round || 0) >= round;
}

function tierOf(n: number) {
  if (n <= 80) return { cols: n <= 60 ? 6 : 7, detail: true, paginate: false };
  if (n <= 110) return { cols: n <= 95 ? 8 : 9, detail: false, paginate: false };
  return { cols: 8, detail: false, paginate: true };
}

export default function LiveNameBoard({ players, round, variant }: LiveNameBoardProps) {
  const sorted = sortByName(players);
  const N = sorted.length;
  const submittedCount = sorted.filter((p) => isSubmitted(p, round, variant)).length;
  const tier = tierOf(N);

  // chance summary
  const opened = sorted.filter((p) => isSubmitted(p, round, variant));
  const gainCount = opened.filter((p) => (parseFloat(p.duel_money_change) || 0) > 0).length;
  const lossCount = opened.filter((p) => (parseFloat(p.duel_money_change) || 0) < 0).length;

  // pagination (only when very large)
  const pageCount = tier.paginate ? Math.ceil(N / PAGE_SIZE) : 1;
  const [pageIdx, setPageIdx] = useState(0);
  useEffect(() => {
    if (!tier.paginate || pageCount <= 1) { setPageIdx(0); return; }
    const id = setInterval(() => setPageIdx((i) => (i + 1) % pageCount), PAGE_ROTATE_MS);
    return () => clearInterval(id);
  }, [tier.paginate, pageCount]);

  const start = tier.paginate ? (pageIdx % pageCount) * PAGE_SIZE : 0;
  const visible = tier.paginate ? sorted.slice(start, start + PAGE_SIZE) : sorted;
  const cols = tier.cols;
  const rows = Math.max(1, Math.ceil(visible.length / cols));

  // "just submitted" pop animation — diff across throttled reloads
  const prevSubmitted = useRef<Set<string>>(new Set());
  const firstRun = useRef(true);
  const prevRound = useRef(round);
  const [justIds, setJustIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    const cur = new Set<string>(
      players.filter((p) => isSubmitted(p, round, variant)).map((p) => p.id)
    );
    if (prevRound.current !== round) {
      prevRound.current = round;
      prevSubmitted.current = cur;
      setJustIds(new Set());
      return;
    }
    if (firstRun.current) {
      firstRun.current = false;
      prevSubmitted.current = cur;
      return;
    }
    const fresh = new Set<string>();
    cur.forEach((id) => { if (!prevSubmitted.current.has(id)) fresh.add(id); });
    prevSubmitted.current = cur;
    if (fresh.size) {
      setJustIds(fresh);
      const t = setTimeout(() => setJustIds(new Set()), 600);
      return () => clearTimeout(t);
    }
  }, [players, round, variant]);

  const nameSize = tier.detail ? (cols <= 6 ? 22 : 18) : (N <= 110 ? 16 : 14);
  const amtSize = tier.detail ? (cols <= 6 ? 19 : 16) : 14;
  const barH = cols <= 6 ? 11 : 9;

  function renderCell(p: any) {
    const submitted = isSubmitted(p, round, variant);
    const just = justIds.has(p.id);
    let bg = 'rgba(255,255,255,0.02)';
    let border = '0.5px solid rgba(255,255,255,0.05)';
    let nameColor = 'rgba(255,255,255,0.42)';
    let detailNode: React.ReactNode = null;

    if (variant === 'invest') {
      if (submitted) {
        bg = 'rgba(255,255,255,0.05)';
        nameColor = '#ffffff';
        if (tier.detail) {
          const portfolio = p.portfolio || {};
          const segs = COMPANIES
            .map((c) => ({ color: c.color, pct: parseFloat(portfolio[c.id]) || 0 }))
            .filter((s) => s.pct > 0);
          detailNode = (
            <div className="rounded-full overflow-hidden flex" style={{ width: '80%', height: barH, background: segs.length ? 'rgba(255,255,255,0.08)' : 'rgba(245,158,11,0.25)' }}>
              {segs.map((s, i) => (
                <div key={i} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
              ))}
            </div>
          );
        }
      } else if (tier.detail) {
        detailNode = <div className="rounded-full" style={{ width: '80%', height: barH, background: 'transparent' }} />;
      }
    } else {
      // chance
      const amount = submitted ? (parseFloat(p.duel_money_change) || 0) : 0;
      if (submitted) {
        nameColor = '#ffffff';
        if (amount > 0) { bg = 'rgba(34,197,94,0.14)'; border = '0.5px solid rgba(34,197,94,0.55)'; }
        else if (amount < 0) { bg = 'rgba(239,68,68,0.14)'; border = '0.5px solid rgba(239,68,68,0.55)'; }
        else { bg = 'rgba(255,255,255,0.06)'; border = '0.5px solid rgba(255,255,255,0.18)'; }
        if (tier.detail) {
          const amtColor = amount > 0 ? '#4ade80' : amount < 0 ? '#f87171' : 'rgba(255,255,255,0.7)';
          const amtText = amount > 0 ? `+฿${amount.toLocaleString()}` : amount < 0 ? `−฿${Math.abs(amount).toLocaleString()}` : '฿0';
          detailNode = <span style={{ fontSize: amtSize, fontWeight: 700, lineHeight: 1, color: amtColor }}>{amtText}</span>;
        }
      }
    }

    return (
      <div
        key={p.id}
        className="flex flex-col items-center justify-center rounded-md overflow-hidden"
        style={{
          gap: 3,
          minHeight: 0,
          padding: '3px 6px',
          background: bg,
          border,
          transform: just ? 'scale(1.12)' : 'scale(1)',
          transition: 'transform .25s ease, background .3s ease, border-color .5s ease',
        }}
      >
        <span style={{ fontSize: nameSize, fontWeight: 500, color: nameColor, maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.15 }}>
          {p.name}
        </span>
        {detailNode}
      </div>
    );
  }

  const label = variant === 'invest' ? 'จัดพอร์ตแล้ว · Submitted' : 'เปิดการ์ดแล้ว · Opened';

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      {/* count strip */}
      <div className="flex items-center justify-between flex-shrink-0" style={{ marginBottom: 8 }}>
        <div className="flex items-center" style={{ gap: 12 }}>
          <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
          {variant === 'chance' && (gainCount > 0 || lossCount > 0) && (
            <span style={{ fontSize: 15 }}>
              <span style={{ color: '#4ade80' }}>▲ {gainCount}</span>
              <span style={{ color: '#f87171', marginLeft: 8 }}>▼ {lossCount}</span>
            </span>
          )}
        </div>
        <span>
          <span style={{ color: '#4ade80', fontSize: 24, fontWeight: 700 }}>{submittedCount}</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16 }}> / {N}</span>
        </span>
      </div>

      {/* paginate notice */}
      {tier.paginate && pageCount > 1 && (
        <div className="flex-shrink-0 text-center rounded-md" style={{ marginBottom: 6, padding: '3px 10px', fontSize: 13, color: '#fcd34d', background: 'rgba(245,158,11,0.12)', border: '0.5px solid rgba(245,158,11,0.3)' }}>
          {N} คน — สลับหน้า {(pageIdx % pageCount) + 1}/{pageCount} (หน้าละ {PAGE_SIZE})
        </div>
      )}

      {/* wall */}
      <div
        className="flex-1 min-h-0 grid"
        style={{
          gap: 5,
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {visible.map((p) => renderCell(p))}
      </div>

      {/* invest legend */}
      {variant === 'invest' && tier.detail && (
        <div className="flex-shrink-0 flex flex-wrap items-center justify-center" style={{ gap: 14, marginTop: 9, paddingTop: 9, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {COMPANIES.map((c) => (
            <div key={c.id} className="flex items-center" style={{ gap: 5 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: c.color, display: 'inline-block' }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)' }}>{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
