// FILE: lib/constants.ts — Game Configuration (Single Source of Truth)
// VERSION: B13-BATCH0-v1 — Cut news/rebalance/attack, add QUIZ_BONUS + CHANCE_CARDS + chance_card phase
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B1 created | B3 phase timers + display | B4 companies + events | B5 return table + golden deals | B8 quiz + news (v2: 3-phase) | B9 duel config + attack phase update | B10 disable golden deal | B12-UX year_intro + market_open + step groups | B12-BAL rebalance returns + events + news + duel | B13-BATCH0 cut news/rebalance/attack, add quiz bonus + chance cards

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
// ✅ B13: Quiz Bonus — ตอบ quiz ถูกได้เงิน bonus
// ==============================================
export const QUIZ_BONUS = {
  CORRECT_2: 300,  // ถูกครบ 2 ข้อ → +฿300
  CORRECT_1: 150,  // ถูก 1 ข้อ → +฿150
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
// ✅ B13: ตัด attack + rebalance, เพิ่ม chance_card
export const PHASE_TIMERS: Record<string, number> = {
  research: 90,       // ตอบ quiz 2 ข้อ
  invest: 120,        // เลือกลงทุน 6 บริษัท
  chance_card: 30,    // ✅ B13: กดเปิดการ์ดโชคชะตา
  golden_deal: 60,    // แข่ง quiz ชิงดีล (ปิดอยู่)
};

// --- Phase Display Info ---
// ✅ B13: ตัด news_feed, rebalance, attack, attack_result / เพิ่ม chance_card / ปรับ research_reveal
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
  // ✅ B13: ปรับ research_reveal — แสดง bonus เงินแทนปลดล็อกข่าว
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
    playerMessage: 'จัดสรรงบประมาณประจำปีลงทุน 6 บริษัท',
    mcTip: 'เด็กเลือกลงทุน ทุกรอบเริ่มจาก 0% ใหม่ — กด Next เมื่อพร้อม',
    hasTimer: true,
  },
  // ✅ B13: Chance Card (แทน attack + attack_result)
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
    playerMessage: 'Watch the big screen!',
    mcTip: 'อ่านข่าวให้เด็กฟัง แล้วถามว่า "คิดว่าข่าวนี้จะกระทบหุ้นตัวไหนบ้าง?" ให้เด็กแสดงความเห็นก่อนกด Next เพื่อเฉลย',
    hasTimer: false,
  },
  event_result: {
    name: 'Market Impact',
    icon: '📊',
    displayMessage: 'Market impact revealed!',
    playerMessage: 'Watch the big screen!',
    mcTip: 'อธิบายว่าทำไมแต่ละบริษัทถึงได้/เสียแบบนี้ เชื่อมกับข่าว แล้วกด Next',
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
    displayMessage: 'Returns calculated!',
    playerMessage: 'See your returns this round!',
    mcTip: 'ให้เด็กดูผลตัวเองบนมือถือ ถามว่า "ใครได้เยอะสุด? ใครขาดทุน?" แล้วกด Next ไป Leaderboard',
    hasTimer: false,
  },
  leaderboard: {
    name: 'Leaderboard',
    icon: '🏆',
    displayMessage: 'Rankings updated!',
    playerMessage: 'Check your ranking!',
    mcTip: 'Dramatic reveal! Comment on who moved up/down. Press Next to continue.',
    hasTimer: false,
  },
  final: {
    name: 'Final Summary',
    icon: '🎉',
    displayMessage: 'Game Over!',
    playerMessage: 'Game over! See your final results!',
    mcTip: 'Game finished! Announce Top 3, awards, and 5 lessons.',
    hasTimer: false,
  },
};

// ==============================================
// ✅ B13: Step Groups — ปรับสำหรับ phase flow ใหม่
// ตัด news_feed ออกจาก research / ตัด rebalance ออกจาก invest
// เปลี่ยน fight → chance (attack+attack_result → chance_card)
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

// --- 6 Companies ---
export const COMPANIES = [
  {
    id: 'robosnack',
    name: 'RoboSnack',
    type: 'Food & Beverage',
    risk: 'Medium',
    color: '#FF6B6B',
    icon: '🤖🍔',
    description: 'ร้านขนมหุ่นยนต์ ขายดีมาก แต่ต้นทุนสูง',
  },
  {
    id: 'zoomzoom',
    name: 'ZoomZoom',
    type: 'Tech / EV',
    risk: 'High',
    color: '#00D4FF',
    icon: '🚀',
    description: 'แอปเรียกรถบินไฟฟ้า เพิ่งเปิดตัว',
  },
  {
    id: 'megafun',
    name: 'MegaFun',
    type: 'Gaming',
    risk: 'High',
    color: '#A855F7',
    icon: '🎮',
    description: 'บริษัทเกม เกมใหม่กำลังจะออก',
  },
  {
    id: 'greenpower',
    name: 'GreenPower',
    type: 'Energy',
    risk: 'Medium-High',
    color: '#22C55E',
    icon: '⚡',
    description: 'พลังงานสะอาด โซลาร์เซลล์',
  },
  {
    id: 'piggybank',
    name: 'PiggyBank+',
    type: 'Savings',
    risk: 'Very Low',
    color: '#F59E0B',
    icon: '🐷',
    description: 'ฝากออมทรัพย์ ดอกเบี้ยต่ำแต่ปลอดภัย',
  },
  {
    id: 'safegold',
    name: 'SafeGold Fund',
    type: 'Fund',
    risk: 'Medium',
    color: '#EC4899',
    icon: '🛡️',
    description: 'กองทุนรวม มีผู้จัดการกองทุนดูแล',
  },
];

// ==============================================
// ✅ B12-BAL: Events — ปรับ description ให้ match RETURN_TABLE ใหม่
// ==============================================

export const EVENTS = [
  {
    round: 1,
    title: 'iPhone ใหม่ขายดี!',
    emoji: '📱',
    description: 'Apple เปิดตัว iPhone รุ่นใหม่ ยอดขายทะลุเป้า หุ้นเทคพุ่ง! แต่บริษัทพลังงานยังไม่ได้ประโยชน์',
    image: null as string | null,
  },
  {
    round: 2,
    title: 'โรคระบาดทั่วโลก!',
    emoji: '🦠',
    description: 'โรคระบาดครั้งใหญ่! คนอยู่บ้านเล่นเกมสั่งอาหาร — MegaFun+RoboSnack พุ่ง! แต่ ZoomZoom ร่วงหนัก เพราะไม่มีใครเดินทาง',
    image: null as string | null,
  },
  {
    round: 3,
    title: 'เศรษฐกิจฟื้นตัว!',
    emoji: '📈',
    description: 'วัคซีนมาแล้ว! คนออกจากบ้าน เทคฟื้นตัว เศรษฐกิจดีขึ้น แต่ MegaFun ลดลงเพราะคนเลิกอยู่บ้านเล่นเกม',
    image: null as string | null,
  },
  {
    round: 4,
    title: 'สงคราม น้ำมันแพง!',
    emoji: '⛽',
    description: 'เกิดสงคราม น้ำมันราคาพุ่ง! GreenPower ได้กำไรเพราะพลังงานทางเลือกมาแรง แต่ RoboSnack ร่วงหนักเพราะต้นทุนขนส่งพุ่ง',
    image: null as string | null,
  },
  {
    round: 5,
    title: 'AI บูม! เทคพุ่ง!',
    emoji: '🤖',
    description: 'AI ปฏิวัติโลก! ZoomZoom พุ่ง +30% เพราะใช้ AI ขับรถ แต่ SafeGold Fund ร่วง -15% เพราะ AI แทนที่ผู้จัดการกองทุน!',
    image: null as string | null,
  },
  {
    round: 6,
    title: 'ขึ้นดอกเบี้ย!',
    emoji: '🏦',
    description: 'ธนาคารกลางขึ้นดอกเบี้ย! GreenPower+RoboSnack ฟื้นตัว ฝากเงินได้ดอกเบี้ยดี แต่หุ้นเทค+เกมร่วงหนักเพราะกู้เงินแพง!',
    image: null as string | null,
  },
];

// ==============================================
// ✅ B12-BAL: Return Table — Rebalanced
// ==============================================
// หลักออกแบบ:
// 1. ไม่มีหุ้นตัวไหน dominate ตลอด 6 รอบ
// 2. ทุกหุ้นมี "รอบพุ่ง" และ "รอบร่วง" อย่างน้อย 1 รอบ
// 3. กระจายลงทุน (3+ ตัว) ชนะ all-in ทุกตัว (volatility drag)
// 4. รอบ 6 มีทั้งบวกและลบ (ไม่ลบหมด)
// 5. ผู้นำหมุนเวียนทุกรอบ — ไม่มี "คำตอบที่ถูกตลอด"
// 6. Narrative ตรงกับ EVENTS
// 7. PiggyBank บวกเสมอแต่น้อย (safe haven จริง)
//
// ผลลัพธ์ verified:
// - Best all-in: GreenPower ฿12,242 (+22.4%)
// - Best diversified (3+ stocks, max 40%): ฿12,284 (+22.8%) ✅ ชนะ!
// - เด็กกระจายทั่วไป: ~฿12,052 (+20%) ชนะ 4/6 all-in strategies
// - All-in MegaFun: ฿10,219 (+2.2%) — เคยเป็น king ตอนนี้แทบเจ๊ง
// - All-in ZoomZoom: ฿9,930 (-0.7%) — ขาดทุน!

export const RETURN_TABLE: Record<string, number[]> = {
  // [round1, round2, round3, round4, round5, round6]
  //
  // R1: iPhone → เทคพุ่ง, พลังงานยังไม่ได้ประโยชน์
  // R2: โรคระบาด → เกม+อาหารบูม, เทค/รถร่วง
  // R3: ฟื้นตัว → เทคกลับมา, เกมลด (คนออกจากบ้าน)
  // R4: สงคราม → พลังงานพุ่ง, อาหารร่วง (น้ำมันแพง=ขนส่งแพง)
  // R5: AI บูม → เทคพุ่งสุด, กองทุนร่วง (AI แทนที่ fund manager)
  // R6: ขึ้นดอกเบี้ย → mixed! พลังงาน+อาหารฟื้น, เทค+เกมร่วง
  zoomzoom:   [ 15,  -25,   20,  -10,   30,  -18],
  robosnack:  [  5,   15,    8,  -20,   -5,   15],
  megafun:    [ 10,   30,  -15,   -5,   18,  -25],
  greenpower: [ -8,  -12,   12,   25,  -10,   20],
  piggybank:  [  2,    3,    2,    3,    2,    5],
  safegold:   [  5,    5,   10,    8,  -15,    8],
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
// ✅ B13: ปรับข้อความ — ตัด Golden Deal, เปลี่ยนเป็น Chance Card
export const MC_TIPS: Record<number, string> = {
  1: 'รอบแรก! อธิบายให้เด็กเข้าใจว่าต้องทำอะไรบ้างในแต่ละขั้นตอน',
  2: 'เด็กเริ่มเข้าใจแล้ว ลองถามว่า "ใครเปลี่ยนกลยุทธ์บ้าง? ทำไม?"',
  3: 'ครึ่งทาง! ถามว่า "ใครกระจายลงทุน? ใคร all-in?" ดูว่าใครเรียนรู้',
  4: 'เด็กเริ่มเห็น pattern แล้ว — เตือนว่า "ผลอดีตไม่การันตีอนาคต!"',
  5: 'รอบก่อนสุดท้าย! เตือนเด็กว่าเหลืออีก 1 รอบ คิดดีๆ',
  6: 'รอบสุดท้าย! ทุกอย่างจะเปลี่ยน — ใครจะพลิกเกมได้?',
};

// ==============================================
// ✅ B8: Research Quiz — คำถาม
// (B13: ตัด news ออก — quiz ยังเหมือนเดิม)
// ==============================================

// --- Quiz Pool (12 ข้อ จาก Session 1-2 Kahoot) ---
export const QUIZ_POOL: {
  id: number;
  question: string;
  choices: string[];
  correct: number; // 0-based index
}[] = [
  // จาก Session 1 — Money Master
  {
    id: 1,
    question: 'เงินคือสิ่งที่แลกมาจากอะไร?',
    choices: ['ความโชคดี', 'เวลาและแรงงาน', 'ATM', 'พ่อแม่ให้มาเฉยๆ'],
    correct: 1,
  },
  {
    id: 2,
    question: 'ข้อไหนเป็น "Needs" (สิ่งจำเป็น)?',
    choices: ['สกินเกม Roblox', 'ชานมไข่มุก', 'อาหารกลางวัน', 'การ์ดโปเกมอน'],
    correct: 2,
  },
  {
    id: 3,
    question: '"Pay Yourself First" หมายถึงอะไร?',
    choices: ['ซื้อของให้ตัวเองก่อน', 'แบ่งเงินออมก่อนแล้วค่อยใช้', 'กู้เงินมาใช้', 'ขอเงินพ่อแม่เพิ่ม'],
    correct: 1,
  },
  {
    id: 4,
    question: 'ถ้าออมวันละ 20 บาท 1 ปี จะมีเงินประมาณเท่าไหร่?',
    choices: ['2,400 บาท', '5,200 บาท', '7,300 บาท', '10,000 บาท'],
    correct: 2,
  },
  // จาก Session 2 — Young Investor
  {
    id: 5,
    question: 'เงินเฟ้อคืออะไร?',
    choices: ['เงินบวม', 'ของแพงขึ้น เงินเท่าเดิมซื้อได้น้อยลง', 'ดอกเบี้ยสูง', 'เงินเยอะขึ้น'],
    correct: 1,
  },
  {
    id: 6,
    question: 'ซื้อหุ้น Apple 1 หุ้น แปลว่าอะไร?',
    choices: ['ได้ iPhone ฟรี', 'เป็นเจ้าของส่วนหนึ่งของบริษัท Apple', 'ได้ทำงานที่ Apple', 'ได้ส่วนลดซื้อ Mac'],
    correct: 1,
  },
  {
    id: 7,
    question: 'ข้อไหนเสี่ยงน้อยที่สุด?',
    choices: ['หุ้น Tesla', 'Bitcoin', 'ฝากออมทรัพย์', 'หุ้น Roblox'],
    correct: 2,
  },
  {
    id: 8,
    question: '"อย่าใส่ไข่ทุกฟองในตะกร้าใบเดียว" หมายถึงอะไร?',
    choices: ['ระวังไข่แตก', 'กระจายการลงทุน อย่าลงตัวเดียว', 'ซื้อไข่หลายร้าน', 'อย่ากินไข่เยอะ'],
    correct: 1,
  },
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
  {
    id: 11,
    question: 'กองทุนรวมเปรียบเทียบเหมือนอะไร?',
    choices: ['ซื้อขนมชิ้นเดียว', 'ชุดรวมมิตร มีคนเก่งๆ ช่วยเลือกให้', 'ล็อตเตอรี่', 'ฝากเงินธนาคาร'],
    correct: 1,
  },
  {
    id: 12,
    question: 'ฝากเงิน = ม้าหมุน, กองทุน = ชิงช้าสวรรค์, แล้วหุ้น = ?',
    choices: ['ม้าหมุนอีกรอบ', 'รถไฟเหาะ', 'ร้านขายของ', 'ที่นั่งพัก'],
    correct: 1,
  },
];

// --- ฟังก์ชั่นสุ่ม quiz จาก room_id (seed-based, ไม่ซ้ำ) ---
export function getQuizForRound(roomId: string, round: number): typeof QUIZ_POOL[number][] {
  let hash = 0;
  for (let i = 0; i < roomId.length; i++) {
    hash = ((hash << 5) - hash) + roomId.charCodeAt(i);
    hash |= 0;
  }

  const shuffled = [...QUIZ_POOL];
  const seed = Math.abs(hash);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) + i * 7) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const startIndex = (round - 1) * 2;
  return shuffled.slice(startIndex, startIndex + 2);
}

// ==============================================
// ✅ B12-BAL: Round News — ยังเก็บไว้สำหรับ reference
// (B13: ตัด news_feed phase แล้ว — data ยังอยู่ไม่ลบ เผื่อใช้ในอนาคต)
// ==============================================

export const ROUND_NEWS: {
  round: number;
  news: {
    text: string;
    isReal: boolean;
    emoji: string;
  }[];
}[] = [
  {
    round: 1,
    news: [
      { text: 'Apple เตรียมเปิดตัว iPhone รุ่นใหม่ คาดหุ้นเทคและแอปเรียกรถพุ่ง!', isReal: true, emoji: '📱' },
      { text: 'บริษัทพลังงานสะอาดกำลังจะได้สัมปทานใหม่ กำไรพุ่งแน่!', isReal: false, emoji: '⚡' },
      { text: 'ธนาคารจะลดดอกเบี้ยเหลือ 0% ฝากเงินไม่คุ้มแล้ว', isReal: false, emoji: '🏦' },
    ],
  },
  {
    round: 2,
    news: [
      { text: 'โรคระบาดใหม่แพร่กระจาย! คนอยู่บ้านเล่นเกม+สั่งอาหาร แต่ไม่มีใครเดินทาง', isReal: true, emoji: '🦠' },
      { text: 'ZoomZoom เตรียมเปิดตัวรถบินรุ่นใหม่ คาดหุ้นพุ่ง 50%!', isReal: false, emoji: '🚀' },
      { text: 'ทองคำจะราคาตก 50% เพราะคนขายทิ้ง!', isReal: false, emoji: '🪙' },
    ],
  },
  {
    round: 3,
    news: [
      { text: 'วัคซีนสำเร็จ! คนออกจากบ้าน เศรษฐกิจฟื้น เทคและพลังงานเริ่มดีขึ้น', isReal: true, emoji: '💉' },
      { text: 'MegaFun เตรียมเปิดตัวเกมใหม่สุดฮิต คาดรายได้ทะลุเป้า!', isReal: false, emoji: '🎮' },
      { text: 'ฝากเงินปีนี้ได้ดอกเบี้ย 20% ธนาคารแจกหนัก!', isReal: false, emoji: '🤑' },
    ],
  },
  {
    round: 4,
    news: [
      { text: 'เกิดสงคราม น้ำมันราคาพุ่ง! บริษัทพลังงานทางเลือกได้กำไร แต่ต้นทุนขนส่งอาหารพุ่ง', isReal: true, emoji: '⛽' },
      { text: 'RoboSnack เตรียมขยายร้าน 100 สาขาทั่วประเทศ!', isReal: false, emoji: '🤖' },
      { text: 'บริษัทเกมเตรียมซื้อกิจการคู่แข่ง กำไรจะพุ่ง 3 เท่า!', isReal: false, emoji: '🎮' },
    ],
  },
  {
    round: 5,
    news: [
      { text: 'AI ปฏิวัติโลก! บริษัทเทคและเกมใช้ AI ทำกำไร แต่ AI แทนที่ผู้จัดการกองทุนได้!', isReal: true, emoji: '🤖' },
      { text: 'SafeGold Fund ประกาศกำไรสูงสุดเป็นประวัติการณ์!', isReal: false, emoji: '🛡️' },
      { text: 'พลังงานสะอาดได้ทุนจาก AI ช่วยลดต้นทุน กำไรพุ่ง!', isReal: false, emoji: '☀️' },
    ],
  },
  {
    round: 6,
    news: [
      { text: 'แบงก์ชาติขึ้นดอกเบี้ย! ฝากเงินคุ้ม พลังงาน+อาหารฟื้น แต่หุ้นเทค+เกมกู้เงินแพงร่วงหนัก', isReal: true, emoji: '🏦' },
      { text: 'MegaFun เตรียมเปิดตัวเกม Metaverse คาดหุ้นพุ่ง 100%!', isReal: false, emoji: '🎮' },
      { text: 'ZoomZoom จะควบรวมกับ Tesla หุ้นจะพุ่ง 200%!', isReal: false, emoji: '🚀' },
    ],
  },
];
