// FILE: components/display/FitStage.tsx — Fixed 1280×720 canvas scaled to fit any viewport (letterbox)
// VERSION: B21 — fit-to-screen; ported from YoungGen YG-V2 (retire CSS zoom)
// LAST MODIFIED: 10 Jul 2026
// HISTORY: B21 created (backport FitStage from YoungGen YG-V2 — fixed 1280x720 stage, transform:scale letterbox)
'use client';

import type { ReactNode } from 'react';

export const STAGE_W = 1280;
export const STAGE_H = 720;

export default function FitStage({ scale, children }: { scale: number; children: ReactNode }) {
  return (
    <div className="fixed inset-0 bg-[#0D1117] overflow-hidden grid place-items-center">
      <div style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: 'center center', flex: '0 0 auto' }}>
        {children}
      </div>
    </div>
  );
}
