'use client';

import { useState } from 'react';
import { COMPANIES, ALLOCATION_STEP } from '@/lib/constants';

// ========== Types ==========

interface InvestmentPanelProps {
  playerId: string;
  roomId: string;
  money: number;
  currentPortfolio: Record<string, number>;
  isRebalance?: boolean;
  onSubmitted?: () => void;
}

// ========== Sub-components ==========

function RiskBadge({ risk }: { risk: string }) {
  const colors: Record<string, string> = {
    'Very Low': '#22C55E',
    Medium: '#F59E0B',
    'Medium-High': '#F97316',
    High: '#EF4444',
  };
  const c = colors[risk] || '#666';
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ color: c, backgroundColor: `${c}20`, border: `1px solid ${c}40` }}
    >
      {risk}
    </span>
  );
}

function PortfolioBar({ allocations }: { allocations: Record<string, number> }) {
  const total = Object.values(allocations).reduce((a, b) => a + b, 0);
  const cashPct = 100 - total;

  return (
    <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ background: '#ffffff10' }}>
      {COMPANIES.map((c) =>
        allocations[c.id] > 0 ? (
          <div
            key={c.id}
            className="h-full transition-all duration-300"
            style={{
              width: `${allocations[c.id]}%`,
              backgroundColor: c.color,
            }}
          />
        ) : null
      )}
      {/* Cash portion — subtle gray */}
      {cashPct > 0 && (
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${cashPct}%`,
            backgroundColor: '#ffffff15',
          }}
        />
      )}
    </div>
  );
}

// ========== Main Component ==========

export default function InvestmentPanel({
  playerId,
  roomId,
  money,
  currentPortfolio,
  isRebalance = false,
  onSubmitted,
}: InvestmentPanelProps) {
  // Initialize: rebalance prefills from existing portfolio, invest starts at 0
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    COMPANIES.forEach((c) => {
      initial[c.id] = currentPortfolio[c.id] || 0;
    });
    return initial;
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = Object.values(allocations).reduce((a, b) => a + b, 0);
  const cashPct = 100 - total;

  // Adjust allocation for a company
  const adjust = (id: string, delta: number) => {
    if (submitted) return;
    const current = allocations[id];
    const newVal = Math.max(0, Math.min(100, current + delta));
    const newTotal = total - current + newVal;
    if (newTotal <= 100) {
      setAllocations({ ...allocations, [id]: newVal });
    }
  };

  // Submit portfolio to API
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/players/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId,
          room_id: roomId,
          portfolio: allocations,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit');
        return;
      }

      setSubmitted(true);
      onSubmitted?.();
    } catch {
      setError('Network error — try again');
    } finally {
      setSubmitting(false);
    }
  };

  // Unlock for editing after submit
  const handleEdit = () => {
    setSubmitted(false);
    setError('');
  };

  // ========== Render ==========

  // Submitted state — show summary + edit button
  if (submitted) {
    return (
      <div className="flex flex-col h-full">
        {/* Success header */}
        <div className="text-center mb-4 pt-2">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
            style={{ background: '#00FFB220', border: '1px solid #00FFB240' }}
          >
            <span className="text-lg">✓</span>
            <span className="text-sm font-mono font-bold" style={{ color: '#00FFB2' }}>
              SUBMITTED
            </span>
          </div>
          <p className="text-sm" style={{ color: '#ffffff60' }}>
            Waiting for MC to continue...
          </p>
        </div>

        {/* Portfolio summary */}
        <div
          className="rounded-xl p-3 mb-4"
          style={{ background: '#ffffff05', border: '1px solid #ffffff10' }}
        >
          <PortfolioBar allocations={allocations} />
          <div className="mt-3 space-y-1.5">
            {COMPANIES.map((c) =>
              allocations[c.id] > 0 ? (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{c.icon}</span>
                    <span className="text-xs text-white">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono" style={{ color: c.color }}>
                      {allocations[c.id]}%
                    </span>
                    <span className="text-xs font-mono" style={{ color: '#ffffff40' }}>
                      ฿{Math.round((allocations[c.id] / 100) * money).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : null
            )}
            {cashPct > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💵</span>
                  <span className="text-xs text-white">Cash</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono" style={{ color: '#ffffff60' }}>
                    {cashPct}%
                  </span>
                  <span className="text-xs font-mono" style={{ color: '#ffffff40' }}>
                    ฿{Math.round((cashPct / 100) * money).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit button */}
        <button
          onClick={handleEdit}
          className="w-full py-3 rounded-lg font-mono text-sm tracking-wider transition-all"
          style={{ background: '#ffffff10', color: '#ffffff60', border: '1px solid #ffffff15' }}
        >
          ✏️ EDIT PORTFOLIO
        </button>
      </div>
    );
  }

  // ========== Editing state ==========
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-3 pt-2">
        <span
          className="text-xs font-mono tracking-wider px-3 py-1 rounded-full"
          style={{ background: '#00D4FF15', border: '1px solid #00D4FF30', color: '#00D4FF' }}
        >
          {isRebalance ? 'REBALANCE' : 'INVESTMENT PHASE'}
        </span>
        <h2 className="text-lg font-bold text-white mt-2">
          {isRebalance ? 'Adjust Your Portfolio' : 'Allocate Your Fund'}
        </h2>
      </div>

      {/* Portfolio summary bar */}
      <div
        className="rounded-xl p-3 mb-3"
        style={{ background: '#00D4FF08', border: '1px solid #00D4FF20' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono" style={{ color: '#ffffff60' }}>
            PORTFOLIO
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: cashPct > 0 ? '#F59E0B' : '#00FFB2' }}
          >
            {cashPct > 0 ? `💵 ${cashPct}% cash` : '✓ Fully invested'}
          </span>
        </div>
        <PortfolioBar allocations={allocations} />
        <div className="flex justify-between mt-2">
          <span className="text-xs font-mono" style={{ color: '#ffffff40' }}>
            ฿{money.toLocaleString()}
          </span>
          <span className="text-sm font-bold font-mono text-white">
            {total}%
            <span className="text-xs ml-1" style={{ color: '#ffffff40' }}>
              invested
            </span>
          </span>
        </div>
      </div>

      {/* Company cards */}
      <div
        className="space-y-2 flex-1 overflow-y-auto pb-2"
        style={{ maxHeight: 'calc(100vh - 340px)' }}
      >
        {COMPANIES.map((c) => (
          <div
            key={c.id}
            className="rounded-xl p-3 transition-all duration-300"
            style={{
              background: allocations[c.id] > 0 ? `${c.color}08` : '#ffffff05',
              border: `1px solid ${allocations[c.id] > 0 ? `${c.color}30` : '#ffffff10'}`,
            }}
          >
            <div className="flex items-center gap-3">
              {/* Emoji + Info */}
              <div className="text-2xl">{c.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-sm text-white truncate">{c.name}</span>
                  <RiskBadge risk={c.risk} />
                </div>
                <p className="text-xs" style={{ color: '#ffffff40' }}>
                  {c.type}
                </p>
              </div>

              {/* +/- Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjust(c.id, -ALLOCATION_STEP)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                  style={{
                    background: '#ffffff10',
                    color: allocations[c.id] > 0 ? '#ffffff' : '#ffffff20',
                  }}
                >
                  −
                </button>
                <div
                  className="w-14 h-9 rounded-lg flex items-center justify-center font-bold font-mono text-sm"
                  style={{
                    background: allocations[c.id] > 0 ? `${c.color}20` : '#ffffff08',
                    color: allocations[c.id] > 0 ? c.color : '#ffffff30',
                    border: `1px solid ${allocations[c.id] > 0 ? `${c.color}40` : '#ffffff10'}`,
                  }}
                >
                  {allocations[c.id]}%
                </div>
                <button
                  onClick={() => adjust(c.id, ALLOCATION_STEP)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                  style={{
                    background: '#ffffff10',
                    color: cashPct > 0 ? '#ffffff' : '#ffffff20',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Amount bar — show when allocated */}
            {allocations[c.id] > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: '#ffffff10' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${allocations[c.id]}%`, backgroundColor: c.color }}
                  />
                </div>
                <span className="text-xs font-mono" style={{ color: c.color }}>
                  ฿{Math.round((allocations[c.id] / 100) * money).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div
          className="rounded-lg p-2 mb-2 text-center text-xs"
          style={{ background: '#EF444420', color: '#EF4444', border: '1px solid #EF444440' }}
        >
          {error}
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={handleSubmit}
        disabled={submitting || total === 0}
        className="w-full py-4 rounded-lg font-bold text-base tracking-wider font-mono mt-2 transition-all duration-300"
        style={{
          background:
            total > 0
              ? 'linear-gradient(135deg, #00FFB2, #00D4FF)'
              : '#ffffff10',
          color: total > 0 ? '#0D1117' : '#ffffff30',
          boxShadow: total > 0 ? '0 0 30px #00FFB230' : 'none',
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting
          ? '⏳ SUBMITTING...'
          : total === 0
            ? 'Allocate at least 10%'
            : `CONFIRM ${total}% INVESTED →`}
      </button>

      {/* Cash hint */}
      {cashPct > 0 && total > 0 && (
        <p className="text-center text-xs mt-2 font-mono" style={{ color: '#F59E0B80' }}>
          💵 {cashPct}% stays as cash (0% return)
        </p>
      )}
    </div>
  );
}
