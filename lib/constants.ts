// ===========================
// Market Wars — Game Constants
// ===========================
// Source: Tech Spec v0.3, Section 4

export const STARTING_MONEY = 10000;
export const TOTAL_ROUNDS = 6;
export const ALLOCATION_STEP = 10; // ทีละ 10%

// 6 Simulated Companies
export const COMPANIES = [
  { id: "robosnack", name: "RoboSnack", type: "Food & Bev", risk: "Medium", color: "#FF6B6B", emoji: "🍔" },
  { id: "zoomzoom", name: "ZoomZoom", type: "Tech / EV", risk: "High", color: "#00D4FF", emoji: "🚗" },
  { id: "megafun", name: "MegaFun", type: "Gaming", risk: "High", color: "#A855F7", emoji: "🎮" },
  { id: "greenpower", name: "GreenPower", type: "Energy", risk: "Med-High", color: "#22C55E", emoji: "⚡" },
  { id: "piggybank", name: "PiggyBank+", type: "Savings", risk: "Very Low", color: "#F59E0B", emoji: "🐷" },
  { id: "safegold", name: "SafeGold Fund", type: "Fund", risk: "Medium", color: "#EC4899", emoji: "🏆" },
] as const;

// 6-Round Return Table (%)
// Index 0 = Round 1, Index 5 = Round 6
export const RETURN_TABLE: Record<string, number[]> = {
  zoomzoom:   [15, -15,  25, -10,  30,  -8],  // Tech — volatile
  robosnack:  [ 5,   8,  10,  -8,   3,  -3],  // Food — stable
  megafun:    [ 8,  20,  12,  -5,  15, -10],  // Gaming — boom/bust
  greenpower: [ 3,  -5,  15,  20,  -5,  -5],  // Energy — sway with oil
  piggybank:  [ 2,   1,   2,   2,   1,   3],  // Savings — safe & slow
  safegold:   [ 6,  -3,  12,  -3,   8,  -2],  // Fund — moderate
};

// Event descriptions per round
export const ROUND_EVENTS = [
  { round: 1, title: "iPhone ใหม่ขายดี!", description: "เทคโนโลยีบูม ทุกคนแห่ซื้อมือถือใหม่" },
  { round: 2, title: "โรคระบาดทั่วโลก!", description: "คนอยู่บ้าน เล่นเกมเพิ่ม แต่ธุรกิจอื่นซบเซา" },
  { round: 3, title: "เศรษฐกิจฟื้นตัว!", description: "ทุกอย่างกลับมาเติบโต คนออกมาใช้จ่าย" },
  { round: 4, title: "สงคราม น้ำมันแพง!", description: "พลังงานขึ้น แต่ธุรกิจอื่นลำบาก" },
  { round: 5, title: "AI บูม! เทคพุ่ง!", description: "AI เปลี่ยนโลก บริษัทเทคทำกำไรมหาศาล" },
  { round: 6, title: "ขึ้นดอกเบี้ย!", description: "แบงก์ชาติขึ้นดอกเบี้ย เงินฝากได้เปรียบ หุ้นร่วง" },
];

// Golden Deals (Rounds 2, 4, 6)
export const GOLDEN_DEALS = [
  { round: 2, name: "IPO SpaceThai", expected: "+15-25%", actual: 20, lesson: "ดีลพิเศษมีจริง" },
  { round: 4, name: "AI Revolution Fund", expected: "+12-18%", actual: 15, lesson: "ย้ำความเชื่อมั่น" },
  { round: 6, name: 'Crypto SuperCoin "การันตี +30%!"', expected: "+30%", actual: -20, lesson: "ถ้าดีเกินจริง มักไม่จริง!" },
];

// Game phases in order
export const PHASES = [
  "research",
  "invest",
  "attack",
  "event",
  "leaderboard",
  "rebalance",
  "golden_deal",
] as const;

export type Phase = (typeof PHASES)[number];
export type CompanyId = (typeof COMPANIES)[number]["id"];
