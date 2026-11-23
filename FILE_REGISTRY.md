# Market Wars — File Registry

**Location:** วางที่ root ของ repo (`/FILE_REGISTRY.md`) — version control โดย git
**Last Updated:** B26 Done (148-player readiness — bot swarm load test · Display fit ทุกขนาดห้อง · player hardening: poll fallback / own-row mount / chance API · กติกาชื่อ Almond.W + แก้ชื่อใน lobby · display sweep tool) — 23 Nov 2026 · ใช้จริง Dime! Kids Camp Phuket Edition 21 Nov 2026 (97 คน) · prev: B25 Done (Phuket Edition branding — lib/event-info.ts + browser tab titles via NEW hooks/usePageTitle.ts) — 20 Nov 2026 · Dime! Kids Camp Phuket Edition 21 Nov 2026 · prev: B24 Done (Player final share-card — FinalView redesign · NEW lib/event-info.ts · play page header hide at final_ranking) — 11 Jul 2026 · Season 3 dev · (Season 2 CLOSED, 74 players)
**Repo:** https://github.com/marketwars-game/market-wars
**Default branch:** `main`
**Latest stable tag:** `B26-stable` (newest — 148-player readiness; เวอร์ชันวันงาน Phuket = `4c88439` + fit2 หลังงาน) · `B25-stable` = Phuket Edition branding + browser tab titles · `B24-stable` = Player share-card · `B23-stable` = balance pass · `B22b-stable` = B22 + B22b · `B22-stable` = sparkline only · `B21-stable` · `B20-stable` = Season 2 final · `Season1-stable` = `B15-stable`

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
| Landing / Join | หน้าแรก เลือก join / create — ✅ B26-name: ตัวอย่าง/คำแนะนำชื่อ `Almond.W` + จัดตัวพิมพ์อัตโนมัติ + บังคับท้าย `.X` (`lib/name-rule`) · B25 tab title `📱 Join · Market Wars` | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/page.tsx |
| Player Game | จอเด็กเล่น (มือถือ) — ✅ B26-perf/name: mount ดึงเฉพาะแถวตัวเอง · list fetch เฉพาะ leaderboard / final (prefetch) / final_ranking + jitter 2–3s · poll `rooms` ~10s + refetch ตอนกลับเข้าแอป · refetch แถวตัวเองหลัง phase เปลี่ยน · lobby → `LobbyCard` · ✅ B25-title: tab `📱 {ชื่อ} · {room}` (ไม่มี phase) · ✅ B24-v1: ซ่อน header (ชื่อ/เงิน/↻) ตอน `final_ranking` · B22b final gating (`finalRevealed = phase === 'final_ranking'`) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/play/[roomId]/page.tsx |
| MC Entry | หน้า MC เลือกห้อง / สร้างห้อง — ✅ B25 tab title `🎛️ MC · Market Wars` | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/mc/page.tsx |
| MC Control | จอ MC ควบคุมเกมในห้อง — ✅ B25-title: tab `🎛️ MC · {room} · {phase}` | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/mc/[roomId]/page.tsx |
| Display (Projector) | จอแสดงสาธารณะ — ✅ B25-title: tab `📺 Display · {room} · {phase}` · (✅ B21 — ห่อทุก phase block ด้วย FitStage; zoom = min(w/1280, h/720)) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/display/[roomId]/page.tsx |

### API Routes

| Endpoint | ทำอะไร | Raw URL |
|----------|--------|---------|
| Rooms | สร้างห้อง | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/rooms/route.ts |
| Auth PIN | ตรวจสอบ PIN ของ MC | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/auth/pin/route.ts |
| Players | Join + reconnect (✅ B26: จัดรูปแบบชื่อฝั่ง server ด้วย `formatEventName`) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/players/route.ts |
| Player Portfolio | Save allocation | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/players/portfolio/route.ts |
| Player Quiz | Save quiz score | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/players/quiz/route.ts |
| Game Phase | Start/Next/End + auto-calc — ✅ B26-chunk2: เขียนผ่าน `runChunked` (`WRITE_CHUNK = 500` = ทั้งห้องพร้อมกัน; ลดเป็น 25 ถ้าใช้ compute เล็ก) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/game/phase/route.ts |
| Player Chance | ✅ B26 NEW — เปิดการ์ดโชคชะตาฝั่ง server (อ่านเงินสดจาก DB · คำนวณการ์ด · กันเปิดซ้ำ) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/players/chance/route.ts |
| Player Name | ✅ B26 NEW — PATCH แก้ชื่อตัวเอง (เฉพาะห้อง status `lobby` · กันชื่อซ้ำ · แก้บนแถวเดิม) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/players/name/route.ts |
| Game Calculate | Standalone calculate (fallback) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/game/calculate/route.ts |
| Health Check | Health endpoint | https://raw.githubusercontent.com/marketwars-game/market-wars/main/app/api/health/route.ts |

---

## Common Components (ใช้ร่วมทุกจอ)

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| FitName | ✅ B26 NEW — ชื่อผู้เล่นแบบตัดกลาง: คงท้าย `.X` (ตัวย่อชื่อจริง) เสมอเมื่อช่องแคบ · ใช้ทุกจอ Display | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/common/FitName.tsx |
| Bi | ✅ B17 — bilingual renderer (ไทยตัวหลัก / อังกฤษตัวรอง stack ใต้); render `LocalizedText {th,en}`; props `prefix/suffix/enStyle/inline` | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/common/Bi.tsx |

---

## Player Components (มือถือ)

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| InvestmentPanel | UI ลงทุน (RiskBadge sub-text) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/InvestmentPanel.tsx |
| ResultsPanel | แสดงผลรอบ (หุ้น + การ์ด) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/ResultsPanel.tsx |
| ResearchQuiz | ตอบ quiz (✅ B17 bilingual question/choices via `<Bi>`) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/ResearchQuiz.tsx |
| ChanceCard | เปิดการ์ดโชคชะตา (✅ B26-api: เขียนผ่าน `POST /api/players/chance` เลิกเขียน DB ตรงจาก client · B17 bilingual card.text via `<Bi>`) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/ChanceCard.tsx |
| LeaderboardView | อันดับ + ตัวเอง | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/LeaderboardView.tsx |
| FinalView | ✅ B24 — **share-card**: branding frame (MARKET WARS wordmark + `EVENT_INFO.program · season` → B25: Dime! Kids Camp · Phuket Edition) · เหรียญ/อันดับ · award badges · **เส้นทางเงิน 6 ปี** (money_after เขียว/แดง/เทารายปี) · chips quiz/chance · footer `EVENT_INFO.venue · date` · AnimatedBackdrop · TOP5 ใต้ fold · แสดงเฉพาะ `final_ranking` | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/FinalView.tsx |
| LobbyCard | ✅ B26 NEW — จอรอใน lobby + ปุ่ม "✏️ แก้ชื่อ" (PATCH `/api/players/name`) · แยกจาก play page | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/LobbyCard.tsx |
| FinalHold | ✅ B22b — NEW จอลุ้นบนมือถือ (`final` / `final_podium` / `final_awards`) "👀 ดูจอใหญ่!" ไม่เผยเงิน/อันดับ | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/player/FinalHold.tsx |

---

## Display Components (Projector)

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| ResearchDisplay | Quiz + Reveal (✅ B18 reveal = สอนกระชับ + QuizSpeedWall; B17 bilingual) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/ResearchDisplay.tsx |
| EventDisplay | Event reveal + Result + Golden Deal (✅ B22 — event_result: sparkline สะสมต่อ sector, แกน Y ร่วม, แกน X ล็อก 0..6, เส้นเขียว/แดงรายปี; flag `CHART_MODE`) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/EventDisplay.tsx |
| ChanceCardDisplay | สรุปการ์ดโชคชะตา (→ LiveNameBoard) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/ChanceCardDisplay.tsx |
| LeaderboardDisplay | Podium + ranking (✅ B26: แก้ช่องม้ามืดในอันดับ 9+ มองไม่เห็น · FitName) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/LeaderboardDisplay.tsx |
| AnimatedBackdrop | ✅ B19 — shared backdrop (Network particle canvas + scrolling grid + glow + vignette); props `accent/accent2/vignette/density`; ใช้ใน Lobby/YearIntro/MarketOpen/Event · ✅ B24 reuse ใน Player FinalView (density 14) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/AnimatedBackdrop.tsx |
| FinalDisplay | สรุปจบเกม + awards | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/FinalDisplay.tsx |
| QuizSpeedWall | ✅ B18 — speed name-wall (ตอบถูกครบ 2 ข้อ เรียงเร็วสุด, cascade) บน research_reveal | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/QuizSpeedWall.tsx |
| FitStage | ✅ B21 — fixed 1280×720 canvas scale-to-fit (letterbox กลางจอ); ห่อทุก phase block แทน CSS zoom (`STAGE_W/STAGE_H` export) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/FitStage.tsx |

> 📝 หมายเหตุ: ยังมี display component อื่นที่เพิ่มช่วง B16 (LiveNameBoard, LiveNameFeed, InvestDisplay, DisplayHeader, LobbyDisplay, YearIntroDisplay, MarketOpenDisplay, ResultsDisplay, SoundGate, FinalPodium, FinalAwards, FinalRanking, ConfettiCanvas) — ดู File Structure ใน Tech Spec v3.3
> 📝 B21 note: Lobby/YearIntro/MarketOpen ถอด `zoom` prop แล้ว (fill FitStage box) · Final* ทั้ง 4 (FinalDisplay/FinalPodium/FinalAwards/FinalRanking) เปลี่ยน `h-screen` → `h-full`
> 📝 B23 note: `FinalRanking.tsx` → **B23-v3** — ตัด ghost ท็อป/แย่ · ghosts รับโบนัสเฉลี่ยห้อง (`roomAvgFlows` จาก round_returns) ใช้ sort ตำแหน่ง · การ์ด ghost แสดงแค่ไอคอน+ชื่อ ไม่มี % · legend "ถ้าเล่นแบบนี้จะอยู่ประมาณนี้" — https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/display/FinalRanking.tsx
> 📝 B26 note (Display fit ทุกขนาดห้อง — ตรวจด้วย `scripts/display-sweep` N = 1..200): `FinalRanking.tsx` **B26-fit2** `pickLayout` เลือก comfortable/medium/compact จากการพอดีความสูง (เต็มความกว้างเสมอ) · `ResultsDisplay.tsx` **B26-fit2** แบบเดียวกัน · `LiveNameBoard.tsx` **B26-onepage** N > 80 = หน้าเดียว คอลัมน์ไล่ตามขนาดห้อง (8/10/12/14) มีแท่ง allocation / ยอด ± เสมอ · `LobbyDisplay.tsx` **B26-fit** เลขรวมด้านบน · ล่าสุดอยู่บน · chip 4 ขนาด · FitName ใน QuizSpeedWall / LiveNameFeed / FinalPodium
> 📝 B22b note: `LiveNameBoard.tsx` clamp `cols = min(tier.cols, N)` + เพดานช่อง 230×150px (แก้เคสคนน้อย; N ≥ ~30 พฤติกรรมเดิม) · `FinalAwards.tsx` ตัดป้าย "พี่โบว์เฉลย · Dr.Bow reveals"

---

## MC Components

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| ResearchMC | ดูสถานะ quiz (✅ B17 `.th` — MC ไทยล้วน) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/mc/ResearchMC.tsx |
| ResultsMC | สรุปผลรอบ (3 columns) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/mc/ResultsMC.tsx |
| LeaderboardMC | ดูอันดับทุกคน | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/mc/LeaderboardMC.tsx |
| FinalMC | สรุปจบเกม | https://raw.githubusercontent.com/marketwars-game/market-wars/main/components/mc/FinalMC.tsx |

---

## lib/ — Game Logic & Config

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| supabase | Supabase client | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/supabase.ts |
| game-engine | Phase flow, state machine, step progress | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/game-engine.ts |
| constants | ✅ B23-v1 — RETURN_TABLE **v6** (risk premium · 🐷 1%/ปี · crash ลึกลง) · QUIZ_BONUS **100/50/0** · CHANCE_CARDS **หารสอง** (±50..250) · COMPANIES, EVENTS, QUIZ_POOL `{th,en}`, STEP_GROUPS | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/constants.ts |
| awards | calculateAwards, Quiz Master multi-winner | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/awards.ts |
| sound | registry 18 assets + PHASE_BGM map | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/sound.ts |
| ranking | ✅ B18 — comparator กลาง: `compareForRank` (money→quiz→speed→id) + `compareQuizMaster` + `speedKey` | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/ranking.ts |
| name-rule | ✅ B26 NEW — กติกาชื่อของงาน `ชื่อเล่น.อักษรแรกชื่อจริง` (Almond.W): `formatEventName` (จัดตัวพิมพ์อัตโนมัติ) · `looksLikeEventName` (ท้าย `.X` 1–2 ตัว) · `NAME_SUFFIX_REQUIRED` (true = ฟอร์มบังคับ) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/name-rule.ts |
| event-info | ✅ B25 — Phuket Edition (season='Phuket Edition' · venue='Bhukitta Boutique Hotel' · date='21 Nov 2026') · B24 NEW `EVENT_INFO {program, season, venue, date}` — branding ของการ์ดจบ (FinalView) · แก้ season/สถานที่/วันที่ครั้งหน้าที่ไฟล์นี้ไฟล์เดียว | https://raw.githubusercontent.com/marketwars-game/market-wars/main/lib/event-info.ts |

---

## hooks/

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| usePageTitle | ✅ B25 NEW — ตั้ง `document.title` ต่อหน้า (`parts.filter(Boolean).join(' · ')`, unmount คืน title เดิม) · ใช้ใน Join / MC Entry / MC Control / Display / Player | https://raw.githubusercontent.com/marketwars-game/market-wars/main/hooks/usePageTitle.ts |
| useFitScale | ✅ B26 NEW — วัดความสูงเนื้อหาเทียบกล่อง คืน scale ≤ 1 (pattern scale-to-fit ของ FinalRanking เป็น hook กลาง) · ใช้ใน Lobby / Results | https://raw.githubusercontent.com/marketwars-game/market-wars/main/hooks/useFitScale.ts |
| useDisplaySound | เสียงจอ Display (B16a) | https://raw.githubusercontent.com/marketwars-game/market-wars/main/hooks/useDisplaySound.ts |

---

## scripts/ — เครื่องมือทดสอบ (ไม่ถูก deploy)

| ไฟล์ | หน้าที่ | Raw URL |
|------|--------|---------|
| bots/swarm.mjs | ✅ B26 NEW — bot ผู้เล่นจำลอง N คน (join / quiz / ลงทุน / การ์ด / leaderboard + realtime เหมือน client) · รายงาน latency / realtime / integrity ของเงิน · `node scripts/bots/swarm.mjs --room XXXX --n 148 --url <base> [--mc auto] [--speed 3] [--names mixed]` · ต้องรันจากเครื่องที่มี `.env.local` | https://raw.githubusercontent.com/marketwars-game/market-wars/main/scripts/bots/swarm.mjs |
| display-sweep/run.sh + sweep.py | ✅ B26 NEW — render จอ Display ทุกขนาดห้อง (1..200) ตรวจ ถูกตัด / หดแคบ / ตัวอักษรเล็ก · `bash scripts/display-sweep/run.sh [screens] [lo:hi:step]` · ต้องมี python playwright | https://raw.githubusercontent.com/marketwars-game/market-wars/main/scripts/display-sweep/sweep.py |
| display-sweep/preview-page.tsx.txt | ต้นแบบหน้า preview (mock players) — run.sh copy ไป `app/b26preview/` ชั่วคราวตอนรัน | https://raw.githubusercontent.com/marketwars-game/market-wars/main/scripts/display-sweep/preview-page.tsx.txt |

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
