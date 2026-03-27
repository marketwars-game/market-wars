// FILE: lib/constants.ts — Game Configuration (Single Source of Truth)
// VERSION: B14-v1 — Content & Balance: Sector names, Return table v4, Quiz from Session 2, Events rewrite, Quiz bonus 200/100/0
// LAST MODIFIED: 27 Mar 2026
// HISTORY: B1 created | B3 phase timers + display | B4 companies + events | B5 return table + golden deals | B8 quiz + news (v2: 3-phase) | B9 duel config + attack phase update | B10 disable golden deal | B12-UX year_intro + market_open + step groups | B12-BAL rebalance returns + events + news + duel | B13-BATCH0 cut news/rebalance/attack, add quiz bonus + chance cards | B14 sector names + return table v4 + quiz Session 2 + events rewrite + quiz bonus 200/100/0

// ==============================================
// Market Wars — Game Configuration
// Single Source of Truth — ทุก game data อยู่ที่นี่
// ==============================================

// --- Game Settings ---
export const MAX_PLAYERS = 60;
export const TOTAL_ROUNDS = 6;
export const STARTING_MONEY = 10000;
export const ALLOCATION_STEP = 10; // ทีละ 10%

// ==============================================
// ✅ B14: Quiz Bonus — ปรับจาก 300/150/0 → 200/100/0
// ลดน้ำหนัก quiz ให้ investment สำคัญขึ้น
// ==============================================
export const QUIZ_BONUS = {
  CORRECT_2: 200,  // ถูกครบ 2 ข้อ → +฿200
  CORRECT_1: 100,  // ถูก 1 ข้อ → +฿100
  CORRECT_0: 0,    // ผิดหมด → ฿0
};

// ==============================================
// ✅ B13: Chance Cards — การ์ดโชคชะตา (แทนเป่ายิงฉุบ)
// สุ่ม client-side จาก seed (room_id + round + player_id)
// ทุกคนได้ 1 ใบ/รอบ → write DB 1 ครั้ง/คน
// Pool: 20 ใบ (10 บวก / 10 ลบ) — expected value ≈ +฿15
// ==============================================
export const CHANCE_CARDS: {
  id: number;
  text: string;
  emoji: string;
  amount: number; // + = ได้เงิน, - = เสียเงิน
}[] = [
  // === การ์ดบวก (10 ใบ) — เหตุการณ์ดีๆ ในชีวิต ===
  { id: 1,  text: 'ญาติให้เงินขวัญถุงวันเกิด!', emoji: '🎁', amount: 200 },
  { id: 2,  text: 'ชนะแข่งขันตอบคำถามที่โรงเรียน!', emoji: '🏆', amount: 300 },
  { id: 3,  text: 'ถูกรางวัลจับฉลากงานโรงเรียน!', emoji: '🎉', amount: 250 },
  { id: 4,  text: 'ทำงานพิเศษช่วงปิดเทอม ได้เงินเก็บ!', emoji: '⭐', amount: 150 },
  { id: 5,  text: 'เงินออมในกระปุกครบเป้า!', emoji: '🐷', amount: 100 },
  { id: 6,  text: 'เก็บเงินได้ที่โรงอาหาร! โชคดี!', emoji: '💎', amount: 100 },
  { id: 7,  text: 'ได้ทุนการศึกษาด้านการเงิน!', emoji: '📊', amount: 150 },
  { id: 8,  text: 'พ่อแม่ให้โบนัสเพราะเกรดดีขึ้น!', emoji: '🌟', amount: 200 },
  { id: 9,  text: 'ขายของมือสองออนไลน์ได้กำไร!', emoji: '💰', amount: 300 },
  { id: 10, text: 'ได้รางวัลนักออมดีเด่นประจำปี!', emoji: '🎯', amount: 500 },

  // === การ์ดลบ (10 ใบ) — ค่าใช้จ่ายที่เกิดขึ้นในชีวิต ===
  { id: 11, text: 'มือถือตกพื้นจอแตก ต้องซ่อม!', emoji: '📱', amount: -200 },
  { id: 12, text: 'ช้อปปิ้งเกินงบ ใช้เงินเกินแผน!', emoji: '🛒', amount: -100 },
  { id: 13, text: 'ไม่สบาย ต้องจ่ายค่ายาเอง', emoji: '🏥', amount: -150 },
  { id: 14, text: 'ค่าเน็ตกับค่าไฟเดือนนี้แพงมาก!', emoji: '⚡', amount: -100 },
  { id: 15, text: 'รถเสีย ต้องนั่งแท็กซี่ไปเรียน 1 เดือน!', emoji: '🚌', amount: -200 },
  { id: 16, text: 'สั่งอาหารออนไลน์ทุกวัน เงินหมดไม่รู้ตัว!', emoji: '🍔', amount: -150 },
  { id: 17, text: 'ซื้อเกมแล้วไม่สนุก คืนเงินไม่ได้!', emoji: '🎮', amount: -100 },
  { id: 18, text: 'โดนหลอกโอนเงินออนไลน์!', emoji: '🔓', amount: -500 },
  { id: 19, text: 'รองเท้าพัง ต้องซื้อคู่ใหม่!', emoji: '👟', amount: -250 },
  { id: 20, text: 'ทำของเพื่อนเสีย ต้องจ่ายค่าชดเชย', emoji: '📋', amount: -300 },
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
// ✅ B14: Events — เขียนใหม่ match return table v4
// description สั้นกระชับสำหรับจอ Display
// ดร.โบว์ ใช้ script แยก (เอกสารปริ้น) เล่าเพิ่ม
// ==============================================

export const EVENTS = [
  {
    round: 1,
    title: 'มือถือรุ่นใหม่ขายดี!',
    emoji: '📱',
    description: 'บริษัทมือถือเปิดตัวรุ่นใหม่ ยอดขายทะลุเป้า! 📱เทค พุ่ง 🎮เกม ตามมา แต่ ☀️พลังงาน ยังไม่ได้ประโยชน์',
    image: null as string | null,
  },
  {
    round: 2,
    title: 'โรคระบาดทั่วโลก!',
    emoji: '🦠',
    description: 'โรคระบาดระลอกใหม่! คนอยู่บ้าน 🎮เกม+🍔อาหาร delivery บูม! แต่ 📱เทค ร่วงเพราะ supply chain สะดุด',
    image: null as string | null,
  },
  {
    round: 3,
    title: 'วัคซีนสำเร็จ!',
    emoji: '💉',
    description: 'วัคซีนมาแล้ว! เศรษฐกิจฟื้นตัว 📱เทค กลับมาแรง แต่ 🎮เกม+🍔อาหาร ลดลงเพราะคนออกจากบ้าน',
    image: null as string | null,
  },
  {
    round: 4,
    title: 'สงคราม น้ำมันแพง!',
    emoji: '⛽',
    description: 'เกิดสงคราม น้ำมันราคาพุ่ง! ☀️พลังงานสะอาด ได้กำไร แต่ 🍔อาหาร ต้นทุนขนส่งสูง กำไรหด',
    image: null as string | null,
  },
  {
    round: 5,
    title: 'AI บูม!',
    emoji: '🤖',
    description: 'AI ปฏิวัติโลก! 📱เทค พุ่งสุด ใช้ AI เพิ่มกำไร แต่ 🧺กองทุน ร่วงเพราะ AI แทนที่ผู้จัดการกองทุน',
    image: null as string | null,
  },
  {
    round: 6,
    title: 'ขึ้นดอกเบี้ย!',
    emoji: '🏦',
    description: 'ธนาคารกลางขึ้นดอกเบี้ย! 🍔อาหาร สิ่งจำเป็นยังขายดี ☀️พลังงาน ฟื้นตัว แต่ 📱เทค+🎮เกม ร่วงหนัก กู้เงินแพง!',
    image: null as string | null,
  },
];

// ==============================================
// ✅ B14: Return Table v4 — Rebalanced
// ==============================================
// หลักออกแบบ:
// 1. max return ~15% (ลดจาก 30%)
// 2. ตัวที่พุ่งรอบนี้ → มักร่วงรอบถัดไป ("สลับกัน")
// 3. ทุกหุ้นมีรอบพุ่ง + รอบร่วง อย่างน้อย 1 รอบ
// 4. กระจาย 3+ ตัว (max 40%) ชนะ all-in ทุกตัว
// 5. PiggyBank บวกเสมอแต่น้อย (safe haven)
// 6. R6 twist: อาหาร (สิ่งจำเป็น) ชนะ, เทค ร่วงหนัก
// 7. ผู้นำหมุนเวียนทุกรอบ — ไม่มี "คำตอบที่ถูกตลอด"
// 8. "วิ่งตามผู้ชนะ" = ขาดทุนหนัก (-39.5%)
//
// ผลลัพธ์ verified:
// - Best all-in: อาหาร ฿11,863 (+18.6%)
// - Best diversified (3+ stocks, max 40%): ฿11,957 (+19.6%) ✅ ชนะ!
// - Equal weight 6 ตัว: ฿11,217 (+12.2%)
// - "วิ่งตามผู้ชนะ": ฿6,050 (-39.5%) ❌ ขาดทุนหนัก!
// - All-in เทค: ฿10,104 (+1.0%) — แทบเจ๊ง
// - All-in เกม: ฿9,494 (-5.1%) — ขาดทุน!

export const RETURN_TABLE: Record<string, number[]> = {
  // [round1, round2, round3, round4, round5, round6]
  //
  // R1: มือถือรุ่นใหม่ → เทคพุ่ง, พลังงานยังไม่ได้ประโยชน์
  // R2: โรคระบาด → เกม+อาหารบูม, เทค supply chain สะดุด
  // R3: วัคซีนฟื้นตัว → เทคกลับมา, เกม+อาหารลด (คนออกจากบ้าน)
  // R4: สงคราม → พลังงานพุ่ง, อาหารร่วง (ต้นทุนขนส่ง)
  // R5: AI บูม → เทคพุ่งสุด, กองทุนร่วง (AI แทนที่ fund manager)
  // R6: ขึ้นดอกเบี้ย → อาหาร win (inelastic demand), เทค+เกมร่วง (กู้แพง)
  robosnack:   [  3,   12,   -8,  -10,    8,   15],
  zoomzoom:    [ 14,  -12,   12,   -8,   15,  -15],
  megafun:     [ 10,   15,  -12,    3,  -10,   -8],
  greenpower:  [ -8,   -5,    8,   15,   -3,   12],
  piggybank:   [  2,    2,    3,    2,    3,    3],
  safegold:    [  5,    4,    6,   -5,   -8,   10],
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
// ==============================================

// --- Quiz Pool (13 ข้อ จาก Session 2 Kahoot — Young Investor) ---
export const QUIZ_POOL: {
  id: number;
  question: string;
  choices: string[];
  correct: number; // 0-based index
}[] = [
  // === R1: เงินเฟ้อ — ทำไมต้องลงทุน ===
  {
    id: 1,
    question: 'เงินเฟ้อคืออะไร?',
    choices: ['เงินบวม', 'ของแพงขึ้น เงินเท่าเดิมซื้อได้น้อยลง', 'ดอกเบี้ยสูง', 'เงินเยอะขึ้น'],
    correct: 1,
  },
  {
    id: 2,
    question: 'ชานมไข่มุกเมื่อ 15 ปีก่อนแก้วละ 30 บาท ตอนนี้ 70 บาท เพราะอะไร?',
    choices: ['ชานมอร่อยขึ้น', 'เงินเฟ้อ', 'ร้านโลภ', 'เส้นใหญ่ขึ้น'],
    correct: 1,
  },
  // === R2: รู้จักหุ้น + ความเสี่ยง ===
  {
    id: 3,
    question: 'ซื้อหุ้น Apple 1 หุ้น แปลว่าอะไร?',
    choices: ['ได้ iPhone ฟรี', 'เป็นเจ้าของส่วนหนึ่งของบริษัท Apple', 'ได้ทำงานที่ Apple', 'ได้ส่วนลดซื้อ Mac'],
    correct: 1,
  },
  {
    id: 4,
    question: 'ข้อไหนเสี่ยงน้อยที่สุด?',
    choices: ['หุ้น Tesla', 'Bitcoin', 'ฝากออมทรัพย์', 'หุ้น Roblox'],
    correct: 2,
  },
  // === R3: รู้จักการลงทุน 3 แบบ ===
  {
    id: 5,
    question: 'กองทุนรวมเปรียบเทียบเหมือนอะไร?',
    choices: ['ซื้อขนมชิ้นเดียว', 'ชุดรวมมิตร มีคนเก่งๆ ช่วยเลือกให้', 'ล็อตเตอรี่', 'ฝากเงินธนาคาร'],
    correct: 1,
  },
  {
    id: 6,
    question: 'ฝากเงิน = ม้าหมุน, กองทุน = ชิงช้าสวรรค์, แล้วหุ้น = ?',
    choices: ['ม้าหมุนอีกรอบ', 'รถไฟเหาะ', 'ร้านขายของ', 'ที่นั่งพัก'],
    correct: 1,
  },
  // === R4: กระจายความเสี่ยง ===
  {
    id: 7,
    question: '"อย่าใส่ไข่ทุกฟองในตะกร้าใบเดียว" หมายถึงอะไร?',
    choices: ['ระวังไข่แตก', 'กระจายการลงทุน อย่าลงตัวเดียว', 'ซื้อไข่หลายร้าน', 'อย่ากินไข่เยอะ'],
    correct: 1,
  },
  {
    id: 8,
    question: 'มี 1,000 บาท portfolio ไหนดีที่สุด?',
    choices: ['หุ้น 100%', 'ฝากเงิน 100%', 'กระจาย: ฝาก+กองทุน+หุ้น', 'ไม่ลงทุนเลย'],
    correct: 2,
  },
  // === R5: ดอกเบี้ยทบต้น + เริ่มเร็ว ===
  {
    id: 9,
    question: 'ดอกเบี้ยทบต้น พิเศษยังไง?',
    choices: ['ได้ดอกเบี้ยจากดอกเบี้ยด้วย', 'ดอกเบี้ยเท่าเดิมทุกปี', 'ได้เงินคืนทันที', 'ไม่ต้องเสียภาษี'],
    correct: 0,
  },
  {
    id: 10,
    question: 'น้องไดม์เริ่มลงทุนอายุ 10 พี่เจเริ่มอายุ 20 ใครมีเงินมากกว่าตอนอายุ 30?',
    choices: ['พี่เจ เพราะโตกว่า', 'เท่ากัน', 'น้องไดม์ เพราะเริ่มเร็วกว่า', 'ไม่รู้'],
    correct: 2,
  },
  // === R6: ระวังภัย + ราคาหุ้นขึ้นลง ===
  {
    id: 11,
    question: 'มีคนชวนลงทุน บอก "การันตีกำไร 100%" ควรทำอย่างไร?',
    choices: ['รีบลงทุนเลย', 'ชวนเพื่อนมาด้วย', 'ไม่เชื่อ ถ้าดีเกินจริงมักไม่จริง', 'ขอดูรายละเอียด'],
    correct: 2,
  },
  {
    id: 12,
    question: 'หุ้น Netflix ราคาลง 70% เพราะสูญเสียสมาชิก ข้อไหนถูก?',
    choices: ['ราคาจะไม่มีวันกลับมา', 'ราคาหุ้นขึ้นลงตามผลประกอบการ', 'ต้องรีบขายทิ้ง', 'Netflix จะล้มละลาย'],
    correct: 1,
  },
  // === สำรอง (ไม่ถูกใช้ในรอบปกติ — เก็บไว้ใน pool) ===
  {
    id: 13,
    question: 'ถ้ามี 1,000 บาท ลงทุนได้ 10% ต่อปี ปีที่ 2 จะได้ดอกเบี้ยเท่าไหร่?',
    choices: ['100 บาทเท่าเดิม', '110 บาท (ดอกเบี้ยทบต้น)', '200 บาท', '50 บาท'],
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
