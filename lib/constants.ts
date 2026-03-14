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
// ลำดับ phase ในแต่ละรอบ (Golden Deal อยู่หลัง event ก่อน results)
export const GAME_PHASES = [
  'lobby',       // ก่อนเริ่มเกม
  'research',    // ตอบ quiz ปลดล็อกข่าว
  'invest',      // เลือกลงทุน 6 บริษัท
  'attack',      // เลือก โจมตี/ป้องกัน/สอดแนม
  'event',       // MC เปิดข่าวเหตุการณ์
  'golden_deal', // ดีลพิเศษ (เฉพาะรอบ 2, 4, 6)
  'results',     // ผลตอบแทนรอบนี้
  'leaderboard', // อันดับ 1-20
  'rebalance',   // ปรับพอร์ตก่อนรอบถัดไป
  'final',       // สรุปจบเกม
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
    playerMessage: 'Answer 2 quiz questions to unlock real news!',
    mcTip: 'Wait for players to finish the quiz, then press Next',
    hasTimer: true,
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
    mcTip: 'Read the event aloud and explain the impact! Press Next when done.',
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
    icon: '📊',
    displayMessage: 'Calculating returns...',
    playerMessage: 'See your returns this round!',
    mcTip: 'Let players react to their results. Press Next for leaderboard.',
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
export const EVENTS = [
  {
    round: 1,
    title: 'iPhone ใหม่ขายดี!',
    emoji: '📱',
    description: 'Apple เปิดตัว iPhone รุ่นใหม่ ยอดขายทะลุเป้า หุ้นเทคพุ่ง!',
  },
  {
    round: 2,
    title: 'โรคระบาดทั่วโลก!',
    emoji: '🦠',
    description: 'โรคระบาดครั้งใหญ่ คนอยู่บ้าน ธุรกิจออนไลน์บูม แต่ร้านอาหารรอด!',
  },
  {
    round: 3,
    title: 'เศรษฐกิจฟื้นตัว!',
    emoji: '📈',
    description: 'วัคซีนมาแล้ว! เศรษฐกิจเริ่มกลับมา ทุกอุตสาหกรรมฟื้นตัว',
  },
  {
    round: 4,
    title: 'สงคราม น้ำมันแพง!',
    emoji: '⛽',
    description: 'เกิดสงคราม น้ำมันราคาพุ่ง บริษัทพลังงานได้กำไร แต่ที่เหลือลำบาก',
  },
  {
    round: 5,
    title: 'AI บูม! เทคพุ่ง!',
    emoji: '🤖',
    description: 'AI ปฏิวัติโลก! บริษัทเทคกำไรมหาศาล ทุกคนอยากลงทุนเทค',
  },
  {
    round: 6,
    title: 'ขึ้นดอกเบี้ย!',
    emoji: '🏦',
    description: 'ธนาคารกลางขึ้นดอกเบี้ย หุ้นทุกตัวชะลอ แต่ฝากเงินได้ดอกเบี้ยดี',
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
