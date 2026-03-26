// FILE: app/api/game/phase/route.ts
// VERSION: B12-UX-v1 — Start game goes to year_intro instead of research
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B3 created | B4 bug fix phase flow | B5 auto-calculate + event_result phase | B9 duel pair/resolve | B12-UX start → year_intro

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getNextPhase, getPhaseOrder } from '@/lib/game-engine';
import { GOLDEN_DEAL_ROUNDS, TOTAL_ROUNDS, RETURN_TABLE, COMPANIES } from '@/lib/constants';

// ใช้ Supabase client แบบ server-side (ไม่ต้องผ่าน browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ B9: Helper — เรียก duel API (pair หรือ resolve)
async function callDuelAPI(action: string, room_id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/players/duel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, room_id }),
    });
  } catch (err) {
    console.error(`Duel ${action} error:`, err);
  }
}

// ==============================================
// POST /api/game/phase
// MC กดเปลี่ยน phase — ทำได้ 3 อย่าง:
//   1. action: "start"      → เริ่มเกม (lobby → playing)
//   2. action: "next"       → เลื่อนไป phase ถัดไป
//   3. action: "end"        → จบเกมทันที (→ final)
// ==============================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { room_id, action } = body;

    // --- Validate input ---
    if (!room_id || !action) {
      return NextResponse.json(
        { error: 'Missing room_id or action' },
        { status: 400 }
      );
    }

    if (!['start', 'next', 'end'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use: start, next, end' },
        { status: 400 }
      );
    }

    // --- ดึงข้อมูลห้องปัจจุบัน ---
    const { data: room, error: fetchError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room_id)
      .single();

    if (fetchError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // === ACTION: START GAME ===
    if (action === 'start') {
      if (room.status !== 'lobby') {
        return NextResponse.json(
          { error: 'Game already started or finished' },
          { status: 400 }
        );
      }

      // ✅ B12-UX: เปลี่ยน status → playing, phase → year_intro (แทน research), round → 1
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          status: 'playing',
          current_phase: 'year_intro',
          current_round: 1,
        })
        .eq('id', room_id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to start game' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'start',
        status: 'playing',
        current_round: 1,
        current_phase: 'year_intro',
      });
    }

    // === ACTION: END GAME ===
    if (action === 'end') {
      if (room.status !== 'playing') {
        return NextResponse.json(
          { error: 'Game is not currently playing' },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          status: 'finished',
          current_phase: 'final',
        })
        .eq('id', room_id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to end game' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'end',
        status: 'finished',
        current_round: room.current_round,
        current_phase: 'final',
      });
    }

    // === ACTION: NEXT PHASE ===
    if (action === 'next') {
      if (room.status !== 'playing') {
        return NextResponse.json(
          { error: 'Game is not currently playing' },
          { status: 400 }
        );
      }

      // ✅ B9: ถ้าออกจาก attack phase → resolve duel ก่อนเข้า attack_result
      if (room.current_phase === 'attack') {
        await callDuelAPI('resolve', room_id);
      }

      // คำนวณ phase ถัดไปจาก game-engine
      const next = getNextPhase(
        room.current_phase,
        room.current_round,
      );

      if (!next) {
        return NextResponse.json(
          { error: 'No next phase available (game should be finished)' },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          status: next.status,
          current_phase: next.phase,
          current_round: next.round,
        })
        .eq('id', room_id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to advance phase' },
          { status: 500 }
        );
      }

      // ✅ B9: ถ้าเข้า attack phase → จับคู่สุ่มอัตโนมัติ
      if (next.phase === 'attack') {
        await callDuelAPI('pair', room_id);
      }

      // ✅ B5: Auto-calculate returns when entering results phase
      if (next.phase === 'results') {
        const currentRound = next.round;
        const roundIndex = currentRound - 1;

        // ดึงผู้เล่นทั้งหมด
        const { data: allPlayers } = await supabase
          .from('players')
          .select('id, money, portfolio, round_returns')
          .eq('room_id', room_id);

        if (allPlayers) {
          for (const player of allPlayers) {
            const money = parseFloat(player.money) || 0;
            const portfolio = player.portfolio || {};
            const existingReturns = player.round_returns || {};

            // ข้ามถ้ารอบนี้คำนวณไปแล้ว (ป้องกันกดซ้ำ)
            if (existingReturns[String(currentRound)]) continue;

            // คำนวณ return แต่ละบริษัท
            const returns: Record<string, number> = {};
            let totalReturn = 0;

            for (const company of COMPANIES) {
              const allocationPct = parseFloat(portfolio[company.id]) || 0;
              if (allocationPct <= 0) continue;

              const returnPct = RETURN_TABLE[company.id]?.[roundIndex] || 0;
              const investedAmount = money * (allocationPct / 100);
              const returnAmount = Math.round(investedAmount * (returnPct / 100));

              returns[company.id] = returnAmount;
              totalReturn += returnAmount;
            }

            const moneyAfter = money + totalReturn;

            // อัปเดต player — money + round_returns
            await supabase
              .from('players')
              .update({
                money: moneyAfter,
                round_returns: {
                  ...existingReturns,
                  [String(currentRound)]: {
                    money_before: money,
                    money_after: moneyAfter,
                    total_return: totalReturn,
                    returns,
                    portfolio_used: { ...portfolio },
                  },
                },
              })
              .eq('id', player.id);
          }
        }
      }

      return NextResponse.json({
        success: true,
        action: 'next',
        status: next.status,
        current_round: next.round,
        current_phase: next.phase,
      });
    }
  } catch (error) {
    console.error('Phase API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
