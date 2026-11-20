// FILE: hooks/usePageTitle.ts — ตั้งชื่อ browser tab ต่อหน้า (MC / Display / Player / Join)
// VERSION: B25 — created
// LAST MODIFIED: 20 Nov 2026
// HISTORY: B25 created — ทุกหน้าเป็น 'use client' ใช้ Next metadata ไม่ได้ → set document.title ใน effect
//
// ใช้: usePageTitle(['🎛️ MC', roomId, phase]) → "🎛️ MC · ABCD · invest"
//      ส่วนที่เป็น falsy (undefined/null/'') ถูกข้าม → ใส่ค่าที่ยังโหลดไม่เสร็จได้เลย
//      unmount → คืน title เดิม

'use client';

import { useEffect } from 'react';

export function usePageTitle(parts: Array<string | null | undefined | false>) {
  const title = parts.filter(Boolean).join(' · ');

  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
