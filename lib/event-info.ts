// FILE: lib/event-info.ts — Share-card event branding (แก้ที่นี่ทุก event/edition)
// VERSION: B25 — Phuket Edition branding
// LAST MODIFIED: 20 Nov 2026
// HISTORY:
//   B24 created (extract season/venue/date out of component → one-file edit per event)
//   B25 Phuket Edition: season 'Season 3' → 'Phuket Edition' · venue HOW Club → Bhukitta Boutique Hotel ·
//       date 11 July 2026 → 21 Nov 2026 (เดือนย่อ กัน footer ตกบรรทัดบนมือถือ)
//
// 👉 เปลี่ยน edition / สถานที่ / วันที่ ของการ์ดจบเกม แก้แค่ไฟล์นี้ไฟล์เดียว แล้ว rebuild + deploy
//    season = ป้ายต่อท้ายชื่อโปรแกรม ใส่ชื่อ edition ได้ (ไม่จำเป็นต้องเป็นเลข Season)
//    date = "วันจัดงาน" (พิมพ์ตรงตามที่อยากให้โชว์บนการ์ด) — ไม่ใช่วันที่เครื่องผู้เล่น
//    footer = `${venue} · ${date}` บรรทัดเดียว 13px → รวมกันควร ≤ ~36 ตัวอักษร

export const EVENT_INFO = {
  program: 'Dime! Kids Camp',        // หัวการ์ด (คงที่)
  season: 'Phuket Edition',          // หัวการ์ด → "Dime! Kids Camp · Phuket Edition"
  venue: 'Bhukitta Boutique Hotel',  // footer ซ้าย
  date: '21 Nov 2026',               // footer ขวา
};
