# Market Wars — File Registry

**Location:** วางที่ root ของ repo (`/FILE_REGISTRY.md`) — version control โดย git
**Last Updated:** B16b Done — 11 Jun 2026
**Repo:** https://github.com/marketwars-game/market-wars
**Default branch:** `main`
**Latest stable tag:** `B16b-stable` (Season 1 = `Season1-stable` = `B15-stable`)

---

## หลักการ Registry-in-Repo

**Registry นี้อยู่ใน repo ด้วย** — version control โดย git อัตโนมัติ:
- ทุกครั้งที่ tag stable (เช่น `Season2-stable`) registry version นั้นจะถูก snapshot ไปด้วย
- เพิ่ม/ลบไฟล์ → update registry → commit พร้อมกัน
- Claude สามารถ web_fetch registry นี้จาก GitHub raw URL ได้ตรงๆ ไม่ต้องพึ่ง Project Knowledge

**Raw URL ของ registry นี้:**
```
https://raw.githubusercontent.com/marketwars-game/market-wars/main/FILE_REGISTRY.md
```

---

## How Claude uses this

เมื่อต้องการ source code ล่าสุด **ห้ามใช้ Project Knowledge** — ให้ web_fetch จาก raw URL ตามตารางด้านล่าง

**Raw URL format:**
```
https://raw.githubusercontent.com/marketwars-game/market-wars/main/<path>
```

**ถ้าต้องการ version ที่ tag เฉพาะ** (เช่น Season1-stable):
```
https://raw.githubusercontent.com/marketwars-game/market-wars/Season1-stable/<path>
```

---

## App Routes (Next.js pages + API)

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| Root Layout | Next.js root layout — wrapper หลักของทุกหน้า | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/layout.tsx |
| Landing / Join | หน้าแรก เลือก join / create | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/page.tsx |
| Player Game | จอเด็กเล่น (มือถือ) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/play/[roomId]/page.tsx |
| MC Entry | หน้า MC เลือกห้อง / สร้างห้อง | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/mc/page.tsx |
| MC Control | จอ MC ควบคุมเกมในห้อง | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/mc/[roomId]/page.tsx |
| Display (Projector) | จอแสดงสาธารณะ | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/display/[roomId]/page.tsx |

### API Routes

| Endpoint | ทำอะไร | Raw URL |
|----------|--------|---------|
| Rooms | สร้างห้อง | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/rooms/route.ts |
| Auth PIN | ตรวจสอบ PIN ของ MC | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/auth/pin/route.ts |
| Players | Join + reconnect | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/players/route.ts |
| Player Portfolio | Save allocation | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/players/portfolio/route.ts |
| Player Quiz | Save quiz score | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/players/quiz/route.ts |
| Game Phase | Start/Next/End + auto-calc + Promise.all | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/game/phase/route.ts |
| Game Calculate | Standalone calculate (fallback) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/game/calculate/route.ts |
| Health Check | Health endpoint | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/health/route.ts |

---

## Player Components (มือถือ)

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| InvestmentPanel | UI ลงทุน (RiskBadge sub-text) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/InvestmentPanel.tsx |
| ResultsPanel | แสดงผลรอบ (หุ้น + การ์ด) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/ResultsPanel.tsx |
| ResearchQuiz | ตอบ quiz | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/ResearchQuiz.tsx |
| ChanceCard | เปิดการ์ดโชคชะตา | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/ChanceCard.tsx |
| LeaderboardView | อันดับ + ตัวเอง | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/LeaderboardView.tsx |
| FinalView | สรุป + รางวัล (co-winners) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/FinalView.tsx |

---

## Display Components (Projector)

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| ResearchDisplay | Quiz (→ LiveNameFeed ชื่อสด) + Reveal (B16b) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/ResearchDisplay.tsx |
| EventDisplay | Event reveal + Result + Golden Deal | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/EventDisplay.tsx |
| ChanceCardDisplay | Live luck wall ทุกคน เขียว/แดง + เงิน (B16b → LiveNameBoard) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/ChanceCardDisplay.tsx |
| LeaderboardDisplay | Podium + ranking | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/LeaderboardDisplay.tsx |
| FinalDisplay | สรุปจบเกม + awards | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/FinalDisplay.tsx |
| DisplayHeader | แถบบน: phase progress + ปี (B16a) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/DisplayHeader.tsx |
| LobbyDisplay | Lobby: QR + players (qrOpen local) (B16a) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/LobbyDisplay.tsx |
| YearIntroDisplay | Splash ต้นปี (B16a) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/YearIntroDisplay.tsx |
| MarketOpenDisplay | Splash ตลาดเปิด (B16a) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/MarketOpenDisplay.tsx |
| InvestDisplay | Live allocation wall ทุกคน + แถบสัดส่วน (B16b → LiveNameBoard) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/InvestDisplay.tsx |
| ResultsDisplay | Results: returns + top earners (B16a) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/ResultsDisplay.tsx |
| SoundGate | Overlay ปลดล็อก autoplay เต็มจอ (B16a) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/SoundGate.tsx |
| LiveNameBoard | Spectator wall ทุกคน A-Z (fit-all+degrade, light-in-place) — ใช้ invest+chance (B16b) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/LiveNameBoard.tsx |
| LiveNameFeed | Research sidebar ชื่อสดล่าสุดบนสุด + avatar (B16b) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/LiveNameFeed.tsx |

---

## MC Components

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| ResearchMC | ดูสถานะ quiz | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/mc/ResearchMC.tsx |
| ResultsMC | สรุปผลรอบ (3 columns) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/mc/ResultsMC.tsx |
| LeaderboardMC | ดูอันดับทุกคน | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/mc/LeaderboardMC.tsx |
| FinalMC | สรุปจบเกม | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/mc/FinalMC.tsx |

---

## Hooks

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| useDisplaySound | จัดการเสียงจอ Display — unlock / SFX / BGM crossfade / graceful (B16a) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/hooks/useDisplaySound.ts |

---

## lib/ — Game Logic & Config

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| supabase | Supabase client | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/supabase.ts |
| game-engine | Phase flow, state machine, step progress | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/game-engine.ts |
| constants | COMPANIES, RETURN_TABLE v5c, EVENTS, QUIZ_POOL, CHANCE_CARDS, STEP_GROUPS | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/constants.ts |
| awards | calculateAwards, Quiz Master multi-winner | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/awards.ts |
| sound | Registry 18 assets (5 BGM + 13 SFX) + PHASE_BGM map (B16a) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/sound.ts |

---

## Config Files

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| package.json | Dependencies | https://raw.githubusercontent.com/marketwars-game/market-wars/main/package.json |
| tsconfig.json | TypeScript config | https://raw.githubusercontent.com/marketwars-game/market-wars/main/tsconfig.json |
| tailwind.config.ts | Tailwind config | https://raw.githubusercontent.com/marketwars-game/market-wars/main/tailwind.config.ts |
| next.config.mjs | Next.js config | https://raw.githubusercontent.com/marketwars-game/market-wars/main/next.config.mjs |

---

## ไฟล์ที่ไม่ใช้แล้ว (ยังอยู่ใน repo แต่ไม่ import — ลบได้)

- 📦 `components/player/MarketFight.tsx` — ไม่ import แล้ว (แทนด้วย ChanceCard ใน B13)
- 📦 `components/display/FightDisplay.tsx` — ไม่ import แล้ว (แทนด้วย ChanceCardDisplay ใน B13)

## ไฟล์ที่ลบไปแล้ว

- ❌ `app/api/players/duel/route.ts` — ลบไปแล้วใน B13

## ไฟล์ auto-generated (ห้ามแก้ด้วยมือ)

- `next-env.d.ts` — Next.js สร้างให้อัตโนมัติ

---

## วิธีใช้งาน

**Pattern เวลาเริ่ม task ใหม่:**

OANIE: "เริ่ม Task B16 — เปลี่ยน X"

Claude:
1. อ่าน FILE_REGISTRY.md จาก Project Knowledge
2. ระบุไฟล์ที่ต้องดู (เช่น `lib/constants.ts` + `EventDisplay.tsx`)
3. `web_fetch` raw URL จาก registry
4. เริ่ม Design Session ตามปกติ

**ห้ามใช้ Project Knowledge สำหรับ source code** — code ใน Project Knowledge อาจเก่า (snapshot ตอน upload) แต่ GitHub คือ source of truth

---

## Update Registry เมื่อไหร่

- เพิ่มไฟล์ใหม่ → เพิ่มแถวในตาราง
- ลบไฟล์ → ย้ายไปหมวด "ไม่ใช้แล้ว"
- เปลี่ยน branch หลัก → update header
- เปลี่ยน repo URL → update ทั้งไฟล์
