// FILE: lib/constants.ts — Game Configuration (Single Source of Truth)
// VERSION: B8-v2 — Research Quiz: QUIZ_POOL + ROUND_NEWS + research_reveal/news_feed PHASE_DISPLAY
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B1 created | B3 phase timers + display | B4 companies + events | B5 return table + golden deals | B8 quiz + news (v2: 3-phase)

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

// --- Room Code ---
export const ROOM_CODE_CONFIG = {
  characters: 'ABCDEFGHJKMNPQRSTUVWXYZ', // ไม่มี O, I, L (สับสนกับ 0, 1)
  length: 4,
};

// --- Phase Flow ---
// ลำดับ phase ในแต่ละรอบ (Golden Deal อยู่หลัง event_result ก่อน results)
export const GAME_PHASES = [
  'lobby',        // ก่อนเริ่มเกม
  'research',     // ตอบ quiz ปลดล็อกข่าว
  'invest',       // เลือกลงทุน 6 บริษัท
  'attack',       // เลือก โจมตี/ป้องกัน/สอดแนม
  'event',        // MC เปิดข่าวเหตุการณ์
  'event_result', // ✅ B5: เฉลย % return แต่ละบริษัท
  'golden_deal',  // ดีลพิเศษ (เฉพาะรอบ 2, 4, 6)
  'results',      // ผลตอบแทนรอบนี้
  'leaderboard',  // อันดับ 1-20
  'rebalance',    // ปรับพอร์ตก่อนรอบถัดไป
  'final',        // สรุปจบเกม
] as const;

export const GOLDEN_DEAL_ROUNDS = [2, 4, 6];

// --- Phase Timers (วินาที) ---
// เฉพาะ phase ที่เด็กต้องทำอะไร (Pressure timer — แค่แสดง MC ยังกดเอง)
export const PHASE_TIMERS: Record<string, number> = {
  research: 90,      // ตอบ quiz 2 ข้อ
  invest: 120,       // เลือกลงทุน 6 บริษัท
  attack: 60,        // เลือก action + เป้าหมาย
  golden_deal: 60,   // แข่ง quiz ชิงดีล
  rebalance: 90,     // ปรับพอร์ต
};

// --- Phase Display Info ---
// ข้อมูลแสดงผลแต่ละ phase (ชื่อ, icon, คำอธิบาย)
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
    name: 'Attack & Defend',
    icon: '⚔️',
    displayMessage: 'Players choosing actions...',
    playerMessage: 'Choose: Attack, Defend, or Spy?',
    mcTip: 'PvP phase! Wait for all players to choose, then press Next.',
    hasTimer: true,
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

// --- Events (เหตุการณ์แต่ละรอบ) ---
// ✅ B5: เพิ่ม image field — null ตอนนี้ ใส่ path รูปจริงตอน polish
// เมื่อใส่รูป: image: '/events/round1-news.jpg'
// รูปเก็บใน public/events/
export const EVENTS = [
  {
    round: 1,
    title: 'iPhone ใหม่ขายดี!',
    emoji: '📱',
    description: 'Apple เปิดตัว iPhone รุ่นใหม่ ยอดขายทะลุเป้า หุ้นเทคพุ่ง!',
    image: null as string | null,
  },
  {
    round: 2,
    title: 'โรคระบาดทั่วโลก!',
    emoji: '🦠',
    description: 'โรคระบาดครั้งใหญ่ คนอยู่บ้าน ธุรกิจออนไลน์บูม แต่ร้านอาหารรอด!',
    image: null as string | null,
  },
  {
    round: 3,
    title: 'เศรษฐกิจฟื้นตัว!',
    emoji: '📈',
    description: 'วัคซีนมาแล้ว! เศรษฐกิจเริ่มกลับมา ทุกอุตสาหกรรมฟื้นตัว',
    image: null as string | null,
  },
  {
    round: 4,
    title: 'สงคราม น้ำมันแพง!',
    emoji: '⛽',
    description: 'เกิดสงคราม น้ำมันราคาพุ่ง บริษัทพลังงานได้กำไร แต่ที่เหลือลำบาก',
    image: null as string | null,
  },
  {
    round: 5,
    title: 'AI บูม! เทคพุ่ง!',
    emoji: '🤖',
    description: 'AI ปฏิวัติโลก! บริษัทเทคกำไรมหาศาล ทุกคนอยากลงทุนเทค',
    image: null as string | null,
  },
  {
    round: 6,
    title: 'ขึ้นดอกเบี้ย!',
    emoji: '🏦',
    description: 'ธนาคารกลางขึ้นดอกเบี้ย หุ้นทุกตัวชะลอ แต่ฝากเงินได้ดอกเบี้ยดี',
    image: null as string | null,
  },
];

// --- Return Table (% ผลตอบแทนแต่ละรอบ) ---
export const RETURN_TABLE: Record<string, number[]> = {
  // [round1, round2, round3, round4, round5, round6]
  zoomzoom:   [15, -15, 25, -10, 30, -8],
  robosnack:  [5,   8, 10,  -8,  3, -3],
  megafun:    [8,  20, 12,  -5, 15, -10],
  greenpower: [3,  -5, 15,  20, -5, -5],
  piggybank:  [2,   1,  2,   2,  1,  3],
  safegold:   [6,  -3, 12,  -3,  8, -2],
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
// สุ่มไม่ซ้ำ (seed จาก room_id) แต่ละรอบได้ 2 ข้อ
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
// ทุกคนในห้องเดียวกันจะได้ข้อเดียวกันทุกรอบ
// ห้องใหม่ = ลำดับต่างกัน
export function getQuizForRound(roomId: string, round: number): typeof QUIZ_POOL[number][] {
  // Simple hash from roomId string → number
  let hash = 0;
  for (let i = 0; i < roomId.length; i++) {
    hash = ((hash << 5) - hash) + roomId.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }

  // Seeded shuffle ของ quiz pool
  const shuffled = [...QUIZ_POOL];
  const seed = Math.abs(hash);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) + i * 7) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // รอบ 1 = ข้อ 0-1, รอบ 2 = ข้อ 2-3, ...
  const startIndex = (round - 1) * 2;
  return shuffled.slice(startIndex, startIndex + 2);
}

// --- Round News (ข่าว 3 ข่าวต่อรอบ: จริง 1 + มั่ว 2) ---
// ✅ B8: ข่าวสอดคล้องกับ EVENTS + RETURN_TABLE
// ข่าวจริง = hint ชี้ทางถูก / ข่าวมั่ว = ชี้ผิดทาง
// ปรับข่าว + return table ทั้งชุดใน B12 (polish)
export const ROUND_NEWS: {
  round: number;
  news: {
    text: string;
    isReal: boolean;
    emoji: string;
  }[];
}[] = [
  {
    // รอบ 1: iPhone ใหม่ขายดี! → เทค +15%
    round: 1,
    news: [
      { text: 'Apple เตรียมเปิดตัว iPhone รุ่นใหม่ คาดหุ้นเทคพุ่ง', isReal: true, emoji: '📱' },
      { text: 'บริษัทพลังงานกำลังจะล้มละลาย!', isReal: false, emoji: '⚡' },
      { text: 'ธนาคารจะลดดอกเบี้ยเหลือ 0%', isReal: false, emoji: '🏦' },
    ],
  },
  {
    // รอบ 2: โรคระบาด! → เกม +20%, อาหาร +8%, เทค -15%
    round: 2,
    news: [
      { text: 'โรคระบาดใหม่แพร่กระจาย คนอยู่บ้านเล่นเกม+สั่งอาหาร', isReal: true, emoji: '🦠' },
      { text: 'บริษัทเทคเตรียมเปิดตัวสินค้าใหม่สุดล้ำ!', isReal: false, emoji: '🚀' },
      { text: 'ทองคำจะราคาตก 50%!', isReal: false, emoji: '🪙' },
    ],
  },
  {
    // รอบ 3: เศรษฐกิจฟื้นตัว! → ทุกตัวบวก เทค +25%
    round: 3,
    news: [
      { text: 'วัคซีนสำเร็จ! เศรษฐกิจฟื้นตัวทุกอุตสาหกรรม', isReal: true, emoji: '💉' },
      { text: 'รัฐบาลจะขึ้นภาษีบริษัทเทค 50%!', isReal: false, emoji: '📋' },
      { text: 'ฝากเงินปีนี้ได้ดอกเบี้ย 20%!', isReal: false, emoji: '🤑' },
    ],
  },
  {
    // รอบ 4: สงคราม น้ำมันแพง! → พลังงาน +20%, เทค -10%
    round: 4,
    news: [
      { text: 'เกิดสงคราม น้ำมันราคาพุ่ง บริษัทพลังงานได้กำไร', isReal: true, emoji: '⛽' },
      { text: 'บริษัทเกมเตรียมออกเกมใหม่สุดฮิต!', isReal: false, emoji: '🎮' },
      { text: 'ร้านอาหารหุ่นยนต์จะขยาย 100 สาขา!', isReal: false, emoji: '🤖' },
    ],
  },
  {
    // รอบ 5: AI บูม! → เทค +30%, เกม +15%
    round: 5,
    news: [
      { text: 'ChatGPT รุ่นใหม่สุดล้ำ บริษัท AI และเกมกำไรมหาศาล', isReal: true, emoji: '🤖' },
      { text: 'พลังงานสะอาดได้ทุนจาก AI ช่วยลดต้นทุน', isReal: false, emoji: '☀️' },
      { text: 'ทุกกองทุนรวมการันตีกำไร 30%!', isReal: false, emoji: '📈' },
    ],
  },
  {
    // รอบ 6: ขึ้นดอกเบี้ย! → ฝาก +3%, เทค -8%
    round: 6,
    news: [
      { text: 'แบงก์ชาติขึ้นดอกเบี้ย ฝากเงินคุ้มขึ้น หุ้นกู้เงินแพง', isReal: true, emoji: '🏦' },
      { text: 'บริษัทเทคเตรียม IPO ใหม่ คาดหุ้นพุ่ง 50%!', isReal: false, emoji: '🚀' },
      { text: 'ทองคำจะขึ้นราคา 3 เท่า!', isReal: false, emoji: '🪙' },
    ],
  },
];
