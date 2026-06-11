// FILE: components/display/InvestDisplay.tsx — Display invest phase (submitted count + sectors)
// VERSION: B16a-v1 — extracted from display/page.tsx (refactor shell, no behavior change)
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16a-BATCH0 extracted inline invest block from display/page.tsx
'use client';

import { COMPANIES } from '@/lib/constants';

export default function InvestDisplay({ submittedCount, playerCount }: { submittedCount: number; playerCount: number }) {
  return (
    <div className="text-center w-full">
      <p className="text-7xl font-bold font-mono" style={{ color: '#00FFB2' }}>{submittedCount}/{playerCount}</p>
      <p className="text-2xl font-mono mt-3" style={{ color: 'rgba(255,255,255,0.75)' }}>portfolios submitted</p>
      <div className="mt-6 grid grid-cols-6 gap-3 max-w-3xl mx-auto">
        {COMPANIES.map((c) => (
          <div key={c.id} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${c.color}` }}>
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-sm font-semibold" style={{ color: c.color }}>{c.name}</div>
            <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{c.risk}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
