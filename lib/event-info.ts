// FILE: lib/event-info.ts — Share-card event branding (แก้ที่นี่ทุก event/season)
// VERSION: B24 — created for Player final share-card (FinalView)
// LAST MODIFIED: 11 Jul 2026
// HISTORY: B24 created (extract season/venue/date out of component → one-file edit per event)
//
// 👉 เปลี่ยน season / สถานที่ / วันที่ ของการ์ดจบเกม แก้แค่ไฟล์นี้ไฟล์เดียว แล้ว rebuild + deploy
//    date = "วันจัดงาน" (พิมพ์ตรงตามที่อยากให้โชว์บนการ์ด) — ไม่ใช่วันที่เครื่องผู้เล่น

export const EVENT_INFO = {
    program: 'Dime! Kids Camp', // หัวการ์ด (คงที่)
    season: 'Season 3',         // หัวการ์ด → "Dime! Kids Camp · Season 3"
    venue: 'HOW Club',          // footer ซ้าย
    date: '11 July 2026',       // footer ขวา
  };
  