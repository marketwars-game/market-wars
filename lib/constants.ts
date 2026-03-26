// FILE: lib/constants.ts — Game Configuration (Single Source of Truth)
// VERSION: B12-BAL-v1 — Rebalanced RETURN_TABLE + EVENTS + NEWS + DUEL_CONFIG
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B1 created | B3 phase timers + display | B4 companies + events | B5 return table + golden deals | B8 quiz + news (v2: 3-phase) | B9 duel config + attack phase update | B10 disable golden deal | B12-UX year_intro + market_open + step groups | B12-BAL rebalance returns + events + news + duel

// ==============================================
// Market Wars — Game Configuration
// Single Source of Truth — ทุก game data อยู่ที่นี่
// ==============================================

// --- Game Settings ---
export const MAX_PLAYERS = 20;
export const TOTAL_ROUNDS = 6;
export const STARTING_MONEY = 10000;
export const ALLOCATION_STEP = 10; // ทีละ 10%
export const ATTACK_MULTIPLIER = 1.5;

// --- Duel Config (B9: Market Fight) ---
// ✅ B12-BAL: ลดจาก 500/300 → 300/200 เพื่อไม่ให้ duel overpower กลยุทธ์การลงทุน
export const DUEL_CONFIG = {
  WIN_AMOUNT: 300,     // ชนะได้ +฿300 (เดิม 500)
  LOSE_AMOUNT: 200,    // แพ้เสีย -฿200 (เดิม 300)
  DRAW_AMOUNT: 0,      // เสมอ ฿0
  MOVES: ['rock', 'paper', 'scissors'] as const,
  MOVE_EMOJI: { rock: '✊', paper: '✋', scissors: '✌️' } as Record<string, string>,
  MOVE_LABEL: { rock: 'ค้อน', paper: 'กระดาษ', scissors: 'กรรไกร' } as Record<string, string>,
  // rock > scissors > paper > rock
  WINS_AGAINST: { rock: 'scissors', scissors: 'paper', paper: 'rock' } as Record<string, string>,
};

// --- Room Code ---
export const ROOM_CODE_CONFIG = {
  characters: 'ABCDEFGHJKMNPQRSTUVWXYZ', // ไม่มี O, I, L (สับสนกับ 0, 1)
  length: 4,
};

// --- Phase Flow ---
// ✅ B12-UX: เพิ่ม year_intro (หัวรอบ) + market_open (กลางรอบ)
export const GAME_PHASES = [
  'lobby',        // ก่อนเริ่มเกม
  'year_intro',   // ✅ B12-UX: "ปีที่ X เริ่มแล้ว!" splash
  'research',     // ตอบ quiz ปลดล็อกข่าว
  'invest',       // เลือกลงทุน 6 บริษัท
  'attack',       // ⚔️ Market Fight — เป่ายิงฉุบ
  'attack_result', // สรุปผล duel
  'market_open',  // ✅ B12-UX: "ตลาดเปิดแล้ว!" transition
  'event',        // MC เปิดข่าวเหตุการณ์
  'event_result', // เฉลย % return แต่ละบริษัท
  'golden_deal',  // ดีลพิเศษ (เฉพาะรอบ 2, 4, 6)
  'results',      // ผลตอบแทนรอบนี้
  'leaderboard',  // อันดับ 1-20
  'rebalance',    // ปรับพอร์ตก่อนรอบถัดไป
  'final',        // สรุปจบเกม
] as const;

// ✅ B10: ปิด Golden Deal ชั่วคราว — เปิดกลับโดยเปลี่ยนเป็น [2, 4, 6]
export const GOLDEN_DEAL_ROUNDS: number[] = [];
// export const GOLDEN_DEAL_ROUNDS = [2, 4, 6]; // ← ค่าเดิม เปิดกลับเมื่อพร้อม

// --- Phase Timers (วินาที) ---
// เฉพาะ phase ที่เด็กต้องทำอะไร (Pressure timer — แค่แสดง MC ยังกดเอง)
export const PHASE_TIMERS: Record<string, number> = {
  research: 90,      // ตอบ quiz 2 ข้อ
  invest: 120,       // เลือกลงทุน 6 บริษัท
  attack: 30,        // เป่ายิงฉุบ — เลือก 1 move
  golden_deal: 60,   // แข่ง quiz ชิงดีล
  rebalance: 90,     // ปรับพอร์ต
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
  // ✅ B12-UX: Year Intro — splash "ปีที่ X เริ่มแล้ว!"
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
    playerMessage: 'ตอบ Quiz 2 ข้อ เพื่อปลดล็อกข่าวจริง!',
    mcTip: 'รอเด็กตอบ quiz เสร็จ แล้วกด Next เพื่อเฉลย',
    hasTimer: true,
  },
  research_reveal: {
    name: 'Quiz Reveal',
    icon: '📝',
    displayMessage: 'เฉลย Quiz!',
    playerMessage: 'ดูเฉลย Quiz ของคุณ!',
    mcTip: 'อธิบายเฉลยแต่ละข้อ แล้วกด Next เพื่อแสดงข่าวรอบนี้',
    hasTimer: false,
  },
  news_feed: {
    name: 'News Feed',
    icon: '📰',
    displayMessage: 'ข่าวรอบนี้!',
    playerMessage: 'อ่านข่าวก่อนตัดสินใจลงทุน!',
    mcTip: 'อ่านข่าวให้เด็กฟัง ถามว่า "คิดว่าข่าวไหนจริง?" แล้วกด Next ไปลงทุน',
    hasTimer: false,
  },
  invest: {
    name: 'Investment',
    icon: '💰',
    displayMessage: 'Players choosing investments...',
    playerMessage: 'Allocate your money across 6 companies',
    mcTip: 'Players are choosing their investments. Press Next when ready.',
    hasTimer: true,
  },
  attack: {
    name: 'Market Fight',
    icon: '⚔️',
    displayMessage: 'เลือก ค้อน กรรไกร กระดาษ!',
    playerMessage: 'เป่ายิงฉุบกับคู่ของคุณ!',
    mcTip: 'รอเด็กเลือก ✊✌️✋ แล้วกด Next เพื่อเปิดผล — คนที่ไม่กดจะแพ้อัตโนมัติ',
    hasTimer: true,
  },
  attack_result: {
    name: 'Fight Results',
    icon: '⚔️',
    displayMessage: 'ผลการต่อสู้!',
    playerMessage: 'ดูผลเป่ายิงฉุบของคุณ!',
    mcTip: 'ให้เด็กดูผลบนมือถือ ถามว่า "ใครชนะบ้าง?" แล้วกด Next',
    hasTimer: false,
  },
  // ✅ B12-UX: Market Open — transition "ตลาดเปิดแล้ว!"
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
  rebalance: {
    name: 'Rebalance',
    icon: '🔄',
    displayMessage: 'Players adjusting portfolios...',
    playerMessage: 'Adjust your portfolio for the next round',
    mcTip: 'Players can change their allocations. Press Next Round when ready.',
    hasTimer: true,
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
// ✅ B12-UX: Step Groups — สำหรับ step indicator ทั้ง 3 จอ
// ==============================================

// 6 กลุ่มใหญ่ที่แสดงบน step indicator
export const STEP_GROUPS = [
  { id: 'research', icon: '🔍', label: 'วิจัย', phases: ['research', 'research_reveal', 'news_feed'] },
  { id: 'invest', icon: '💰', label: 'ลงทุน', phases: ['invest', 'rebalance'] },
  { id: 'fight', icon: '⚔️', label: 'ต่อสู้', phases: ['attack', 'attack_result'] },
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
export const MC_TIPS: Record<number, string> = {
  1: 'รอบแรก! อธิบายให้เด็กเข้าใจว่าต้องทำอะไรบ้างในแต่ละขั้นตอน',
  2: 'รอบนี้มี Golden Deal! สร้างความตื่นเต้นก่อนเปิดดีล',
  3: 'เด็กเริ่มเข้าใจแล้ว ลองถามว่า "ใครเปลี่ยนพอร์ตบ้าง? ทำไม?"',
  4: 'รอบนี้มี Golden Deal อีกครั้ง! เด็กจะเริ่มแย่งกันตอบ',
  5: 'รอบก่อนสุดท้าย! เตือนเด็กว่าเหลืออีก 1 รอบ คิดดีๆ',
  6: 'รอบสุดท้าย + Golden Deal กับดัก! อย่าเฉลยก่อน ปล่อยให้เด็กตัดสินใจเอง',
};

// ==============================================
// ✅ B8: Research Quiz — คำถาม + ข่าว
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
// ✅ B12-BAL: Round News — ปรับข่าวให้ match RETURN_TABLE ใหม่
// ==============================================

// --- Round News (ข่าว 3 ข่าวต่อรอบ: จริง 1 + มั่ว 2) ---
// ✅ B12-BAL: ข่าวจริงบอกใบ้ตรงกว่าเดิม + ข่าวมั่วล่อให้ลงผิดตัว
export const ROUND_NEWS: {
  round: number;
  news: {
    text: string;
    isReal: boolean;
    emoji: string;
  }[];
}[] = [
  {
    // R1: เทคพุ่ง (ZoomZoom +15), พลังงานยังไม่ได้ประโยชน์ (GreenPower -8)
    round: 1,
    news: [
      { text: 'Apple เตรียมเปิดตัว iPhone รุ่นใหม่ คาดหุ้นเทคและแอปเรียกรถพุ่ง!', isReal: true, emoji: '📱' },
      { text: 'บริษัทพลังงานสะอาดกำลังจะได้สัมปทานใหม่ กำไรพุ่งแน่!', isReal: false, emoji: '⚡' },
      { text: 'ธนาคารจะลดดอกเบี้ยเหลือ 0% ฝากเงินไม่คุ้มแล้ว', isReal: false, emoji: '🏦' },
    ],
  },
  {
    // R2: เกม+อาหารบูม (MegaFun +30, RoboSnack +15), เทคร่วง (ZoomZoom -25)
    round: 2,
    news: [
      { text: 'โรคระบาดใหม่แพร่กระจาย! คนอยู่บ้านเล่นเกม+สั่งอาหาร แต่ไม่มีใครเดินทาง', isReal: true, emoji: '🦠' },
      { text: 'ZoomZoom เตรียมเปิดตัวรถบินรุ่นใหม่ คาดหุ้นพุ่ง 50%!', isReal: false, emoji: '🚀' },
      { text: 'ทองคำจะราคาตก 50% เพราะคนขายทิ้ง!', isReal: false, emoji: '🪙' },
    ],
  },
  {
    // R3: ฟื้นตัว เทคกลับ (ZoomZoom +20), เกมลด (MegaFun -15), พลังงานเริ่มดี (GreenPower +12)
    round: 3,
    news: [
      { text: 'วัคซีนสำเร็จ! คนออกจากบ้าน เศรษฐกิจฟื้น เทคและพลังงานเริ่มดีขึ้น', isReal: true, emoji: '💉' },
      { text: 'MegaFun เตรียมเปิดตัวเกมใหม่สุดฮิต คาดรายได้ทะลุเป้า!', isReal: false, emoji: '🎮' },
      { text: 'ฝากเงินปีนี้ได้ดอกเบี้ย 20% ธนาคารแจกหนัก!', isReal: false, emoji: '🤑' },
    ],
  },
  {
    // R4: พลังงานพุ่ง (GreenPower +25), อาหารร่วง (RoboSnack -20)
    round: 4,
    news: [
      { text: 'เกิดสงคราม น้ำมันราคาพุ่ง! บริษัทพลังงานทางเลือกได้กำไร แต่ต้นทุนขนส่งอาหารพุ่ง', isReal: true, emoji: '⛽' },
      { text: 'RoboSnack เตรียมขยายร้าน 100 สาขาทั่วประเทศ!', isReal: false, emoji: '🤖' },
      { text: 'บริษัทเกมเตรียมซื้อกิจการคู่แข่ง กำไรจะพุ่ง 3 เท่า!', isReal: false, emoji: '🎮' },
    ],
  },
  {
    // R5: AI → เทคพุ่ง (ZoomZoom +30, MegaFun +18), กองทุนร่วง (SafeGold -15)
    round: 5,
    news: [
      { text: 'AI ปฏิวัติโลก! บริษัทเทคและเกมใช้ AI ทำกำไร แต่ AI แทนที่ผู้จัดการกองทุนได้!', isReal: true, emoji: '🤖' },
      { text: 'SafeGold Fund ประกาศกำไรสูงสุดเป็นประวัติการณ์!', isReal: false, emoji: '🛡️' },
      { text: 'พลังงานสะอาดได้ทุนจาก AI ช่วยลดต้นทุน กำไรพุ่ง!', isReal: false, emoji: '☀️' },
    ],
  },
  {
    // R6: ดอกเบี้ยขึ้น → mixed! พลังงาน+อาหารฟื้น, เทค+เกมร่วงหนัก, ฝากเงินดี
    round: 6,
    news: [
      { text: 'แบงก์ชาติขึ้นดอกเบี้ย! ฝากเงินคุ้ม พลังงาน+อาหารฟื้น แต่หุ้นเทค+เกมกู้เงินแพงร่วงหนัก', isReal: true, emoji: '🏦' },
      { text: 'MegaFun เตรียมเปิดตัวเกม Metaverse คาดหุ้นพุ่ง 100%!', isReal: false, emoji: '🎮' },
      { text: 'ZoomZoom จะควบรวมกับ Tesla หุ้นจะพุ่ง 200%!', isReal: false, emoji: '🚀' },
    ],
  },
];
