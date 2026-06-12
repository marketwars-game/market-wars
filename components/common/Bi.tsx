// FILE: components/common/Bi.tsx — Bilingual text renderer (Thai primary + English secondary)
// VERSION: B17-BATCH0-v1 — New component for B17 bilingual pass
// LAST MODIFIED: 12 Jun 2026
// HISTORY: B17-BATCH0 created — renders LocalizedText as Thai (primary) + English (secondary, smaller/dimmer)
'use client';

import { CSSProperties, ReactNode } from 'react';
import type { LocalizedText } from '@/lib/constants';

interface BiProps {
  t: LocalizedText;
  /** applied to the wrapper — Thai line inherits size/color/weight from here */
  className?: string;
  style?: CSSProperties;
  /** override the English (secondary) line only — e.g. force a px size on tight mobile rows */
  enStyle?: CSSProperties;
  /** sits on the Thai line, before the text — e.g. "A. " choice letter */
  prefix?: ReactNode;
  /** sits on the Thai line, after the text — e.g. " ✓" / " ✗" reveal marker */
  suffix?: ReactNode;
  /** inline-block layout instead of block (rare — default is stacked block) */
  inline?: boolean;
}

// Default English line: 0.82× the Thai size, opacity 0.7 (>= 0.65 brightness rule), normal weight.
// Opacity (not a fixed color) means EN auto-dims to whatever color the Thai uses —
// white text -> dim white, purple selection -> dim purple, green correct -> dim green.
export default function Bi({ t, className, style, enStyle, prefix, suffix, inline = false }: BiProps) {
  return (
    <span className={className} style={{ display: inline ? 'inline-block' : 'block', ...style }}>
      <span style={{ display: 'block' }}>
        {prefix}{t.th}{suffix}
      </span>
      <span
        style={{
          display: 'block',
          fontSize: '0.82em',
          opacity: 0.7,
          fontWeight: 400,
          lineHeight: 1.3,
          ...enStyle,
        }}
      >
        {t.en}
      </span>
    </span>
  );
}
