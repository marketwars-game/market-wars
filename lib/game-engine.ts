// =============================================
// Market Wars — Game Engine
// คำนวณผลตอบแทน, สร้าง Room Code, utility functions
// =============================================

import { ROOM_CODE_CONFIG } from './constants';

/**
 * สร้าง Room Code 4 ตัวอักษร (ไม่รวม O, I, L)
 * เช่น "MKTW", "ABCD", "XYZH"
 */
export function generateRoomCode(): string {
  const { chars, length } = ROOM_CODE_CONFIG;
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * คำนวณ weighted return จาก portfolio
 * portfolio = { robosnack: 30, zoomzoom: 70 } (%)
 * returns = { robosnack: 5, zoomzoom: 15 } (%)
 * result = (30*5 + 70*15) / 100 = 12%
 */
export function calculatePortfolioReturn(
  portfolio: Record<string, number>,
  returns: Record<string, number>
): number {
  let totalReturn = 0;
  for (const [companyId, allocation] of Object.entries(portfolio)) {
    const companyReturn = returns[companyId] ?? 0;
    totalReturn += (allocation / 100) * companyReturn;
  }
  return Math.round(totalReturn * 100) / 100; // ปัดทศนิยม 2 ตำแหน่ง
}

/**
 * คำนวณเงินหลังจากได้ผลตอบแทน
 */
export function calculateMoneyAfterReturn(
  money: number,
  returnPct: number
): number {
  return Math.round(money * (1 + returnPct / 100));
}

/**
 * ใช้ Attack multiplier
 * ถ้าถูกโจมตีและขาดทุน → ขาดทุน x multiplier
 */
export function applyAttackMultiplier(
  returnPct: number,
  wasAttacked: boolean,
  attackBlocked: boolean,
  multiplier: number
): number {
  if (wasAttacked && !attackBlocked && returnPct < 0) {
    return returnPct * multiplier;
  }
  return returnPct;
}