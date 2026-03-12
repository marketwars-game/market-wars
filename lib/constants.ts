// =============================================
// Market Wars — Game Configuration
// Single Source of Truth (ไม่ hardcode ตัวเลขที่อื่น)
// =============================================

// --- Room Config ---
export const ROOM_CODE_CONFIG = {
  length: 4,
  // ไม่รวม O, I, L เพราะอ่านสับสนกับ 0, 1
  chars: 'ABCDEFGHJKMNPQRSTUVWXYZ',
} as const;

// --- Game Config ---
export const MAX_PLAYERS = 20;
export const TOTAL_ROUNDS = 6;
export const STARTING_MONEY = 10000;
export const ALLOCATION_STEP = 10; // ทีละ 10%

// --- Phase Flow ---
// MC กดเปลี่ยน phase ตามลำดับนี้
export const GAME_PHASES = [
  'lobby',        // รอเด็กเข้า
  'research',     // ตอบ quiz ปลดล็อกข่าว
  'invest',       // เลือกลงทุน
  'attack',       // เลือก Attack/Defend/Spy
  'event',        // Display แสดงข่าว
  'results',      // แสดงผลตอบแทน
  'leaderboard',  // แสดงอันดับ
  'golden_deal',  // รอบ 2, 4, 6 เท่านั้น
  'rebalance',    // ปรับพอร์ตก่อนรอบถัดไป
  'final',        // จบเกม
] as const;

export type GamePhase = typeof GAME_PHASES[number];

// --- Room Status ---
export type RoomStatus = 'lobby' | 'playing' | 'finished';

// --- Companies ---
export interface Company {
  id: string;
  name: string;
  type: string;
  risk: string;
  color: string;
  icon: string; // MVP: emoji, อนาคต: image path
  description: string;
}

export const COMPANIES: Company[] = [
  {
    id: 'robosnack',
    name: 'RoboSnack',
    type: 'Food & Bev',
    risk: 'Medium',
    color: '#FF6B6B',
    icon: '🍔',
    description: 'เครือร้านอาหาร fast food + หุ่นยนต์เสิร์ฟ',
  },
  {
    id: 'zoomzoom',
    name: 'ZoomZoom',
    type: 'Tech / EV',
    risk: 'High',
    color: '#00D4FF',
    icon: '🚗',
    description: 'รถยนต์ไฟฟ้า + self-driving',
  },
  {
    id: 'megafun',
    name: 'MegaFun',
    type: 'Gaming',
    risk: 'High',
    color: '#A855F7',
    icon: '🎮',
    description: 'บริษัทเกมระดับโลก + esports',
  },
  {
    id: 'greenpower',
    name: 'GreenPower',
    type: 'Energy',
    risk: 'Med-High',
    color: '#22C55E',
    icon: '⚡',
    description: 'พลังงานแสงอาทิตย์ + แบตเตอรี่',
  },
  {
    id: 'piggybank',
    name: 'PiggyBank+',
    type: 'Savings',
    risk: 'Very Low',
    color: '#F59E0B',
    icon: '🐷',
    description: 'บัญชีออมทรัพย์ดอกเบี้ยสูง ปลอดภัยมาก',
  },
  {
    id: 'safegold',
    name: 'SafeGold Fund',
    type: 'Fund',
    risk: 'Medium',
    color: '#EC4899',
    icon: '💎',
    description: 'กองทุนรวม กระจายลงทุนหลายบริษัท',
  },
];

// --- 6-Round Return Table (%) ---
// [round][company_id] = return percentage
export const RETURN_TABLE: Record<number, Record<string, number>> = {
  1: { zoomzoom: 15, robosnack: 5, megafun: 8, greenpower: 3, piggybank: 2, safegold: 6 },
  2: { zoomzoom: -15, robosnack: 8, megafun: 20, greenpower: -5, piggybank: 1, safegold: -3 },
  3: { zoomzoom: 25, robosnack: 10, megafun: 12, greenpower: 15, piggybank: 2, safegold: 12 },
  4: { zoomzoom: -10, robosnack: -8, megafun: -5, greenpower: 20, piggybank: 2, safegold: -3 },
  5: { zoomzoom: 30, robosnack: 3, megafun: 15, greenpower: -5, piggybank: 1, safegold: 8 },
  6: { zoomzoom: -8, robosnack: -3, megafun: -10, greenpower: -5, piggybank: 3, safegold: -2 },
};

// --- Events (แสดงบน Display ทุกรอบ) ---
export interface GameEvent {
  round: number;
  title: string;
  description: string;
  icon: string;
}

export const EVENTS: GameEvent[] = [
  { round: 1, title: 'iPhone ใหม่ขายดี!', description: 'Apple เปิดตัว iPhone รุ่นใหม่ขายหมดใน 3 วัน เทคโนโลยีบูม!', icon: '📱' },
  { round: 2, title: 'โรคระบาดทั่วโลก', description: 'ไวรัสใหม่ระบาดทั่วโลก คนอยู่บ้าน สั่งอาหารออนไลน์ เล่นเกมเพิ่ม', icon: '🦠' },
  { round: 3, title: 'เศรษฐกิจฟื้นตัว!', description: 'โรคระบาดจบ คนออกมาใช้เงิน เศรษฐกิจกลับมาเติบโต', icon: '📈' },
  { round: 4, title: 'สงคราม น้ำมันแพง', description: 'เกิดสงครามในตะวันออกกลาง น้ำมันแพงขึ้น 2 เท่า พลังงานทางเลือกได้ประโยชน์', icon: '⛽' },
  { round: 5, title: 'AI บูม! เทคพุ่ง', description: 'AI ปฏิวัติทุกอุตสาหกรรม บริษัทเทคโตระเบิด!', icon: '🤖' },
  { round: 6, title: 'ขึ้นดอกเบี้ย', description: 'ธนาคารกลางขึ้นดอกเบี้ย หุ้นลงทั่วกระดาน แต่เงินฝากได้ดอกเบี้ยเพิ่ม', icon: '🏦' },
];

// --- Golden Deals (รอบ 2, 4, 6) ---
export interface GoldenDeal {
  round: number;
  name: string;
  teaser: string;       // ข้อความล่อ
  actual_return: number; // % ผลตอบแทนจริง
  is_trap: boolean;
  lesson: string;
}

export const GOLDEN_DEALS: GoldenDeal[] = [
  {
    round: 2,
    name: 'IPO SpaceThai',
    teaser: 'บริษัทอวกาศไทยเข้าตลาด! คาด +15-25%',
    actual_return: 20,
    is_trap: false,
    lesson: 'ดีลพิเศษมีจริง ถ้าศึกษาดีๆ',
  },
  {
    round: 4,
    name: 'AI Revolution Fund',
    teaser: 'กองทุน AI ล้ำสมัย คาด +12-18%',
    actual_return: 15,
    is_trap: false,
    lesson: 'โอกาสดีๆ มีอยู่จริง ต้องกล้าคว้า',
  },
  {
    round: 6,
    name: 'Crypto SuperCoin',
    teaser: '🚨 การันตี +30%! โอกาสสุดท้าย!',
    actual_return: -20,
    is_trap: true,
    lesson: 'ถ้าดีเกินจริง มักไม่จริง!',
  },
];

export const GOLDEN_DEAL_ROUNDS = GOLDEN_DEALS.map((d) => d.round); // [2, 4, 6]

// --- Attack & Defend ---
export const ATTACK_MULTIPLIER = 1.5;

export type PlayerAction = 'attack' | 'defend' | 'spy';

// --- MC Tips (คำแนะนำ MC แต่ละ phase) ---
export const MC_TIPS: Record<string, string> = {
  lobby: 'รอเด็กเข้าห้องให้ครบ แล้วกด Start Game',
  research: 'เด็กกำลังตอบ quiz — รอจนทุกคนส่งคำตอบ',
  invest: 'เด็กกำลังเลือกลงทุน — เตือนว่าต้องแบ่งให้ครบ 100%',
  attack: 'เด็กกำลังเลือก Action — โจมตี/ป้องกัน/สอดแนม',
  event: 'กดเปิดเหตุการณ์ — อ่านข่าวให้เด็กฟัง ดูจอใหญ่ด้วยกัน',
  results: 'แสดงผลตอบแทน — ให้เด็กดูผลตัวเองบนมือถือ',
  leaderboard: 'แสดงอันดับ — สร้างบรรยากาศตื่นเต้น!',
  golden_deal: 'Golden Deal! — เปิด quiz ชิงสิทธิ์ดีลพิเศษ',
  rebalance: 'เด็กปรับพอร์ต — กด Next Round เมื่อพร้อม',
  final: 'จบเกม! — แสดงผลสรุป + รางวัล',
};