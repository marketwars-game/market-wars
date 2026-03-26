// FILE: lib/game-engine.ts — State Machine + Room Code Generator
// VERSION: B12-UX-v1 — year_intro + market_open + step group helpers
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B1 created | B3 state machine | B4 fix phase flow | B5 event_result | B8 research_reveal + news_feed | B9 attack_result | B10 disable golden deal | B12-UX year_intro + market_open + step groups

import { ROOM_CODE_CONFIG, GOLDEN_DEAL_ROUNDS, TOTAL_ROUNDS, STEP_GROUPS } from './constants';

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
// ✅ B12-UX: เพิ่ม year_intro (หัวรอบ) + market_open (กลางรอบ หลัง attack_result ก่อน event)
//
// ทุกรอบ: year_intro → research → research_reveal → news_feed → invest/rebalance → attack → attack_result → market_open → event → event_result → results → leaderboard
// รอบ 6: ... → results → leaderboard → final
export function getPhaseOrder(round: number): string[] {
  // รอบ 1 ใช้ invest (เริ่มจาก 0%), รอบ 2+ ใช้ rebalance (prefill จากรอบก่อน)
  const investPhase = round === 1 ? 'invest' : 'rebalance';

  // ✅ B12-UX: year_intro เป็น phase แรก, market_open หลัง attack_result ก่อน event
  const phases = ['year_intro', 'research', 'research_reveal', 'news_feed', investPhase, 'attack', 'attack_result', 'market_open', 'event', 'event_result'];

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

  // ✅ B12-UX: จาก lobby → year_intro (แทน research)
  if (currentPhase === 'lobby') {
    return { phase: 'year_intro', round: 1, status: 'playing' };
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

  // ✅ B12-UX: ถ้าอยู่ที่ leaderboard (phase สุดท้ายของรอบ) → ขึ้นรอบใหม่ที่ year_intro
  if (currentPhase === 'leaderboard') {
    return {
      phase: 'year_intro',
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

// ==============================================
// ✅ B12-UX: Step Group Helpers — สำหรับ step indicator
// ==============================================

// บอกว่า phase ปัจจุบันอยู่ step group ไหน (return group id หรือ null ถ้าไม่อยู่ในกลุ่มไหน)
export function getCurrentStepGroup(phase: string): string | null {
  for (const group of STEP_GROUPS) {
    if (group.phases.includes(phase)) {
      return group.id;
    }
  }
  return null;
}

// คำนวณ progress ของ step indicator
// return array of { id, icon, label, status: 'done' | 'current' | 'upcoming' }
export function getStepGroupProgress(phase: string): { id: string; icon: string; label: string; status: 'done' | 'current' | 'upcoming' }[] {
  const currentGroupId = getCurrentStepGroup(phase);
  let foundCurrent = false;

  return STEP_GROUPS.map((group) => {
    if (group.id === currentGroupId) {
      foundCurrent = true;
      return { ...group, status: 'current' as const };
    }
    if (!foundCurrent) {
      return { ...group, status: 'done' as const };
    }
    return { ...group, status: 'upcoming' as const };
  });
}
