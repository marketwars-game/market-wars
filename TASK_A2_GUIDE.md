# Task A2 — Step-by-Step Guide
## สร้าง Market Wars Project + เชื่อม GitHub + Supabase + Deploy Vercel

**เวลาโดยประมาณ:** 1.5–2 ชม.
**สิ่งที่ต้องมี:** GitHub account (marketwars-game), Supabase account, Vercel account, Cursor

---

## ขั้นตอนที่ 1: สร้าง GitHub Repository (5 นาที)

1. ไปที่ **github.com** → login ด้วย account `marketwars-game`
2. กด **"New repository"** (ปุ่มเขียว มุมขวาบน)
3. ตั้งค่า:
   - **Repository name:** `market-wars`
   - **Description:** `🎮 The Investment Game — multiplayer stock simulation for kids`
   - **Public** (เลือก Public เพื่อให้ Vercel deploy ฟรีได้ง่าย)
   - ✅ **Add a README file** — ติ๊กอันนี้
   - **.gitignore template:** `Node`
4. กด **"Create repository"**
5. จด URL ไว้: `https://github.com/marketwars-game/market-wars`

---

## ขั้นตอนที่ 2: Clone Repo + ใส่ Starter Code (15 นาที)

### วิธี A — ใช้ Cursor (แนะนำ)

1. เปิด **Cursor**
2. กด `Ctrl+Shift+P` (หรือ `Cmd+Shift+P` บน Mac) → พิมพ์ **"Git: Clone"**
3. ใส่ URL: `https://github.com/marketwars-game/market-wars.git`
4. เลือกโฟลเดอร์ที่จะเก็บ (เช่น Desktop)
5. Cursor จะเปิด project ให้อัตโนมัติ

### วิธี B — ใช้ Terminal

```bash
cd ~/Desktop
git clone https://github.com/marketwars-game/market-wars.git
cd market-wars
```

### ใส่ Starter Code

**Claude สร้างไฟล์ทั้งหมดให้แล้ว!** ให้ดาวน์โหลดจาก chat นี้ แล้ว:

1. **ลบ** ไฟล์ README.md และ .gitignore เดิมที่ GitHub สร้างให้
2. **Copy ทุกไฟล์** จากโฟลเดอร์ที่ดาวน์โหลดมา ไปใส่ใน `market-wars/`
3. โครงสร้างไฟล์ที่ควรเห็น:

```
market-wars/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx              ← หน้า Join
│   ├── api/health/route.ts   ← ทดสอบ Supabase
│   ├── mc/
│   │   ├── page.tsx          ← MC landing
│   │   └── [roomId]/page.tsx
│   └── play/
│       └── [roomId]/page.tsx
├── components/
│   ├── player/
│   ├── mc/
│   └── shared/
├── lib/
│   ├── supabase.ts
│   ├── game-engine.ts
│   └── constants.ts
├── public/
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

### ติดตั้ง Dependencies

เปิด Terminal ใน Cursor (`` Ctrl+` ``) แล้วรัน:

```bash
npm install
```

รอจนเสร็จ (~1-2 นาที) จะเห็นโฟลเดอร์ `node_modules/` ปรากฏขึ้น

### ทดสอบ Local

```bash
npm run dev
```

เปิด browser ไปที่ **http://localhost:3000** — ต้องเห็นหน้า **MARKET WARS** สีเขียว+ฟ้าบนพื้นดำ!

> ⚠️ ปุ่ม "Test Supabase Connection" จะ fail ตอนนี้ — ยังไม่ได้ใส่ .env.local (ทำในขั้นตอนถัดไป)

กด `Ctrl+C` เพื่อหยุด dev server

---

## ขั้นตอนที่ 3: สร้าง Supabase Project (10 นาที)

1. ไปที่ **supabase.com/dashboard**
2. กด **"New Project"**
3. ตั้งค่า:
   - **Organization:** เลือก org ที่มี (หรือสร้างใหม่ ชื่อ "Market Wars")
   - **Project name:** `market-wars`
   - **Database password:** ตั้งรหัสที่จำได้ (จดไว้!)
   - **Region:** `Southeast Asia (Singapore)` ← ใกล้ไทยที่สุด
   - **Plan:** Free tier
4. กด **"Create new project"** → รอ ~2 นาที

### หา API Keys

1. ใน Supabase Dashboard → ไปที่ **Settings** (เฟืองซ้ายล่าง) → **API**
2. จะเห็น 2 อย่างที่ต้องการ:
   - **Project URL** — เช่น `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key** — ข้อความยาวๆ ขึ้นต้นด้วย `eyJ...`

### สร้าง .env.local

กลับมาที่ Cursor → สร้างไฟล์ใหม่ชื่อ `.env.local` ใน root ของ project:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...ใส่ key จริงที่ copy มา
```

> ⚠️ ไฟล์ `.env.local` อยู่ใน .gitignore แล้ว — จะ **ไม่** ถูก push ขึ้น GitHub (ปลอดภัย)

### ทดสอบ Supabase Connection

```bash
npm run dev
```

ไปที่ http://localhost:3000 → กดปุ่ม **"Test Supabase Connection"** ด้านล่าง → ต้องเห็น ✓ **Supabase Connected** เป็นสีเขียว!

---

## ขั้นตอนที่ 4: Push Code ขึ้น GitHub (5 นาที)

ใน Terminal ของ Cursor:

```bash
git add .
git commit -m "🚀 Initial setup: Next.js + Tailwind + Supabase starter"
git push origin main
```

> ถ้าถูกถาม username/password:
> - Username = `marketwars-game`
> - Password = ใช้ **Personal Access Token** (ไม่ใช่ password ปกติ)
>   - ไปที่ GitHub → Settings → Developer settings → Personal access tokens → Generate new token
>   - ให้สิทธิ์ `repo` → Copy token มาใช้แทน password

ไปเช็คที่ `github.com/marketwars-game/market-wars` — ต้องเห็นไฟล์ทั้งหมดแล้ว!

---

## ขั้นตอนที่ 5: Deploy Vercel ครั้งแรก (10 นาที)

1. ไปที่ **vercel.com/dashboard**
2. กด **"Add New..."** → **"Project"**
3. เลือก **"Import Git Repository"** → เลือก `market-wars`
4. Vercel จะ detect ว่าเป็น Next.js อัตโนมัติ
5. **ตั้ง Environment Variables ก่อน deploy!**
   - กด **"Environment Variables"** (expand ส่วนนี้)
   - เพิ่ม 2 ตัว:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | (paste URL จาก Supabase) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (paste anon key จาก Supabase) |

6. กด **"Deploy"**
7. รอ ~1-2 นาที → จะได้ URL เช่น:
   - `https://market-wars-xxxx.vercel.app`

### ทดสอบ Live Site

เปิด URL ที่ Vercel ให้ → ต้องเห็น:
- ✅ หน้า MARKET WARS สีเขียว+ฟ้าบนพื้นดำ
- ✅ กดปุ่ม "Test Supabase Connection" → สีเขียว
- ✅ ลองเปิดจากมือถือ — หน้าจอ responsive

---

## ขั้นตอนที่ 6: เช็คว่าทุกอย่างพร้อม ✅

| เช็ค | ผลลัพธ์ที่ควรได้ |
|------|----------------|
| `npm run dev` ทำงาน | เห็นหน้า Market Wars ที่ localhost:3000 |
| Supabase connected | ปุ่มทดสอบเป็นสีเขียว |
| Code อยู่บน GitHub | เห็นไฟล์ทั้งหมดที่ github.com/marketwars-game/market-wars |
| Vercel deploy สำเร็จ | เปิด .vercel.app URL ได้ |
| Auto-deploy ทำงาน | Push code ใหม่ → Vercel build ใหม่อัตโนมัติ |
| เปิดจากมือถือได้ | เปิด Vercel URL จากโทรศัพท์ → responsive ดี |

**ถ้าผ่านทั้งหมด → Task A2 เสร็จ!** 🎉

---

## Troubleshooting

### `npm install` ไม่ได้ / error
- ตรวจสอบว่าติดตั้ง **Node.js** แล้ว (ต้อง v18+)
- รัน `node --version` ถ้าไม่มี → ดาวน์โหลดจาก nodejs.org

### Supabase connection failed
- เช็คว่า `.env.local` มี URL และ Key ถูกต้อง
- URL ต้องขึ้นต้นด้วย `https://` และลงท้ายด้วย `.supabase.co`
- Key ต้องเป็น **anon (public)** key ไม่ใช่ service_role key

### Vercel deploy failed
- เช็ค Environment Variables ว่าใส่ถูกตัว
- ดู build log ใน Vercel dashboard → หา error message
- ลอง `npm run build` ที่เครื่องก่อน ดูว่า build ผ่านไหม

### git push ไม่ได้
- ต้องใช้ Personal Access Token ไม่ใช่ password
- หรือใช้ SSH key แทน (GitHub → Settings → SSH keys)

---

## ขั้นตอนถัดไป

เมื่อ Task A2 เสร็จ ให้ทำ **Task A3** — ทดสอบว่าทุกอย่างเชื่อมกัน (30 นาที)
แล้วก็พร้อมเข้า **ช่วง B — สร้างเกม!** เริ่มจาก Task B1: MC สร้างห้อง

> 💡 เปิด chat ใหม่กับ Claude แล้วบอกว่า **"เริ่ม Task B1"** ได้เลย!
