# Market Wars — The Investment Game

🎮 เกมจำลองการลงทุนแบบ multiplayer สำหรับ **Dime! Kids Camp**

เด็ก 20 คนเป็น "ผู้จัดการกองทุน" มีเงินเริ่มต้น 10,000 บาท ตัดสินใจลงทุนผ่าน 6 รอบ ใครมีเงินมากที่สุดตอนจบ = ชนะ!

## Tech Stack

- **Next.js 14** + TypeScript
- **Tailwind CSS** (Dark + Neon theme)
- **Supabase** (Database + Realtime)
- **Vercel** (Hosting)

## Getting Started

```bash
npm install
cp .env.example .env.local  # แล้วใส่ Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
market-wars/
├── app/                    # Next.js app directory
│   ├── page.tsx            # Landing / join screen
│   ├── play/[roomId]/      # Player game screen
│   ├── mc/                 # MC control panel
│   └── api/                # API routes
├── components/             # React components
├── lib/                    # Utilities & game logic
│   ├── supabase.ts         # Supabase client
│   ├── game-engine.ts      # Game calculations
│   └── constants.ts        # Companies, returns, etc.
└── public/                 # Static assets
```
