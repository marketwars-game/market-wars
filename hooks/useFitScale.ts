// FILE: hooks/useFitScale.ts — วัดความสูงเนื้อหาเทียบกล่อง แล้วคืน scale (≤1) ให้เนื้อหาพอดีกล่องเสมอ
// VERSION: B26 — created
// LAST MODIFIED: 20 Nov 2026
// HISTORY: B26 created — ยก pattern scale-to-fit ของ FinalRanking (B20) มาเป็น hook กลาง ใช้กับ Lobby + Results ที่ N > 100
'use client';

import { useEffect, useRef, useState } from 'react';

// ใช้: <div ref={boxRef} (กล่องความสูงตายตัว/flex-1 min-h-0)><div ref={innerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>…
// วัดเป็น px ภายใน FitStage (scrollHeight ไม่ได้รับผลจาก transform) → composes กับ FitStage ได้ (B21 lesson)
export function useFitScale(deps: unknown[], minScale = 0.45) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const box = boxRef.current, inner = innerRef.current;
      if (!box || !inner) return;
      const avail = box.clientHeight;
      const natural = inner.scrollHeight;
      setScale(natural > avail && natural > 0 && avail > 0 ? Math.max(minScale, avail / natural) : 1);
    };
    const raf = requestAnimationFrame(fit);
    const t = setTimeout(fit, 150); // เผื่อ emoji/ฟอนต์โหลดเสร็จ
    window.addEventListener('resize', fit);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); window.removeEventListener('resize', fit); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { boxRef, innerRef, scale };
}
