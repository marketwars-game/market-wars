// FILE: components/common/FitName.tsx — ชื่อผู้เล่นที่ตัดกลาง: เก็บตัวย่อนามสกุลท้ายชื่อ (".W") ไว้เสมอ
// VERSION: B26 — created
// LAST MODIFIED: 21 Nov 2026
// HISTORY: B26 created — กติกาชื่อของงาน = "ชื่อเล่น.อักษรแรกชื่อจริง" (Almond.W) · ช่องแคบ (148 คน/จอ) ตัดท้ายแบบเดิมทำ "Tonkhao.N" กับ "Tonkhao.C"
//          กลายเป็น "Tonkha…" เหมือนกัน → ตัดส่วนชื่อเล่น แล้วคงท้าย ".X" ไว้ ("Tonk….N") · ชื่อที่ไม่มีรูปแบบนี้ = ตัดท้ายตามเดิม
'use client';

import type { CSSProperties } from 'react';

export default function FitName({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) {
  const n = name || '';
  const i = n.lastIndexOf('.');
  const hasSuffix = i > 0 && i < n.length - 1 && n.length - i <= 3; // ".W" หรือ ".Wi"
  if (!hasSuffix) {
    return <span className={className} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...style }}>{n}</span>;
  }
  return (
    <span className={className} style={{ display: 'inline-flex', minWidth: 0, maxWidth: '100%', whiteSpace: 'nowrap', ...style }}>
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.slice(0, i)}</span>
      <span style={{ flexShrink: 0 }}>{n.slice(i)}</span>
    </span>
  );
}
