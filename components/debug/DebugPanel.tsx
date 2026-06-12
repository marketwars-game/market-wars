// FILE: components/debug/DebugPanel.tsx — fixed-corner debug overlay (perf test)
// VERSION: perf-v1 — renders only when ?debug=1; pointer-events none so it never blocks taps
// LAST MODIFIED: 12 Jun 2026
// HISTORY: perf-v1 created (Season 2 load-test instrumentation)
'use client';

import { useDebug } from '@/lib/debug';

type Corner = 'br' | 'bl' | 'tr' | 'tl';

const CORNERS: Record<Corner, React.CSSProperties> = {
  br: { bottom: 8, right: 8 },
  bl: { bottom: 8, left: 8 },
  tr: { top: 8, right: 8 },
  tl: { top: 8, left: 8 },
};

export default function DebugPanel({
  title,
  stats,
  pos = 'br',
}: {
  title: string;
  stats: Record<string, string | number>;
  pos?: Corner;
}) {
  const debug = useDebug();
  if (!debug) return null;
  return (
    <div
      style={{
        position: 'fixed',
        ...CORNERS[pos],
        zIndex: 9999,
        background: 'rgba(0,0,0,0.82)',
        color: '#7CFFC4',
        font: '11px/1.5 ui-monospace, monospace',
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid rgba(0,255,178,0.4)',
        minWidth: 180,
        maxWidth: 280,
        pointerEvents: 'none',
      }}
    >
      <div style={{ color: '#00FFB2', fontWeight: 700, marginBottom: 4 }}>🐞 {title}</div>
      {Object.entries(stats).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>{k}</span>
          <span>{String(v)}</span>
        </div>
      ))}
    </div>
  );
}
