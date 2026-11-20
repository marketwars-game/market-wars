// FILE: lib/name-rule.ts — กติกาชื่อผู้เล่นของงาน: "ชื่อเล่น.อักษรแรกชื่อจริง" (Almond.W)
// VERSION: B26 — created
// LAST MODIFIED: 21 Nov 2026
// HISTORY: B26 created — ข้อความแนะนำ + ตัวตรวจแบบเตือน (ไม่บล็อก) ใช้ร่วมกันทุกฟอร์มที่กรอกชื่อ · จอ Display ตัดชื่อโดยคงท้าย ".X" (FitName)

export const NAME_EXAMPLE = 'Almond.W';
export const NAME_HINT = 'ชื่อเล่น + จุด + อักษรแรกของชื่อจริง · Nickname.Initial';
export const NAME_WARN = 'ยังไม่มี ".อักษรแรกชื่อจริง" ต่อท้าย เช่น Almond.W';

// ลงท้ายด้วย . ตามด้วยตัวอักษร 1–2 ตัว (อังกฤษหรือไทย)
export function looksLikeEventName(name: string): boolean {
  return /^.+\.[A-Za-zก-ฮ]{1,2}$/.test((name || '').trim());
}
