// FILE: components/display/DisplayHeader.tsx — Display top bar (phase progress + year)
// VERSION: B16a-v1 — extracted from display/page.tsx (refactor shell, no behavior change)
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16a-BATCH0 extracted inline Header from display/page.tsx
'use client';

import { TOTAL_ROUNDS } from '@/lib/constants';
import { getStepGroupProgress } from '@/lib/game-engine';

type StepProgress = ReturnType<typeof getStepGroupProgress>;

export default function DisplayHeader({ steps, round }: { steps: StepProgress; round: number }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '2px solid rgba(0,255,178,0.15)' }}>
      <span className="text-xl font-black tracking-wider" style={{ fontFamily: 'monospace', color: '#00FFB2' }}>MARKET WARS</span>
      <div className="flex items-center gap-0.5">
        {steps.map((step, i) => {
          const isCurrent = step.status === 'current';
          const isDone = step.status === 'done';
          return (
            <div key={step.id} className="flex items-center">
              <span className="px-3 py-1 rounded-full whitespace-nowrap font-semibold" style={{
                fontSize: isCurrent ? '15px' : '13px',
                color: isCurrent ? '#00FFB2' : isDone ? 'rgba(255,255,255,0.45)' : '#ffffff',
                background: isCurrent ? 'rgba(0,255,178,0.15)' : 'transparent',
                border: isCurrent ? '1px solid rgba(0,255,178,0.4)' : '1px solid transparent',
                textDecoration: isDone ? 'line-through' : 'none',
              }}>
                {step.icon} {step.label}
              </span>
              {i < steps.length - 1 && (
                <span className="mx-0.5 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>
              )}
            </div>
          );
        })}
      </div>
      <span className="text-base font-bold px-4 py-1.5 rounded-full whitespace-nowrap" style={{ color: '#00D4FF', background: 'rgba(0,212,255,0.12)' }}>
        ปีที่ {round} / {TOTAL_ROUNDS}
      </span>
    </div>
  );
}
