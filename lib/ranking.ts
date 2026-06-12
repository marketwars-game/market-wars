// FILE: lib/ranking.ts — Shared ranking comparators (single source of truth)
// VERSION: B18-BATCH0-v1 — compareForRank (money → quiz correct → speed → id) + compareQuizMaster
// LAST MODIFIED: 12 Jun 2026
// HISTORY: B18-BATCH0 created — รวม logic จัดอันดับที่เคยกระจาย 4 จุดให้มาที่เดียว + เพิ่ม tiebreak ความเร็ว

// Supabase `numeric` คืนค่าเป็น string → parseFloat (กฎโปรเจกต์: ห้าม Number())
function num(v: any): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

// ความเร็วสะสม (ms): 0 = "ยังไม่ถูกวัด" → ถือเป็นช้าสุด (Infinity)
// กันเคสคนไม่มีข้อมูลเวลา (เช่น row เก่าก่อน B18) ชนะ tiebreak แบบไม่ตั้งใจ
// เวลาจริงที่วัดได้จะ > 0 เสมอ ดังนั้น 0 แปลว่า "ไม่มีข้อมูล" ได้อย่างปลอดภัย
export function speedKey(v: any): number {
  const ms = num(v);
  return ms > 0 ? ms : Infinity;
}

// id fallback — ทำให้ลำดับ deterministic 100% เมื่อทุกชั้นเสมอเป๊ะ
function byId(a: any, b: any): number {
  const ai = String(a?.id ?? '');
  const bi = String(b?.id ?? '');
  return ai < bi ? -1 : ai > bi ? 1 : 0;
}

// ==============================================
// compareForRank — ลำดับหลักของทุกจอ (leaderboard / podium / final ranking)
// cascade: เงินมาก → ตอบถูกมาก → เร็ว (ms น้อย) → id
// ใช้: [...players].sort(compareForRank)
// ==============================================
export function compareForRank(a: any, b: any): number {
  const dMoney = num(b.money) - num(a.money);            // เงินมากก่อน
  if (dMoney !== 0) return dMoney;

  const dQuiz = num(b.quiz_score) - num(a.quiz_score);   // ตอบถูกสะสมมากก่อน
  if (dQuiz !== 0) return dQuiz;

  const dSpeed = speedKey(a.quiz_speed_ms) - speedKey(b.quiz_speed_ms); // เร็ว (น้อย) ก่อน
  if (dSpeed !== 0) return dSpeed;

  return byId(a, b);
}

// ==============================================
// compareQuizMaster — สำหรับรางวัล Quiz Master (single winner)
// cascade: ตอบถูกมาก → เร็ว → id  (ไม่เกี่ยวเงิน)
// ==============================================
export function compareQuizMaster(a: any, b: any): number {
  const dQuiz = num(b.quiz_score) - num(a.quiz_score);
  if (dQuiz !== 0) return dQuiz;

  const dSpeed = speedKey(a.quiz_speed_ms) - speedKey(b.quiz_speed_ms);
  if (dSpeed !== 0) return dSpeed;

  return byId(a, b);
}
