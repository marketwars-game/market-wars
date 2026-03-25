// FILE: lib/game-engine.ts — State Machine + Room Code Generator
// VERSION: B8-v2 — เพิ่ม research_reveal + news_feed phases
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B1 created | B3 state machine | B4 fix phase flow | B5 event_result | B8 research_reveal + news_feed

import { ROOM_CODE_CONFIG, GOLDEN_DEAL_ROUNDS, TOTAL_ROUNDS } from './constants';

// ==============================================
// Room Code Generator
// ==============================================
export function generateRoomCode(): string {
  const { characters, length } = ROOM_CODE_CONFIG;
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// ==============================================
// Phase State Machine
// ==============================================

// Phase order สำหรับรอบที่กำหนด
// ✅ B8: เพิ่ม research_reveal (เฉลย quiz) + news_feed (ข่าวรอบนี้)
//
// รอบ 1: research → research_reveal → news_feed → invest → attack → event → event_result → results → leaderboard
// รอบ 2-5: research → research_reveal → news_feed → rebalance → attack → event → event_result → [golden_deal] → results → leaderboard
// รอบ 6: research → research_reveal → news_feed → rebalance → attack → event → event_result → golden_deal → results → leaderboard → final
export function getPhaseOrder(round: number): string[] {
  // รอบ 1 ใช้ invest (เริ่มจาก 0%), รอบ 2+ ใช้ rebalance (prefill จากรอบก่อน)
  const investPhase = round === 1 ? 'invest' : 'rebalance';

  // ✅ B8: research → research_reveal → news_feed → invest/rebalance
  const phases = ['research', 'research_reveal', 'news_feed', investPhase, 'attack', 'event', 'event_result'];

  // เพิ่ม Golden Deal ถ้าเป็นรอบ 2, 4, 6
  if (GOLDEN_DEAL_ROUNDS.includes(round)) {
    phases.push('golden_deal');
  }

  phases.push('results', 'leaderboard');

  // รอบสุดท้ายไปจบที่ final
  if (round >= TOTAL_ROUNDS) {
    phases.push('final');
  }

  return phases;
}

// คำนวณ phase ถัดไป
// return null ถ้าไม่มี phase ถัดไป (เกมจบแล้ว)
export function getNextPhase(
  currentPhase: string,
  currentRound: number,
): { phase: string; round: number; status: string } | null {

  // จาก lobby → เริ่มเกม
  if (currentPhase === 'lobby') {
    return { phase: 'research', round: 1, status: 'playing' };
  }

  // ถ้าอยู่ที่ final แล้ว → ไม่มี next
  if (currentPhase === 'final') {
    return null;
  }

  const order = getPhaseOrder(currentRound);
  const currentIndex = order.indexOf(currentPhase);

  // ถ้าหา phase ปัจจุบันไม่เจอใน order (ไม่ควรเกิด)
  if (currentIndex === -1) {
    return null;
  }

  // ยังไม่ถึง phase สุดท้ายของรอบ → เลื่อนไป phase ถัดไป
  if (currentIndex < order.length - 1) {
    const nextPhase = order[currentIndex + 1];
    return {
      phase: nextPhase,
      round: currentRound,
      status: nextPhase === 'final' ? 'finished' : 'playing',
    };
  }

  // ถ้าอยู่ที่ leaderboard (phase สุดท้ายของรอบ) → ขึ้นรอบใหม่
  if (currentPhase === 'leaderboard') {
    return {
      phase: 'research',
      round: currentRound + 1,
      status: 'playing',
    };
  }

  // ไม่ควรมาถึงจุดนี้
  return null;
}

// ดึงรายการ phase ทั้งหมดของเกม (ใช้สำหรับ progress bar)
export function getAllGameSteps(): { round: number; phase: string }[] {
  const steps: { round: number; phase: string }[] = [];
  for (let r = 1; r <= TOTAL_ROUNDS; r++) {
    const phases = getPhaseOrder(r);
    phases.forEach((p) => steps.push({ round: r, phase: p }));
  }
  return steps;
}
