// ===========================
// Market Wars — Game Engine
// ===========================
// Core calculation logic (to be expanded in Phase B)

import { RETURN_TABLE, STARTING_MONEY } from "./constants";
import type { CompanyId } from "./constants";

type Portfolio = Partial<Record<CompanyId, number>>; // company_id → percentage (0-100)

/**
 * Calculate a player's return for a given round
 * @param portfolio - { company_id: percentage }
 * @param round - 1-6
 * @returns return percentage (weighted average)
 */
export function calculateReturn(portfolio: Portfolio, round: number): number {
  const roundIndex = round - 1;
  let totalReturn = 0;

  for (const [companyId, percentage] of Object.entries(portfolio)) {
    const returns = RETURN_TABLE[companyId];
    if (returns && percentage) {
      totalReturn += (returns[roundIndex] * percentage) / 100;
    }
  }

  return totalReturn;
}

/**
 * Apply return to money amount
 */
export function applyReturn(
  money: number,
  returnPct: number,
  wasAttacked: boolean,
  attackBlocked: boolean
): number {
  let finalReturn = returnPct;

  // Attack multiplier: if losing money and attacked (not blocked), loss x1.5
  if (wasAttacked && !attackBlocked && returnPct < 0) {
    finalReturn = returnPct * 1.5;
  }

  const newMoney = Math.round(money * (1 + finalReturn / 100));
  return Math.max(0, newMoney); // Can't go below 0
}

/**
 * Generate a 4-character room code
 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // No I or O (confusing)
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
