// FILE: lib/constants.ts — Game Configuration (Single Source of Truth)
// VERSION: B23-v1 — Balance pass (data-driven from S2, 70 players): RETURN_TABLE v5c -> v6 (risk premium + deeper story crashes + piggybank 1%/yr); QUIZ_BONUS 200/100/0 -> 100/50/0; CHANCE_CARDS amounts halved
// LAST MODIFIED: 10 Jul 2026
// HISTORY: B1 created | B3 phase timers + display | B4 companies + events | B5 return table + golden deals | B8 quiz + news (v2: 3-phase) | B9 duel config + attack phase update | B10 disable golden deal | B12-UX year_intro + market_open + step groups | B12-BAL rebalance returns + events + news + duel | B13-BATCH0 cut news/rebalance/attack, add quiz bonus + chance cards | B14 sector names + return table v4 + quiz Session 2 + events rewrite + quiz bonus 200/100/0 | B17-BATCH0 LocalizedText type + QUIZ_POOL/CHANCE_CARDS bilingual (th/en) | B23 return table v6 + quiz bonus 100/50/0 + chance cards halved (S2 bonus share 68.5% -> ~34%)

// ==============================================
// Market Wars — Game Configuration
// Single Source of Truth — ทุก game data อยู่ที่นี่
// ==============================================

// ==============================================
// ✅ B17: Bilingual type — ข้อความที่เด็ก/ผู้ปกครองอ่าน แสดง 2 ภาษาพร้อมกัน
// ใช้กับ field ที่ผ่านตา player/projector เท่านั้น (ไม่ใช่ MC chrome)
// แก้คำแปลได้ตรงนี้เลย — render ด้วย <Bi t={...} /> (components/common/Bi.tsx)
// ==============================================
export type LocalizedText = { th: string; en: string };

// --- Game Settings ---
export const MAX_PLAYERS = 60;
export const TOTAL_ROUNDS = 6;
export const STARTING_MONEY = 10000;
export const ALLOCATION_STEP = 10; // ทีละ 10%

// ==============================================
// ✅ B23: Quiz Bonus — ปรับจาก 200/100/0 → 100/50/0
// S2 data (70 คน): quiz bonus = 56% ของกำไรทั้งห้อง (เฉลี่ย ฿1,029/คน
// vs หุ้น ฿579/คน) — เด็ก median ตอบถูก 11/12 → กลายเป็นเงินแจกถ้วนหน้า
// ลดครึ่งเพื่อให้สีเขียว/แดงบนจอสุดท้ายมาจากฝีมือลงทุนเป็นหลัก
// (ความยาก quiz คงเดิม — ตอบถูกเยอะ = ห้องเรียนสำเร็จ ไม่ใช่บั๊ก)
// ==============================================
export const QUIZ_BONUS = {
  CORRECT_2: 100,  // ถูกครบ 2 ข้อ → +฿100
  CORRECT_1: 50,   // ถูก 1 ข้อ → +฿50
  CORRECT_0: 0,    // ผิดหมด → ฿0
};

// ==============================================
// ✅ B13: Chance Cards — การ์ดโชคชะตา (แทนเป่ายิงฉุบ)
// สุ่ม client-side จาก seed (room_id + round + player_id)
// ทุกคนได้ 1 ใบ/รอบ → write DB 1 ครั้ง/คน
// Pool: 20 ใบ (10 บวก / 10 ลบ)
// ✅ B17: text → {th, en} (แสดงบนการ์ดที่เด็กเปิด)
// ✅ B23: ทุกใบหารสอง (±50..250, EV = +฿5) — เดิม ±100..500 ใบเดียว = 5% ของทุน แรงเกิน
//    S2 data: chance รวม 12.5% ของกำไรทั้งห้อง → ลดให้เป็นสีสัน ไม่ใช่ตัวตัดสิน
// ==============================================
export const CHANCE_CARDS: {
  id: number;
  text: LocalizedText;
  emoji: string;
  amount: number; // + = ได้เงิน, - = เสียเงิน
}[] = [
  // === การ์ดบวก (10 ใบ) — เหตุการณ์ดีๆ ในชีวิต ===
  { id: 1,  text: { th: 'ญาติให้เงินขวัญถุงวันเกิด!', en: 'A relative gives you birthday money!' }, emoji: '🎁', amount: 100 },
  { id: 2,  text: { th: 'ชนะแข่งขันตอบคำถามที่โรงเรียน!', en: 'You win a school quiz contest!' }, emoji: '🏆', amount: 150 },
  { id: 3,  text: { th: 'ถูกรางวัลจับฉลากงานโรงเรียน!', en: 'You win the school fair raffle!' }, emoji: '🎉', amount: 125 },
  { id: 4,  text: { th: 'ทำงานพิเศษช่วงปิดเทอม ได้เงินเก็บ!', en: 'A holiday side job earns you some savings!' }, emoji: '⭐', amount: 75 },
  { id: 5,  text: { th: 'เงินออมในกระปุกครบเป้า!', en: 'Your piggy bank hits its goal!' }, emoji: '🐷', amount: 50 },
  { id: 6,  text: { th: 'เก็บเงินได้ที่โรงอาหาร! โชคดี!', en: 'You find money in the cafeteria! Lucky!' }, emoji: '💎', amount: 50 },
  { id: 7,  text: { th: 'ได้ทุนการศึกษาด้านการเงิน!', en: 'You earn a finance scholarship!' }, emoji: '📊', amount: 75 },
  { id: 8,  text: { th: 'พ่อแม่ให้โบนัสเพราะเกรดดีขึ้น!', en: 'Your parents reward your better grades!' }, emoji: '🌟', amount: 100 },
  { id: 9,  text: { th: 'ขายของมือสองออนไลน์ได้กำไร!', en: 'You sell second-hand goods online for a profit!' }, emoji: '💰', amount: 150 },
  { id: 10, text: { th: 'ได้รางวัลนักออมดีเด่นประจำปี!', en: 'You win Saver of the Year!' }, emoji: '🎯', amount: 250 },

  // === การ์ดลบ (10 ใบ) — ค่าใช้จ่ายที่เกิดขึ้นในชีวิต ===
  { id: 11, text: { th: 'มือถือตกพื้นจอแตก ต้องซ่อม!', en: 'You drop your phone — cracked screen, pay to fix it!' }, emoji: '📱', amount: -100 },
  { id: 12, text: { th: 'ช้อปปิ้งเกินงบ ใช้เงินเกินแผน!', en: 'You overshop and blow your budget!' }, emoji: '🛒', amount: -50 },
  { id: 13, text: { th: 'ไม่สบาย ต้องจ่ายค่ายาเอง', en: 'You get sick and pay for medicine yourself.' }, emoji: '🏥', amount: -75 },
  { id: 14, text: { th: 'ค่าเน็ตกับค่าไฟเดือนนี้แพงมาก!', en: "This month's internet and electric bills are huge!" }, emoji: '⚡', amount: -50 },
  { id: 15, text: { th: 'รถเสีย ต้องนั่งแท็กซี่ไปเรียน 1 เดือน!', en: 'Your ride breaks down — a month of taxis to school!' }, emoji: '🚌', amount: -100 },
  { id: 16, text: { th: 'สั่งอาหารออนไลน์ทุกวัน เงินหมดไม่รู้ตัว!', en: 'Daily food delivery quietly drains your wallet!' }, emoji: '🍔', amount: -75 },
  { id: 17, text: { th: 'ซื้อเกมแล้วไม่สนุก คืนเงินไม่ได้!', en: "You buy a game you don't enjoy — no refund!" }, emoji: '🎮', amount: -50 },
  { id: 18, text: { th: 'โดนหลอกโอนเงินออนไลน์!', en: 'You get scammed into an online transfer!' }, emoji: '🔓', amount: -250 },
  { id: 19, text: { th: 'รองเท้าพัง ต้องซื้อคู่ใหม่!', en: 'Your shoes fall apart — buy a new pair!' }, emoji: '👟', amount: -125 },
  { id: 20, text: { th: 'ทำของเพื่อนเสีย ต้องจ่ายค่าชดเชย', en: "You break a friend's things and pay them back." }, emoji: '📋', amount: -150 },
];

// --- ฟังก์ชั่นสุ่ม Chance Card จาก seed (room_id + round + player_id → ไม่ซ้ำกัน) ---
export function getChanceCard(roomId: string, round: number, playerId: string): typeof CHANCE_CARDS[number] {
  // สร้าง hash จาก roomId + round + playerId
  let hash = 0;
  const seed = `${roomId}-${round}-${playerId}`;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CHANCE_CARDS.length;
  return CHANCE_CARDS[index];
}

// --- Room Code ---
export const ROOM_CODE_CONFIG = {
  characters: 'ABCDEFGHJKMNPQRSTUVWXYZ', // ไม่มี O, I, L (สับสนกับ 0, 1)
  length: 4,
};

// --- Phase Flow ---
// ✅ B13: ตัด news_feed, rebalance, attack, attack_result ออก / เพิ่ม chance_card
export const GAME_PHASES = [
  'lobby',        // ก่อนเริ่มเกม
  'year_intro',   // "ปีที่ X เริ่มแล้ว!" splash
  'research',     // ตอบ quiz
  'research_reveal', // เฉลย quiz + แสดง bonus เงิน
  'invest',       // เลือกลงทุน 6 บริษัท (ทุกรอบเริ่มจาก 0%)
  'chance_card',  // ✅ B13: เปิดการ์ดโชคชะตา (แทนเป่ายิงฉุบ)
  'market_open',  // "ตลาดเปิดแล้ว!" transition
  'event',        // MC เปิดข่าวเหตุการณ์
  'event_result', // เฉลย % return แต่ละบริษัท
  'results',      // ผลตอบแทนรอบนี้
  'leaderboard',  // อันดับ 1-20
  'final',        // สรุปจบเกม
] as const;

// ✅ B10: ปิด Golden Deal ชั่วคราว — เปิดกลับโดยเปลี่ยนเป็น [2, 4, 6]
export const GOLDEN_DEAL_ROUNDS: number[] = [];

// --- Phase Timers (วินาที) ---
// เฉพาะ phase ที่เด็กต้องทำอะไร (Pressure timer — แค่แสดง MC ยังกดเอง)
export const PHASE_TIMERS: Record<string, number> = {
  research: 90,       // ตอบ quiz 2 ข้อ
  invest: 120,        // เลือกลงทุน 6 บริษัท
  chance_card: 30,    // กดเปิดการ์ดโชคชะตา
  golden_deal: 60,    // แข่ง quiz ชิงดีล (ปิดอยู่)
};

// --- Phase Display Info ---
export const PHASE_DISPLAY: Record<string, {
  name: string;
  icon: string;
  displayMessage: string;    // แสดงบน Display (จอใหญ่)
  playerMessage: string;     // แสดงบน Player (มือถือ)
  mcTip: string;             // คำแนะนำ MC
  hasTimer: boolean;         // phase นี้มี timer ไหม
}> = {
  lobby: {
    name: 'Lobby',
    icon: '🏠',
    displayMessage: 'Waiting for players...',
    playerMessage: 'Waiting for MC to start the game...',
    mcTip: 'Wait until all players have joined, then press Start Game',
    hasTimer: false,
  },
  year_intro: {
    name: 'Year Intro',
    icon: '📅',
    displayMessage: 'ปีใหม่เริ่มแล้ว!',
    playerMessage: 'เตรียมตัวให้พร้อม!',
    mcTip: 'แนะนำว่าปีนี้จะทำอะไรบ้าง แล้วกด Next เพื่อเริ่ม Research Quiz',
    hasTimer: false,
  },
  research: {
    name: 'Research Quiz',
    icon: '🔍',
    displayMessage: 'Players answering quiz...',
    playerMessage: 'ตอบ Quiz 2 ข้อ ความรู้ = เงิน!',
    mcTip: 'รอเด็กตอบ quiz เสร็จ แล้วกด Next เพื่อเฉลย',
    hasTimer: true,
  },
  research_reveal: {
    name: 'Quiz Reveal',
    icon: '📝',
    displayMessage: 'เฉลย Quiz + Bonus!',
    playerMessage: 'ดูเฉลย Quiz + bonus เงินของคุณ!',
    mcTip: 'อธิบายเฉลยแต่ละข้อ บอกว่า "ตอบถูกได้ bonus เงินจริง!" แล้วกด Next ไปลงทุน',
    hasTimer: false,
  },
  invest: {
    name: 'Investment',
    icon: '💰',
    displayMessage: 'Players choosing investments...',
    playerMessage: 'จัดสรรงบประมาณประจำปีลงทุน 6 sector',
    mcTip: 'เด็กเลือกลงทุน ทุกรอบเริ่มจาก 0% ใหม่ — กด Next เมื่อพร้อม',
    hasTimer: true,
  },
  chance_card: {
    name: 'Chance Card',
    icon: '🃏',
    displayMessage: 'เปิดการ์ดโชคชะตา!',
    playerMessage: 'แตะเพื่อเปิดการ์ดโชคชะตาของคุณ!',
    mcTip: 'ให้เด็กกดเปิดการ์ด — ได้เงินหรือเสียเงิน สุ่มเหมือนเกมเศรษฐี! กด Next เมื่อทุกคนเปิดแล้ว',
    hasTimer: true,
  },
  market_open: {
    name: 'Market Open',
    icon: '📈',
    displayMessage: 'ตลาดเปิดแล้ว!',
    playerMessage: '📺 ดูจอใหญ่! ตลาดกำลังเปิด...',
    mcTip: 'สร้างความตื่นเต้น! "มาดูกันว่าปีนี้เกิดอะไรขึ้น..." แล้วกด Next เพื่อเปิดข่าว',
    hasTimer: false,
  },
  event: {
    name: 'Event Reveal',
    icon: '📰',
    displayMessage: 'Breaking news!',
    playerMessage: '📺 ดูจอใหญ่!',
    mcTip: 'ให้ ดร.โบว์ เล่า event ตาม script แล้วถามเด็กว่า "คิดว่า sector ไหนจะได้/เสียประโยชน์?" แล้วกด Next เฉลย',
    hasTimer: false,
  },
  event_result: {
    name: 'Market Impact',
    icon: '📊',
    displayMessage: 'ผลกระทบต่อตลาด!',
    playerMessage: '📺 ดูจอใหญ่!',
    mcTip: 'ให้ ดร.โบว์ อธิบายว่าทำไมแต่ละ sector ถึงได้/เสียแบบนี้ เชื่อมกับ event แล้วกด Next',
    hasTimer: false,
  },
  golden_deal: {
    name: 'Golden Deal',
    icon: '✨',
    displayMessage: 'Special deal available!',
    playerMessage: 'Answer the quiz to win the deal!',
    mcTip: 'Run the Golden Deal quiz. Top 3 get the deal! Press Next when done.',
    hasTimer: true,
  },
  results: {
    name: 'Round Results',
    icon: '💰',
    displayMessage: 'คำนวณผลตอบแทน!',
    playerMessage: 'ดูผลตอบแทนรอบนี้!',
    mcTip: 'ให้เด็กดูผลตัวเองบนมือถือ ถามว่า "ใครได้เยอะสุด? ใครขาดทุน?" แล้วกด Next ไป Leaderboard',
    hasTimer: false,
  },
  leaderboard: {
    name: 'Leaderboard',
    icon: '🏆',
    displayMessage: 'อันดับอัปเดต!',
    playerMessage: 'เช็คอันดับของคุณ!',
    mcTip: 'Dramatic reveal! ใครขึ้น ใครลง? ถามเด็กว่า "คนที่ขึ้นมา ลงทุนยังไง?" แล้วกด Next',
    hasTimer: false,
  },
  final: {
    name: 'Final Summary',
    icon: '🎉',
    displayMessage: 'จบเกมแล้ว!',
    playerMessage: 'จบเกม! ดูผลสรุป!',
    mcTip: 'ประกาศ Top 3 + รางวัล + สรุป 5 บทเรียน',
    hasTimer: false,
  },
};

// ==============================================
// ✅ B13: Step Groups — ปรับสำหรับ phase flow ใหม่
// ==============================================

export const STEP_GROUPS = [
  { id: 'research', icon: '🔍', label: 'วิจัย', phases: ['research', 'research_reveal'] },
  { id: 'invest', icon: '💰', label: 'ลงทุน', phases: ['invest'] },
  { id: 'chance', icon: '🃏', label: 'โชคชะตา', phases: ['chance_card'] },
  { id: 'event', icon: '📰', label: 'เหตุการณ์', phases: ['market_open', 'event', 'event_result', 'golden_deal'] },
  { id: 'results', icon: '📊', label: 'ผลลัพธ์', phases: ['results'] },
  { id: 'leaderboard', icon: '🏆', label: 'อันดับ', phases: ['leaderboard'] },
];

// ==============================================
// ✅ B12-UX: Year Intro Text — ข้อความประจำปี 1-6
// ==============================================

export const YEAR_INTRO_TEXT: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'การเดินทางเริ่มต้นแล้ว!', subtitle: 'ปีแรกของการลงทุน เตรียมตัวให้พร้อม' },
  2: { title: 'ปีที่ 2 มาถึงแล้ว!', subtitle: 'ตลาดเริ่มเปลี่ยนแปลง ปรับกลยุทธ์กัน' },
  3: { title: 'ครึ่งทางแล้ว!', subtitle: 'ผ่านมา 2 ปี ใครจะนำ ใครจะตาม?' },
  4: { title: 'ปีที่ 4 เริ่มแล้ว!', subtitle: 'เหลืออีก 3 ปี ตัดสินใจให้ดี' },
  5: { title: 'ใกล้จะจบแล้ว!', subtitle: 'เหลือแค่ 2 ปีสุดท้าย โค้งสุดท้าย!' },
  6: { title: 'ปีสุดท้าย!', subtitle: 'โอกาสสุดท้ายที่จะพลิกเกม!' },
};

// ==============================================
// ✅ B14: 6 Companies — เปลี่ยนเป็นชื่อ Sector + icon ใหม่
// เด็ก 10-15 เห็นแล้วเข้าใจทันที
// ==============================================

export const COMPANIES = [
  {
    id: 'robosnack',
    name: 'อาหาร (Food)',
    type: 'Food & Beverage',
    risk: 'Medium',
    color: '#FF6B6B',
    icon: '🍔',
    description: 'ร้านอาหาร ทุกคนต้องกิน ขายดีตลอด',
  },
  {
    id: 'zoomzoom',
    name: 'เทค (Tech)',
    type: 'Technology',
    risk: 'High',
    color: '#00D4FF',
    icon: '📱',
    description: 'บริษัทมือถือ แอป เทคโนโลยี ขึ้นลงแรง',
  },
  {
    id: 'megafun',
    name: 'เกม (Gaming)',
    type: 'Gaming',
    risk: 'High',
    color: '#A855F7',
    icon: '🎮',
    description: 'บริษัทเกม สนุกแต่ขึ้นลงเยอะ',
  },
  {
    id: 'greenpower',
    name: 'พลังงาน (Energy)',
    type: 'Energy',
    risk: 'Medium-High',
    color: '#22C55E',
    icon: '☀️',
    description: 'พลังงานสะอาด โซลาร์เซลล์',
  },
  {
    id: 'piggybank',
    name: 'ออมทรัพย์ (Savings)',
    type: 'Savings',
    risk: 'Very Low',
    color: '#F59E0B',
    icon: '🐷',
    description: 'ฝากธนาคาร ดอกเบี้ยน้อยแต่ปลอดภัย',
  },
  {
    id: 'safegold',
    name: 'กองทุน (Fund)',
    type: 'Fund',
    risk: 'Medium',
    color: '#EC4899',
    icon: '🧺',
    description: 'กองทุนรวม มีผู้เชี่ยวชาญเลือกให้',
  },
];

// ==============================================
// ✅ B14: Events — เขียนใหม่ match return table v5c
// description สั้นกระชับสำหรับจอ Display
// ดร.โบว์ ใช้ script แยก (เอกสารปริ้น) เล่าเพิ่ม
// ทุกรอบ: top 2-3 sector ห่างกันแค่ 1-2% → เดาถูกยาก
// ==============================================

export const EVENTS = [
  {
    round: 1,
    title: 'มือถือรุ่นใหม่ขายดี!',
    emoji: '📱',
    description: 'บริษัทมือถือเปิดตัวรุ่นใหม่ ยอดขายทะลุเป้า! 📱เทค 🍔อาหาร 🎮เกม ได้ประโยชน์ใกล้กัน แต่ ☀️พลังงาน ยังไม่ตาม',
    image: null as string | null,
  },
  {
    round: 2,
    title: 'โรคระบาดทั่วโลก!',
    emoji: '🦠',
    description: 'โรคระบาดระลอกใหม่! คนอยู่บ้าน 🎮เกม+🍔อาหาร delivery บูม! แต่ 📱เทค ร่วงหนักเพราะ supply chain สะดุด',
    image: null as string | null,
  },
  {
    round: 3,
    title: 'วัคซีนสำเร็จ!',
    emoji: '💉',
    description: 'วัคซีนมาแล้ว! เศรษฐกิจฟื้นตัว ☀️พลังงาน 📱เทค 🧺กองทุน กลับมาดีใกล้กัน แต่ 🎮เกม ร่วงหนักเพราะคนออกจากบ้าน',
    image: null as string | null,
  },
  {
    round: 4,
    title: 'สงคราม น้ำมันแพง!',
    emoji: '⛽',
    description: 'เกิดสงคราม น้ำมันราคาพุ่ง! ☀️พลังงานสะอาด ได้กำไร แต่ 🍔อาหาร ร่วงหนัก ต้นทุนขนส่งพุ่งสูง!',
    image: null as string | null,
  },
  {
    round: 5,
    title: 'AI บูม!',
    emoji: '🤖',
    description: 'AI ปฏิวัติโลก! 📱เทค+🍔อาหาร ใช้ AI เพิ่มกำไรได้ใกล้กัน แต่ 🎮เกม ร่วงหนัก 🧺กองทุน ก็โดน AI แทนที่',
    image: null as string | null,
  },
  {
    round: 6,
    title: 'ขึ้นดอกเบี้ย!',
    emoji: '🏦',
    description: 'ธนาคารกลางขึ้นดอกเบี้ย! 🍔อาหาร+☀️พลังงาน สิ่งจำเป็นยังดี แต่ 📱เทค ร่วงหนักมาก กู้เงินแพง!',
    image: null as string | null,
  },
];

// ==============================================
// ✅ B23: Return Table v6 — Risk Premium Rebalance (data-driven from S2, 70 real players)
// ==============================================
// ปัญหา v5c (พบจาก benchmark ghosts B20 + sparkline B22):
//   ผลรวม column เฉลี่ย +0.7%/ปี ≈ ไม่มี risk premium → ฝากเงินเฉยๆ (+13.7%)
//   ชนะกระจายเท่ากัน (+4.2%) ~3 เท่า = จอสุดท้ายสอนสวนทางดร.โบว์ (structural,
//   แก้ด้วยการจูนรายตัวไม่ได้ ต้องแก้ที่ผลรวม column)
//
// หลักออกแบบ v6 (เปลี่ยน 3 อย่างจาก v5c — ทิศทาง +/- ทุกช่องเหมือนเดิม 100%
// → EVENTS/quiz/script ดร.โบว์ ใช้ได้เหมือนเดิม):
// 1. ตัวชนะทุกปียกขึ้น +2..+4 จุด → ตลาดรวมมี risk premium (+1.6%/ปี)
// 2. PiggyBank 2%/ปี → 1%/ปี (ปีสุดท้าย 2%) — สมจริงกับดอกเบี้ยเงินฝากจริง
// 3. จุด crash ของ story กดลึกลง "ให้ห้องกรี๊ด" (เทค R2 -17 / R6 -20, เกม R5 -16)
//    ส่วนตัวแพ้รองที่ไม่ใช่พระเอกของข่าว ผ่อนขึ้น +1..+2
//
// หลักเดิมที่คงไว้:
// - ทุกรอบ top 2-3 ตัวห่างกัน 1-3% → เดาถูกตัว #1 ยาก
// - ไม่มี pattern "สลับ" ชัดเจน / "วิ่งตามผู้ชนะ" = ขาดทุนหนักสุด
// - PiggyBank บวกเสมอแต่น้อย (safe haven)
//
// Benchmarks verified (v6, ทบต้น 6 ปี):
// - กระจายเท่ากัน 6 ตัว: +9.8% ✅ ชนะฝากเงิน (เป้าหลักของ B23)
// - ฝากเงินเฉยๆ: +7.2% (อันดับ 4 จาก 6 เส้นบน sparkline ปี 6 — เกณฑ์ B22 ผ่าน)
// - All-in ถูกตัว: พลังงาน +27.3% / อาหาร +24.2% (ยอมให้ดวงดีชนะได้ —
//   แต่พลังงานเปิดเกม -7,-4 สองปีติด = ต้นทุนทางใจสูง, S2 ไม่มีใครถือครบ 6 ปีเลย)
// - All-in ผิดตัว: เทค -12.1% / เกม -16.0% (มีปีเดียว -17/-20 ให้กรี๊ด)
// - "วิ่งตามผู้ชนะ": -33.1% ❌ บ๊วยตาราง
//
// Replay กับข้อมูลจริง S2 (70 คน, v6 + quiz 100/50 + chance หารสอง):
// - สัดส่วน bonus ต่อกำไรทั้งห้อง 68.5% → 33.6% (กำไรมาจากฝีมือลงทุนเป็นหลัก)
// - แชมป์คนเดิม (semi-concentrated) / คนขาดทุน 8 → 6 คน / Top 10 ไม่พัง

export const RETURN_TABLE: Record<string, number[]> = {
  // [round1, round2, round3, round4, round5, round6]
  //
  // R1: มือถือรุ่นใหม่ → เทค+8% อาหาร+6% เกม+5% (ใกล้กัน!) พลังงาน-7%
  // R2: โรคระบาด → เกม+12% อาหาร+11% (ใกล้กัน!) เทค-17% (supply chain)
  // R3: วัคซีนฟื้นตัว → พลังงาน+12% เทค+11% กองทุน+9% (3ตัวใกล้!) เกม-13%
  // R4: สงคราม → พลังงาน+15% เกม+4% อาหาร-17% (ต้นทุนขนส่งหนัก!)
  // R5: AI บูม → เทค+15% อาหาร+13% (ใกล้!) เกม-16% กองทุน-6%
  // R6: ขึ้นดอกเบี้ย → อาหาร+16% พลังงาน+13% (ใกล้!) เทค-20% (crash! 😱)
  robosnack:   [  6,   11,   -3,  -17,   13,   16],
  zoomzoom:    [  8,  -17,   11,   -4,   15,  -20],
  megafun:     [  5,   12,  -13,    4,  -16,   -6],
  greenpower:  [ -7,   -4,   12,   15,   -2,   13],
  piggybank:   [  1,    1,    1,    1,    1,    2],
  safegold:    [  4,    5,    9,   -4,   -6,   10],
};

// --- Golden Deals ---
export const GOLDEN_DEALS = [
  {
    round: 2,
    name: 'IPO SpaceThai',
    description: 'หุ้น IPO บริษัทอวกาศไทย คาดการณ์ผลตอบแทน +15-25%',
    actual_return: 20,
    is_trap: false,
  },
  {
    round: 4,
    name: 'AI Revolution Fund',
    description: 'กองทุน AI สุดร้อนแรง คาดการณ์ +12-18%',
    actual_return: 15,
    is_trap: false,
  },
  {
    round: 6,
    name: 'Crypto SuperCoin',
    description: '🚨 การันตีผลตอบแทน +30%! โอกาสสุดพิเศษ!',
    actual_return: -20,
    is_trap: true,
  },
];

// --- MC Tips (คำแนะนำ MC เพิ่มเติมตามรอบ) ---
export const MC_TIPS: Record<number, string> = {
  1: 'รอบแรก! อธิบายให้เด็กเข้าใจว่าต้องทำอะไรบ้างในแต่ละขั้นตอน',
  2: 'เด็กเริ่มเข้าใจแล้ว ลองถามว่า "ใครเปลี่ยนกลยุทธ์บ้าง? ทำไม?"',
  3: 'ครึ่งทาง! ถามว่า "ใครกระจายลงทุน? ใคร all-in?" ดูว่าใครเรียนรู้',
  4: 'เด็กเริ่มเห็น pattern แล้ว — เตือนว่า "ผลอดีตไม่การันตีอนาคต!"',
  5: 'รอบก่อนสุดท้าย! เตือนเด็กว่าเหลืออีก 1 รอบ คิดดีๆ',
  6: 'รอบสุดท้าย! ทุกอย่างจะเปลี่ยน — ใครจะพลิกเกมได้?',
};

// ==============================================
// ✅ B14: Research Quiz — คำถามจาก Session 2 Kahoot
// เรียงตามรอบ ไม่สุ่ม — ร้อยเรียงกับ Event ของแต่ละรอบ
// ✅ B17: question + choices → {th, en} (แสดง 2 ภาษาบนจอเด็ก + จอใหญ่)
// ==============================================

// --- Quiz Pool (13 ข้อ จาก Session 2 Kahoot — Young Investor) ---
export const QUIZ_POOL: {
  id: number;
  question: LocalizedText;
  choices: LocalizedText[];
  correct: number; // 0-based index
}[] = [
  // === R1: เงินเฟ้อ — ทำไมต้องลงทุน ===
  {
    id: 1,
    question: { th: 'เงินเฟ้อคืออะไร?', en: 'What is inflation?' },
    choices: [
      { th: 'เงินบวม', en: 'Money gets bloated' },
      { th: 'ของแพงขึ้น เงินเท่าเดิมซื้อได้น้อยลง', en: 'Prices go up; the same money buys less' },
      { th: 'ดอกเบี้ยสูง', en: 'High interest rates' },
      { th: 'เงินเยอะขึ้น', en: 'Having more money' },
    ],
    correct: 1,
  },
  {
    id: 2,
    question: { th: 'ชานมไข่มุกเมื่อ 15 ปีก่อนแก้วละ 30 บาท ตอนนี้ 70 บาท เพราะอะไร?', en: 'Bubble tea was 30 baht a cup 15 years ago, now 70 baht. Why?' },
    choices: [
      { th: 'ชานมอร่อยขึ้น', en: 'The tea tastes better now' },
      { th: 'เงินเฟ้อ', en: 'Inflation' },
      { th: 'ร้านโลภ', en: 'The shop got greedy' },
      { th: 'เส้นใหญ่ขึ้น', en: 'Bigger boba pearls' },
    ],
    correct: 1,
  },
  // === R2: รู้จักหุ้น + ความเสี่ยง ===
  {
    id: 3,
    question: { th: 'ซื้อหุ้น Apple 1 หุ้น แปลว่าอะไร?', en: 'Buying 1 share of Apple means what?' },
    choices: [
      { th: 'ได้ iPhone ฟรี', en: 'You get a free iPhone' },
      { th: 'เป็นเจ้าของส่วนหนึ่งของบริษัท Apple', en: 'You own a small piece of Apple' },
      { th: 'ได้ทำงานที่ Apple', en: 'You get a job at Apple' },
      { th: 'ได้ส่วนลดซื้อ Mac', en: 'You get a discount on a Mac' },
    ],
    correct: 1,
  },
  {
    id: 4,
    question: { th: 'ข้อไหนเสี่ยงน้อยที่สุด?', en: 'Which one has the lowest risk?' },
    choices: [
      { th: 'หุ้น Tesla', en: 'Tesla stock' },
      { th: 'Bitcoin', en: 'Bitcoin' },
      { th: 'ฝากออมทรัพย์', en: 'A savings account' },
      { th: 'หุ้น Roblox', en: 'Roblox stock' },
    ],
    correct: 2,
  },
  // === R3: รู้จักการลงทุน 3 แบบ ===
  {
    id: 5,
    question: { th: 'กองทุนรวมเปรียบเทียบเหมือนอะไร?', en: 'A mutual fund is most like what?' },
    choices: [
      { th: 'ซื้อขนมชิ้นเดียว', en: 'Buying a single snack' },
      { th: 'ชุดรวมมิตร มีคนเก่งๆ ช่วยเลือกให้', en: 'A combo set — experts pick the mix for you' },
      { th: 'ล็อตเตอรี่', en: 'A lottery ticket' },
      { th: 'ฝากเงินธนาคาร', en: 'A bank deposit' },
    ],
    correct: 1,
  },
  {
    id: 6,
    question: { th: 'ฝากเงิน = ม้าหมุน, กองทุน = ชิงช้าสวรรค์, แล้วหุ้น = ?', en: 'Savings = merry-go-round, fund = Ferris wheel, so stocks = ?' },
    choices: [
      { th: 'ม้าหมุนอีกรอบ', en: 'Another merry-go-round' },
      { th: 'รถไฟเหาะ', en: 'A roller coaster' },
      { th: 'ร้านขายของ', en: 'A gift shop' },
      { th: 'ที่นั่งพัก', en: 'A resting bench' },
    ],
    correct: 1,
  },
  // === R4: กระจายความเสี่ยง ===
  {
    id: 7,
    question: { th: '"อย่าใส่ไข่ทุกฟองในตะกร้าใบเดียว" หมายถึงอะไร?', en: "What does \"don't put all your eggs in one basket\" mean?" },
    choices: [
      { th: 'ระวังไข่แตก', en: 'Be careful not to break the eggs' },
      { th: 'กระจายการลงทุน อย่าลงตัวเดียว', en: "Spread your investments; don't bet on just one" },
      { th: 'ซื้อไข่หลายร้าน', en: 'Buy eggs from many shops' },
      { th: 'อย่ากินไข่เยอะ', en: "Don't eat too many eggs" },
    ],
    correct: 1,
  },
  {
    id: 8,
    question: { th: 'มี 1,000 บาท portfolio ไหนดีที่สุด?', en: 'With 1,000 baht, which portfolio is best?' },
    choices: [
      { th: 'หุ้น 100%', en: '100% stocks' },
      { th: 'ฝากเงิน 100%', en: '100% savings' },
      { th: 'กระจาย: ฝาก+กองทุน+หุ้น', en: 'Spread it: savings + fund + stocks' },
      { th: 'ไม่ลงทุนเลย', en: "Don't invest at all" },
    ],
    correct: 2,
  },
  // === R5: ดอกเบี้ยทบต้น + เริ่มเร็ว ===
  {
    id: 9,
    question: { th: 'ดอกเบี้ยทบต้น พิเศษยังไง?', en: 'What makes compound interest special?' },
    choices: [
      { th: 'ได้ดอกเบี้ยจากดอกเบี้ยด้วย', en: 'You earn interest on your interest too' },
      { th: 'ดอกเบี้ยเท่าเดิมทุกปี', en: 'The same interest every year' },
      { th: 'ได้เงินคืนทันที', en: 'You get your money back instantly' },
      { th: 'ไม่ต้องเสียภาษี', en: 'You pay no tax' },
    ],
    correct: 0,
  },
  {
    id: 10,
    question: { th: 'น้องไดม์เริ่มลงทุนอายุ 10 พี่เจเริ่มอายุ 20 ใครมีเงินมากกว่าตอนอายุ 30?', en: 'Dime starts investing at 10, Jay at 20. Who has more money at 30?' },
    choices: [
      { th: 'พี่เจ เพราะโตกว่า', en: "Jay, because they're older" },
      { th: 'เท่ากัน', en: 'They end up equal' },
      { th: 'น้องไดม์ เพราะเริ่มเร็วกว่า', en: 'Dime, because they started earlier' },
      { th: 'ไม่รู้', en: 'No way to tell' },
    ],
    correct: 2,
  },
  // === R6: ระวังภัย + ราคาหุ้นขึ้นลง ===
  {
    id: 11,
    question: { th: 'มีคนชวนลงทุน บอก "การันตีกำไร 100%" ควรทำอย่างไร?', en: 'Someone offers an investment "guaranteed 100% profit." What should you do?' },
    choices: [
      { th: 'รีบลงทุนเลย', en: 'Invest right away' },
      { th: 'ชวนเพื่อนมาด้วย', en: 'Bring your friends in too' },
      { th: 'ไม่เชื่อ ถ้าดีเกินจริงมักไม่จริง', en: "Don't believe it — if it's too good to be true, it usually is" },
      { th: 'ขอดูรายละเอียด', en: 'Ask to see the details' },
    ],
    correct: 2,
  },
  {
    id: 12,
    question: { th: 'หุ้น Netflix ราคาลง 70% เพราะสูญเสียสมาชิก ข้อไหนถูก?', en: 'Netflix stock fell 70% after losing subscribers. Which is correct?' },
    choices: [
      { th: 'ราคาจะไม่มีวันกลับมา', en: 'The price will never recover' },
      { th: 'ราคาหุ้นขึ้นลงตามผลประกอบการ', en: 'Stock prices rise and fall with company performance' },
      { th: 'ต้องรีบขายทิ้ง', en: 'You should sell it off immediately' },
      { th: 'Netflix จะล้มละลาย', en: 'Netflix will go bankrupt' },
    ],
    correct: 1,
  },
  // === สำรอง (ไม่ถูกใช้ในรอบปกติ — เก็บไว้ใน pool) ===
  {
    id: 13,
    question: { th: 'ถ้ามี 1,000 บาท ลงทุนได้ 10% ต่อปี ปีที่ 2 จะได้ดอกเบี้ยเท่าไหร่?', en: 'With 1,000 baht earning 10% a year, how much interest in year 2?' },
    choices: [
      { th: '100 บาทเท่าเดิม', en: '100 baht, same as before' },
      { th: '110 บาท (ดอกเบี้ยทบต้น)', en: '110 baht (compound interest)' },
      { th: '200 บาท', en: '200 baht' },
      { th: '50 บาท', en: '50 baht' },
    ],
    correct: 1,
  },
];

// ==============================================
// ✅ B14: Quiz Mapping — กำหนดคำถามตายตัวต่อรอบ (ไม่สุ่ม)
// ร้อยเรียงกับ Event ของแต่ละรอบ ให้ ดร.โบว์ สอนต่อเนื่อง
// ==============================================

export const QUIZ_PER_ROUND: Record<number, number[]> = {
  1: [1, 2],    // เงินเฟ้อ → Event: มือถือรุ่นใหม่
  2: [3, 4],    // หุ้น + ความเสี่ยง → Event: โรคระบาด
  3: [5, 6],    // การลงทุน 3 แบบ → Event: วัคซีนฟื้นตัว
  4: [7, 8],    // กระจายความเสี่ยง → Event: สงคราม
  5: [9, 10],   // ดอกเบี้ยทบต้น + เริ่มเร็ว → Event: AI บูม
  6: [11, 12],  // ระวังภัย + หุ้นขึ้นลง → Event: ขึ้นดอกเบี้ย
};

// --- ฟังก์ชั่นดึง quiz ตามรอบ (แทนฟังก์ชันสุ่มเดิม) ---
// ✅ B14: เปลี่ยนจากสุ่ม → กำหนดตายตัว (roomId ยังรับไว้เพื่อ backward compatibility)
export function getQuizForRound(_roomId: string, round: number): typeof QUIZ_POOL[number][] {
  const quizIds = QUIZ_PER_ROUND[round] || [1, 2]; // fallback to round 1
  return quizIds.map(id => QUIZ_POOL.find(q => q.id === id)!);
}
