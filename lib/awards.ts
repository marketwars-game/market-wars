// FILE: lib/awards.ts — Awards calculation logic for Final Summary
// VERSION: B15-v1 — Quiz Master: show all players with top score (no tiebreak)
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B11 created | B13-BATCH2 chance card replaces duel

import { STARTING_MONEY, TOTAL_ROUNDS, COMPANIES } from './constants';

// ==============================================
// Award Types
// ==============================================

export interface Award {
  id: string;
  name: string;       // ชื่อรางวัล
  emoji: string;      // emoji แสดงบน UI
  lesson: string;     // บทเรียนที่สอน (MC ใช้อธิบาย)
  winnerId: string | null;
  winnerName: string;
  stat: string;       // สถิติที่แสดง เช่น "10/12 correct"
  // ✅ B15: หลายคนได้รางวัลพร้อมกัน (quiz_master)
  winnerIds?: string[];
  winnerNames?: string[];
  // MC detail: portfolio breakdown ทุกรอบ (สำหรับนักลงทุนรอบคอบ)
  portfolioBreakdown?: { round: number; allocations: Record<string, number> }[];
}

// ==============================================
// Quiz Master — นักวิจัยยอดเยี่ยม 🧠
// เกณฑ์: quiz_score สูงสุดสะสม 6 รอบ
// ✅ B15: ถ้าหลายคนได้ score สูงสุดเท่ากัน → แสดงทุกคน (ไม่มี tiebreak)
// ==============================================

function calcQuizMaster(players: any[]): Award {
  const totalQuestions = TOTAL_ROUNDS * 2;

  const candidates = players.map((p) => ({
    id: p.id,
    name: p.name,
    quizScore: parseFloat(p.quiz_score) || 0,
  }));

  const topScore = Math.max(...candidates.map((c) => c.quizScore), 0);

  if (topScore === 0) {
    return {
      id: 'quiz_master',
      name: 'นักวิจัยยอดเยี่ยม',
      emoji: '🧠',
      lesson: 'ความรู้ = เงิน — ยิ่งตอบ quiz ถูกมาก ยิ่งได้ bonus เงินมากกว่าคนอื่น',
      winnerId: null,
      winnerName: 'ไม่มีผู้ชนะ',
      stat: '',
      winnerIds: [],
      winnerNames: [],
    };
  }

  // ✅ B15: ทุกคนที่ได้ score สูงสุดได้รางวัลร่วมกัน
  const winners = candidates.filter((c) => c.quizScore === topScore);

  return {
    id: 'quiz_master',
    name: 'นักวิจัยยอดเยี่ยม',
    emoji: '🧠',
    lesson: 'ความรู้ = เงิน — ยิ่งตอบ quiz ถูกมาก ยิ่งได้ bonus เงินมากกว่าคนอื่น',
    winnerId: winners[0].id,
    winnerName: winners.length === 1 ? winners[0].name : winners.map((w) => w.name).join(', '),
    stat: `${topScore}/${totalQuestions} ข้อ`,
    winnerIds: winners.map((w) => w.id),
    winnerNames: winners.map((w) => w.name),
  };
}

// ==============================================
// Smart Diversifier — นักลงทุนรอบคอบ 🛡️
// Filter 1: avg max allocation ≤ 40%
// Filter 2: จบเกมด้วยกำไร (money > STARTING_MONEY)
// Rank: avg max allocation ต่ำสุด
// Tiebreak 1: จำนวนหุ้นเฉลี่ย (มากกว่า)
// Tiebreak 2: total return สูงกว่า
// Fallback: ถ้าไม่มีใครผ่าน filter → ผ่อนเงื่อนไข
// ==============================================

interface DiversifierCandidate {
  id: string;
  name: string;
  money: number;
  avgMaxAlloc: number;     // เฉลี่ย max allocation 6 รอบ
  avgStockCount: number;   // เฉลี่ยจำนวนหุ้นที่ลง
  totalReturn: number;     // กำไร/ขาดทุนรวม
  portfolioBreakdown: { round: number; allocations: Record<string, number> }[];
}

function calcDiversifier(players: any[]): Award {
  const candidates: DiversifierCandidate[] = players.map((p) => {
    const rr = p.round_returns || {};
    let totalMaxAlloc = 0;
    let totalStockCount = 0;
    let roundsCounted = 0;
    const breakdown: { round: number; allocations: Record<string, number> }[] = [];

    for (let r = 1; r <= TOTAL_ROUNDS; r++) {
      const roundData = rr[String(r)];
      const portfolio = roundData?.portfolio_used;
      if (!portfolio) continue;

      roundsCounted++;

      // คำนวณ max allocation ของรอบนี้
      const allocValues = COMPANIES.map((c) => parseFloat(portfolio[c.id]) || 0);
      const maxAlloc = Math.max(...allocValues, 0);
      totalMaxAlloc += maxAlloc;

      // จำนวนหุ้นที่ลง (ไม่ใช่ 0%)
      const stockCount = allocValues.filter((v) => v > 0).length;
      totalStockCount += stockCount;

      // เก็บ breakdown สำหรับ MC
      const allocs: Record<string, number> = {};
      COMPANIES.forEach((c) => {
        const val = parseFloat(portfolio[c.id]) || 0;
        if (val > 0) allocs[c.name] = val;
      });
      breakdown.push({ round: r, allocations: allocs });
    }

    const avgMaxAlloc = roundsCounted > 0 ? totalMaxAlloc / roundsCounted : 100;
    const avgStockCount = roundsCounted > 0 ? totalStockCount / roundsCounted : 0;
    const money = parseFloat(p.money) || 0;

    return {
      id: p.id,
      name: p.name,
      money,
      avgMaxAlloc,
      avgStockCount,
      totalReturn: money - STARTING_MONEY,
      portfolioBreakdown: breakdown,
    };
  });

  // Sort function
  const sortCandidates = (list: DiversifierCandidate[]) =>
    list.sort((a, b) => {
      // Primary: avg max allocation ต่ำสุด
      if (a.avgMaxAlloc !== b.avgMaxAlloc) return a.avgMaxAlloc - b.avgMaxAlloc;
      // Tiebreak 1: จำนวนหุ้นเฉลี่ย (มากกว่า)
      if (b.avgStockCount !== a.avgStockCount) return b.avgStockCount - a.avgStockCount;
      // Tiebreak 2: total return สูงกว่า
      return b.totalReturn - a.totalReturn;
    });

  // Try strict filter: avg max ≤ 40% AND กำไร
  let filtered = candidates.filter((c) => c.avgMaxAlloc <= 40 && c.money > STARTING_MONEY);
  if (filtered.length > 0) {
    sortCandidates(filtered);
    const w = filtered[0];
    return makeDiversifierAward(w);
  }

  // Fallback 1: ตัดเงื่อนไขกำไร ใช้แค่ avg max ≤ 40%
  filtered = candidates.filter((c) => c.avgMaxAlloc <= 40);
  if (filtered.length > 0) {
    sortCandidates(filtered);
    const w = filtered[0];
    return makeDiversifierAward(w);
  }

  // Fallback 2: ขยาย threshold เป็น ≤ 50%
  filtered = candidates.filter((c) => c.avgMaxAlloc <= 50);
  if (filtered.length > 0) {
    sortCandidates(filtered);
    const w = filtered[0];
    return makeDiversifierAward(w);
  }

  // Fallback 3: ใช้คนที่ avg max ต่ำสุดเลย (ไม่มี filter)
  sortCandidates(candidates);
  if (candidates.length > 0) {
    const w = candidates[0];
    return makeDiversifierAward(w);
  }

  return {
    id: 'smart_diversifier',
    name: 'นักลงทุนรอบคอบ',
    emoji: '🛡️',
    lesson: 'กระจายความเสี่ยง = รอดดีที่สุด — อย่าใส่ไข่ทุกฟองในตะกร้าใบเดียว',
    winnerId: null,
    winnerName: 'ไม่มีผู้ชนะ',
    stat: '',
  };
}

function makeDiversifierAward(w: DiversifierCandidate): Award {
  return {
    id: 'smart_diversifier',
    name: 'นักลงทุนรอบคอบ',
    emoji: '🛡️',
    lesson: 'กระจายความเสี่ยง = รอดดีที่สุด — อย่าใส่ไข่ทุกฟองในตะกร้าใบเดียว',
    winnerId: w.id,
    winnerName: w.name,
    stat: `เฉลี่ยลง ${w.avgStockCount.toFixed(1)} หุ้น/รอบ (max ${w.avgMaxAlloc.toFixed(0)}%)`,
    portfolioBreakdown: w.portfolioBreakdown,
  };
}

// ==============================================
// Main: คำนวณ awards ทั้งหมด
// ==============================================

export function calculateAwards(players: any[]): Award[] {
  return [
    calcQuizMaster(players),
    calcDiversifier(players),
  ];
}

// ==============================================
// Helper: เช็คว่า player ได้ award ไหม
// ==============================================

export function getPlayerAwards(playerId: string, awards: Award[]): Award[] {
  return awards.filter((a) =>
    a.winnerId === playerId ||
    (a.winnerIds && a.winnerIds.includes(playerId))
  );
}

// ==============================================
// ✅ B13: Player stats สำหรับ FinalView — เปลี่ยน duel → chance card
// ==============================================

export interface PlayerStats {
  quizCorrect: number;
  quizTotal: number;
  chanceTotal: number;   // รวม chance card money ทุกรอบ
  chanceBest: number;    // max single card amount
  chanceWorst: number;   // min single card amount
}

export function calcPlayerStats(player: any): PlayerStats {
  const quizCorrect = parseFloat(player.quiz_score) || 0;
  const quizTotal = TOTAL_ROUNDS * 2; // 2 ข้อต่อรอบ

  // ✅ B13: Chance card stats — ใช้ duel_money_change ปัจจุบัน (เป็นค่าของรอบล่าสุด)
  // ในอนาคตถ้าอยากเก็บทุกรอบ ต้องเก็บใน round_returns
  // ตอนนี้ใช้ current duel_money_change เป็น chanceTotal (ประมาณ)
  const currentChance = parseFloat(player.duel_money_change) || 0;

  return {
    quizCorrect,
    quizTotal,
    chanceTotal: currentChance, // simplified: แสดงรอบล่าสุด
    chanceBest: currentChance > 0 ? currentChance : 0,
    chanceWorst: currentChance < 0 ? currentChance : 0,
  };
}
