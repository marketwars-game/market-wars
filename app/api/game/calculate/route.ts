// FILE: app/api/game/calculate/route.ts
// ✅ B5: Calculate returns API
// คำนวณผลตอบแทนจาก portfolio × RETURN_TABLE แล้วอัปเดต money + round_returns
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RETURN_TABLE, COMPANIES } from '@/lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const { room_id, round } = await req.json();

    // --- Validate ---
    if (!room_id || !round) {
      return NextResponse.json({ error: 'Missing room_id or round' }, { status: 400 });
    }

    // ดึงข้อมูลห้อง
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.status !== 'playing') {
      return NextResponse.json({ error: 'Room is not in playing state' }, { status: 400 });
    }

    // ดึงผู้เล่นทั้งหมดในห้อง
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, money, portfolio, round_returns')
      .eq('room_id', room_id);

    if (playersError || !players) {
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
    }

    // --- คำนวณ return แต่ละคน ---
    const roundIndex = round - 1; // RETURN_TABLE ใช้ 0-based index
    const updates = [];
    const resultsSummary: { player_id: string; name?: string; profit: number }[] = [];

    for (const player of players) {
      const money = parseFloat(player.money) || 0;
      const portfolio = player.portfolio || {};
      const existingReturns = player.round_returns || {};

      // ถ้ารอบนี้คำนวณไปแล้ว → ข้าม (ป้องกันกดซ้ำ)
      if (existingReturns[String(round)]) {
        continue;
      }

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

      // บันทึก round_returns
      const updatedReturns = {
        ...existingReturns,
        [String(round)]: {
          money_before: money,
          money_after: moneyAfter,
          total_return: totalReturn,
          returns,
          portfolio_used: { ...portfolio },
        },
      };

      updates.push({
        id: player.id,
        money: moneyAfter,
        round_returns: updatedReturns,
      });

      resultsSummary.push({
        player_id: player.id,
        profit: totalReturn,
      });
    }

    // --- Batch update players ---
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('players')
        .update({
          money: update.money,
          round_returns: update.round_returns,
        })
        .eq('id', update.id);

      if (updateError) {
        console.error(`Failed to update player ${update.id}:`, updateError);
      }
    }

    // --- สรุปผล ---
    const profits = resultsSummary.map((r) => r.profit);
    const avgProfit = profits.length > 0 ? Math.round(profits.reduce((a, b) => a + b, 0) / profits.length) : 0;
    const maxProfit = profits.length > 0 ? Math.max(...profits) : 0;
    const minProfit = profits.length > 0 ? Math.min(...profits) : 0;
    const lossCount = profits.filter((p) => p < 0).length;

    return NextResponse.json({
      success: true,
      round,
      players_calculated: updates.length,
      players_skipped: players.length - updates.length,
      summary: {
        avg_profit: avgProfit,
        max_profit: maxProfit,
        min_profit: minProfit,
        loss_count: lossCount,
      },
    });

  } catch (err) {
    console.error('Calculate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
