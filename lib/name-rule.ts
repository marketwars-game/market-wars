// FILE: lib/name-rule.ts — กติกาชื่อผู้เล่นของงาน: "ชื่อเล่น.อักษรแรกชื่อจริง" (Almond.W)
// VERSION: B26-v2 — formatEventName: จัดตัวพิมพ์อัตโนมัติ (Almond.W) ระหว่างพิมพ์ + ตอนส่ง | prev: B26 created
// LAST MODIFIED: 21 Nov 2026
// HISTORY: B26 created — ข้อความแนะนำ + ตัวตรวจแบบเตือน (ไม่บล็อก) ใช้ร่วมกันทุกฟอร์มที่กรอกชื่อ · จอ Display ตัดชื่อโดยคงท้าย ".X" (FitName)

export const NAME_EXAMPLE = 'Almond.W';
export const NAME_HINT = 'ชื่อเล่น + จุด + อักษรแรกของชื่อจริง · Nickname.Initial';
export const NAME_WARN = 'ต้องลงท้ายด้วย จุด + อักษรแรกของชื่อจริง เช่น Almond.W';
// ✅ B26-v2: true = ฟอร์ม join / แก้ชื่อ ไม่ให้ส่งถ้ายังไม่ลงท้าย ".X" · false = เตือนอย่างเดียว (server ไม่บังคับทั้งสองกรณี)
export const NAME_SUFFIX_REQUIRED = true;
export function nameBlocked(name: string): boolean {
  return NAME_SUFFIX_REQUIRED && !looksLikeEventName(formatEventName(name, true));
}

// ลงท้ายด้วย . ตามด้วยตัวอักษร 1–2 ตัว (อังกฤษหรือไทย)
export function looksLikeEventName(name: string): boolean {
  return /^.+\.[A-Za-zก-ฮ]{1,2}$/.test((name || '').trim());
}

// ✅ B26-v2: จัดรูปแบบให้ตรงกติกาอัตโนมัติ — ตัวแรกของชื่อเล่นตัวใหญ่ ที่เหลือตัวเล็ก · หลังจุดตัวใหญ่
//   "almond.w" → "Almond.W" · "ALMOND.W" → "Almond.W" · ชื่อไทยไม่เปลี่ยน (ไม่มีตัวพิมพ์เล็ก/ใหญ่)
//   final = true (ตอนกดส่ง / ฝั่ง server): ตัดช่องว่างหัวท้าย · "Almond . w" → "Almond.W" · "Almond W" (เว้นวรรค + อักษรเดียว) → "Almond.W"
export function formatEventName(raw: string, final = false): string {
  let s = (raw || '').replace(/\s+/g, ' ');
  if (final) {
    s = s.trim().replace(/\s*\.\s*/g, '.').replace(/^(.*\S) ([A-Za-z])$/, '$1.$2');
  } else {
    s = s.replace(/^ /, '');
  }
  const i = s.lastIndexOf('.');
  const hasSuffix = i > 0 && s.length - i <= 3; // ".", ".w", ".wi"
  const base = hasSuffix ? s.slice(0, i) : s;
  const suffix = hasSuffix ? s.slice(i) : '';
  const titled = base.replace(/(^|[ \-])([^ \-])([^ \-]*)/g, (_m, sep: string, first: string, rest: string) => sep + first.toUpperCase() + rest.toLowerCase());
  return titled + suffix.toUpperCase();
}
