// FILE: lib/awards.ts — Awards calculation logic for Final Summary
// VERSION: B18-v1 — Quiz Master single-winner + speed tiebreak (compareQuizMaster); Smart Diversifier unchanged
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B11 created | B13-BATCH2 chance card replaces duel | B15 Quiz Master multi-winner | B16d Smart Diversifier decision-based | B18 Quiz Master single-winner + speed tiebreak

import { STARTING_MONEY, TOTAL_ROUNDS, COMPANIES } from './constants';
import { compareQuizMaster, speedKey } from './ranking';

// ==============================================
// Award Types
// ==============================================

export interface Award {
  id: string;
  name: string;       // ชื่อรางวัล (TH)
  nameEn?: string;    // ✅ B16d: ชื่อรางวัล (EN) — แสดงสองภาษาบนจอ Display
  emoji: string;      // emoji แสดงบน UI
  lesson: string;     // บทเรียนที่สอน (MC ใช้อธิบาย, TH)
  lessonEn?: string;  // ✅ B16d: บทเรียน (EN)
  winnerId: string | null;
  winnerName: string;
  stat: string;       // สถิติที่แสดง เช่น "10/12 correct"
  // ✅ B15: หลายคนได้รางวัลพร้อมกัน (quiz_master / เสมอเงินเป๊ะ)
  winnerIds?: string[];
  winnerNames?: string[];
  // MC detail: portfolio breakdown ทุกรอบ (สำหรับนักลงทุนกระจายความเสี่ยง)
  portfolioBreakdown?: { round: number; allocations: Record<string, number> }[];
}

// ==============================================
// Quiz Master — นักวิจัยยอดเยี่ยม 🧠
// เกณฑ์: quiz_score สูงสุดสะสม 6 รอบ
// ✅ B15: ถ้าหลายคนได้ score สูงสุดเท่ากัน → แสดงทุกคน (ไม่มี tiebreak)
// ==============================================

function calcQuizMaster(players: any[]): Award {
  const totalQuestions = TOTAL_ROUNDS * 2;

  const base = {
    id: 'quiz_master',
    name: 'นักวิจัยยอดเยี่ยม',
    nameEn: 'Top Researcher',
    emoji: '🧠',
    lesson: 'ความรู้ = เงิน — ยิ่งตอบ quiz ถูกมาก ยิ่งได้ bonus เงินมากกว่าคนอื่น',
    lessonEn: 'Knowledge pays — more correct answers, more bonus money',
  };

  const topScore = Math.max(...players.map((p) => parseFloat(p.quiz_score) || 0), 0);

  if (topScore === 0) {
    return { ...base, winnerId: null, winnerName: 'ไม่มีผู้ชนะ', stat: '', winnerIds: [], winnerNames: [] };
  }

  // ✅ B18: single winner — ตอบถูกมากสุด → เสมอ → เร็วสุด (ms น้อย) → เสมอ → id
  const topTied = players.filter((p) => (parseFloat(p.quiz_score) || 0) === topScore);
  const winner = [...topTied].sort(compareQuizMaster)[0];

  // "⚡ เร็วสุด" เฉพาะตอนความเร็วเป็นตัวตัดจริง (คะแนนเท่ากัน + winner เร็วกว่าอย่างน้อยหนึ่งคน)
  const speedWasDecider =
    topTied.length > 1 &&
    topTied.some((p) => p.id !== winner.id && speedKey(p.quiz_speed_ms) > speedKey(winner.quiz_speed_ms));

  return {
    ...base,
    winnerId: winner.id,
    winnerName: winner.name,
    stat: `${topScore}/${totalQuestions} ข้อ${speedWasDecider ? ' · ⚡ เร็วสุด' : ''}`,
    winnerIds: [winner.id],
    winnerNames: [winner.name],
  };
}

// ==============================================
// Smart Diversifier — นักลงทุนกระจายความเสี่ยง 🧺  (B16d: decision-based)
// "อย่าใส่ไข่ทั้งหมดในตะกร้าใบเดียว"
//
// เกณฑ์ต่อรอบ (วัดที่ "การตัดสินใจ" ไม่ใช่ผลลัพธ์):
//   • ลง ≥ MIN_SECTORS กลุ่ม (>0%)   และ
//   • ไม่ทุ่มเกิน MAX_SINGLE_PCT% ในกลุ่มเดียว
// ต้องผ่าน "ทุกรอบที่เล่นจริง" — รอบที่ไม่ submit = พอร์ตว่าง = ตกเกณฑ์รอบนั้น
// ผู้ชนะ: ในกลุ่มที่ผ่าน → เงินสูงสุด (เสมอเป๊ะ → ได้ร่วมกัน)
// ยอมให้ทับแชมป์ได้ (คำนวณแยกอิสระ)
//
// Strict (Option B): ต้องกระจาย "ครบทุกปีที่เล่นจริง" เท่านั้น —
//   ถ้าไม่มีใครครบ → ไม่มีผู้ชนะ (การ์ดรางวัลซ่อนเองเพราะ winnerId = null)
//   ไม่มี safety net "กระจายปีเดียวก็ได้รางวัล" (กันรางวัลขัดบทเรียน)
// ==============================================

const MIN_SECTORS = 3;
const MAX_SINGLE_PCT = 70;

function roundIsDiversified(portfolio: Record<string, any> | undefined | null): boolean {
  if (!portfolio) return false;
  const vals = COMPANIES.map((c) => parseFloat(portfolio[c.id]) || 0);
  const sectorCount = vals.filter((v) => v > 0).length;
  const maxAlloc = Math.max(...vals, 0);
  return sectorCount >= MIN_SECTORS && maxAlloc <= MAX_SINGLE_PCT;
}

interface DiversifierCandidate {
  id: string;
  name: string;
  money: number;
  qualRounds: number;       // จำนวนรอบที่กระจายผ่านเกณฑ์
  diversifiedAll: boolean;  // ผ่านครบทุกรอบที่เล่นจริง
  portfolioBreakdown: { round: number; allocations: Record<string, number> }[];
}

function calcDiversifier(players: any[]): Award {
  // หา "จำนวนรอบที่เล่นจริง" จาก round_returns (กันเคสจบเกมก่อนครบ 6 รอบ)
  let playedRounds = 0;
  players.forEach((p) => {
    const rr = p.round_returns || {};
    for (let r = 1; r <= TOTAL_ROUNDS; r++) {
      if (rr[String(r)]) playedRounds = Math.max(playedRounds, r);
    }
  });
  if (playedRounds === 0) playedRounds = TOTAL_ROUNDS;

  const candidates: DiversifierCandidate[] = players.map((p) => {
    const rr = p.round_returns || {};
    let qualRounds = 0;
    const breakdown: { round: number; allocations: Record<string, number> }[] = [];

    for (let r = 1; r <= playedRounds; r++) {
      const portfolio = rr[String(r)]?.portfolio_used;
      if (roundIsDiversified(portfolio)) qualRounds++;

      // breakdown สำหรับ MC (เฉพาะกลุ่มที่ลง >0)
      const allocs: Record<string, number> = {};
      if (portfolio) {
        COMPANIES.forEach((c) => {
          const val = parseFloat(portfolio[c.id]) || 0;
          if (val > 0) allocs[c.name] = val;
        });
      }
      breakdown.push({ round: r, allocations: allocs });
    }

    return {
      id: p.id,
      name: p.name,
      money: parseFloat(p.money) || 0,
      qualRounds,
      diversifiedAll: qualRounds === playedRounds,
      portfolioBreakdown: breakdown,
    };
  });

  // ต้องกระจายครบ "ทุกปีที่เล่นจริง" เท่านั้น (Option B — strict)
  const pool = candidates.filter((c) => c.diversifiedAll);

  // ไม่มีใครครบ → ไม่มีผู้ชนะ (การ์ดรางวัลซ่อนเองเพราะ winnerId = null)
  if (pool.length === 0) {
    return {
      id: 'smart_diversifier',
      name: 'นักลงทุนกระจายความเสี่ยง',
      nameEn: 'Smart Diversifier',
      emoji: '🧺',
      lesson: 'อย่าใส่ไข่ทั้งหมดในตะกร้าใบเดียว — กระจาย ≥3 กลุ่มทุกปี ไม่ทุ่มหมดหน้าตัก',
      lessonEn: "Don't put all your eggs in one basket",
      winnerId: null,
      winnerName: 'ไม่มีผู้ชนะ',
      stat: '',
      winnerIds: [],
      winnerNames: [],
    };
  }

  // ผู้ชนะ = เงินสูงสุดในกลุ่มที่ผ่าน (เสมอเป๊ะ → ร่วมกัน)
  const topMoney = Math.max(...pool.map((c) => c.money));
  const winners = pool.filter((c) => c.money === topMoney);
  const lead = winners[0];

  return {
    id: 'smart_diversifier',
    name: 'นักลงทุนกระจายความเสี่ยง',
    nameEn: 'Smart Diversifier',
    emoji: '🧺',
    lesson: 'อย่าใส่ไข่ทั้งหมดในตะกร้าใบเดียว — กระจาย ≥3 กลุ่มทุกปี ไม่ทุ่มหมดหน้าตัก',
    lessonEn: "Don't put all your eggs in one basket",
    winnerId: lead.id,
    winnerName: winners.length === 1 ? lead.name : winners.map((w) => w.name).join(', '),
    stat: `กระจาย ≥${MIN_SECTORS} กลุ่ม ครบทั้ง ${playedRounds} ปี`,
    winnerIds: winners.map((w) => w.id),
    winnerNames: winners.map((w) => w.name),
    portfolioBreakdown: lead.portfolioBreakdown,
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
// ✅ B13: Player stats สำหรับ FinalView — chance card
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

  // ✅ B13: Chance card stats — ใช้ duel_money_change ปัจจุบัน (ค่าของรอบล่าสุด)
  const currentChance = parseFloat(player.duel_money_change) || 0;

  return {
    quizCorrect,
    quizTotal,
    chanceTotal: currentChance, // simplified: แสดงรอบล่าสุด
    chanceBest: currentChance > 0 ? currentChance : 0,
    chanceWorst: currentChance < 0 ? currentChance : 0,
  };
}
