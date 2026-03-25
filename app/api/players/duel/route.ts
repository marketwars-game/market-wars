// FILE: app/api/players/duel/route.ts — Market Fight (เป่ายิงฉุบ)
// VERSION: B9-v1
// LAST MODIFIED: 25 Mar 2026
// ACTIONS: pair (จับคู่), move (บันทึก move), resolve (คำนวณผล)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, room_id, player_id, move, round } = body;

    // === PAIR: จับคู่สุ่มตอนเข้า attack phase ===
    if (action === 'pair') {
      // ดึง players ทั้งหมดในห้อง
      const { data: players, error } = await supabase
        .from('players')
        .select('id, name')
        .eq('room_id', room_id)
        .order('joined_at', { ascending: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!players || players.length === 0) return NextResponse.json({ error: 'No players' }, { status: 400 });

      // Reset duel columns ก่อนจับคู่ใหม่
      await supabase
        .from('players')
        .update({
          duel_opponent_id: null,
          duel_opponent_name: null,
          duel_move: null,
          duel_result: null,
          duel_money_change: 0,
          duel_submitted_round: 0,
        })
        .eq('room_id', room_id);

      // สุ่ม shuffle players
      const shuffled = [...players].sort(() => Math.random() - 0.5);

      // จับคู่
      const pairs: { id: string; opponent_id: string | null; opponent_name: string | null }[] = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) {
          // มีคู่
          pairs.push({ id: shuffled[i].id, opponent_id: shuffled[i + 1].id, opponent_name: shuffled[i + 1].name });
          pairs.push({ id: shuffled[i + 1].id, opponent_id: shuffled[i].id, opponent_name: shuffled[i].name });
        } else {
          // คนเหลือ (Bye)
          pairs.push({ id: shuffled[i].id, opponent_id: null, opponent_name: null });
        }
      }

      // อัปเดต DB ทีละคน
      for (const p of pairs) {
        await supabase
          .from('players')
          .update({
            duel_opponent_id: p.opponent_id,
            duel_opponent_name: p.opponent_name,
            duel_result: p.opponent_id === null ? 'bye' : null,
          })
          .eq('id', p.id);
      }

      return NextResponse.json({
        success: true,
        pairs: Math.floor(pairs.length / 2),
        bye: pairs.filter(p => p.opponent_id === null).length,
      });
    }

    // === MOVE: Player เลือก rock/paper/scissors ===
    if (action === 'move') {
      if (!player_id || !move || !round) {
        return NextResponse.json({ error: 'Missing player_id, move, or round' }, { status: 400 });
      }

      const validMoves = ['rock', 'paper', 'scissors'];
      if (!validMoves.includes(move)) {
        return NextResponse.json({ error: 'Invalid move' }, { status: 400 });
      }

      const { error } = await supabase
        .from('players')
        .update({
          duel_move: move,
          duel_submitted_round: round,
        })
        .eq('id', player_id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ success: true });
    }

    // === RESOLVE: คำนวณผล duel ทุกคู่ (เรียกจาก Phase API ตอน MC กด Next) ===
    if (action === 'resolve') {
      const { data: players, error } = await supabase
        .from('players')
        .select('id, name, money, duel_opponent_id, duel_opponent_name, duel_move, duel_result')
        .eq('room_id', room_id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!players) return NextResponse.json({ error: 'No players' }, { status: 400 });

      const playerMap = new Map(players.map(p => [p.id, p]));

      // Process ทีละคู่
      const processed = new Set<string>();
      let winCount = 0, loseCount = 0, drawCount = 0, byeCount = 0, noSubmitCount = 0;

      const winsAgainst: Record<string, string> = { rock: 'scissors', scissors: 'paper', paper: 'rock' };

      for (const p of players) {
        if (processed.has(p.id)) continue;

        // Bye — ไม่มีคู่
        if (!p.duel_opponent_id || p.duel_result === 'bye') {
          await supabase.from('players').update({
            duel_result: 'bye',
            duel_money_change: 0,
          }).eq('id', p.id);
          byeCount++;
          processed.add(p.id);
          continue;
        }

        const opponent = playerMap.get(p.duel_opponent_id);
        if (!opponent || processed.has(opponent.id)) continue;

        // ทั้งคู่ — คำนวณผล
        const myMove = p.duel_move;
        const oppMove = opponent.duel_move;

        let myResult: string;
        let oppResult: string;
        let myMoneyChange = 0;
        let oppMoneyChange = 0;

        if (!myMove && !oppMove) {
          // ทั้งคู่ไม่กด → เสมอ
          myResult = 'draw';
          oppResult = 'draw';
          drawCount += 2;
        } else if (!myMove) {
          // ฉันไม่กด → แพ้
          myResult = 'lose';
          oppResult = 'win';
          myMoneyChange = -300;
          oppMoneyChange = 500;
          loseCount++;
          winCount++;
          noSubmitCount++;
        } else if (!oppMove) {
          // คู่ไม่กด → ฉันชนะ
          myResult = 'win';
          oppResult = 'lose';
          myMoneyChange = 500;
          oppMoneyChange = -300;
          winCount++;
          loseCount++;
          noSubmitCount++;
        } else if (myMove === oppMove) {
          // เสมอ
          myResult = 'draw';
          oppResult = 'draw';
          drawCount += 2;
        } else {
          // เป่ายิงฉุบจริง
          if (winsAgainst[myMove] === oppMove) {
            myResult = 'win';
            oppResult = 'lose';
            myMoneyChange = 500;
            oppMoneyChange = -300;
            winCount++;
            loseCount++;
          } else {
            myResult = 'lose';
            oppResult = 'win';
            myMoneyChange = -300;
            oppMoneyChange = 500;
            loseCount++;
            winCount++;
          }
        }

        // อัปเดตทั้งคู่
        await supabase.from('players').update({
          duel_result: myResult,
          duel_money_change: myMoneyChange,
          money: parseFloat(p.money) + myMoneyChange,
        }).eq('id', p.id);

        await supabase.from('players').update({
          duel_result: oppResult,
          duel_money_change: oppMoneyChange,
          money: parseFloat(opponent.money) + oppMoneyChange,
        }).eq('id', opponent.id);

        processed.add(p.id);
        processed.add(opponent.id);
      }

      return NextResponse.json({
        success: true,
        stats: { win: winCount, lose: loseCount, draw: drawCount, bye: byeCount, noSubmit: noSubmitCount },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
