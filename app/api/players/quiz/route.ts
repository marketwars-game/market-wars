// FILE: app/api/players/quiz/route.ts — Quiz submission API
// VERSION: B18-v1 — capture response speed (quiz_speed_this_round_ms + accumulate quiz_speed_ms)
// LAST MODIFIED: 12 Jun 2026
// HISTORY: B8 created (v2: added quiz_correct_this_round for MC breakdown) | B18 speed capture for tiebreak cascade + speed wall

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player_id, room_id, round, correct_count, elapsed_ms } = body;

    // Validate input
    if (!player_id || !room_id || !round || correct_count === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: player_id, room_id, round, correct_count' },
        { status: 400 }
      );
    }

    // ✅ B18: เวลาตอบรอบนี้ (ms) — clamp กันค่าติดลบ/เพี้ยน; ไม่ส่งมา = 0
    const elapsed = Math.max(0, Math.round(Number(elapsed_ms) || 0));

    // ดึงข้อมูล player ปัจจุบัน (✅ B18: +quiz_speed_ms เพื่อสะสม)
    const { data: player, error: fetchError } = await supabase
      .from('players')
      .select('quiz_score, quiz_answered_round, quiz_speed_ms')
      .eq('id', player_id)
      .eq('room_id', room_id)
      .single();

    if (fetchError || !player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // ป้องกันส่งซ้ำ — เช็ค quiz_answered_round (กันบวกเวลาสะสมซ้ำด้วย)
    if (player.quiz_answered_round >= round) {
      return NextResponse.json({
        success: true,
        message: 'Quiz already submitted for this round',
        quiz_score: player.quiz_score,
      });
    }

    // อัปเดต quiz_score (สะสม) + quiz_answered_round
    const newScore = (player.quiz_score || 0) + correct_count;
    // ✅ B18: numeric คืน string → parseFloat (กฎโปรเจกต์: ห้าม Number())
    const newSpeedTotal = (parseFloat(player.quiz_speed_ms) || 0) + elapsed;

    const { error: updateError } = await supabase
      .from('players')
      .update({
        quiz_score: newScore,
        quiz_answered_round: round,
        quiz_correct_this_round: correct_count, // ✅ B8: MC ใช้ดู UNLOCKED/LOCKED
        quiz_speed_this_round_ms: elapsed,      // ✅ B18: เวลารอบนี้ → speed wall
        quiz_speed_ms: newSpeedTotal,           // ✅ B18: เวลาสะสม → tiebreak cascade
      })
      .eq('id', player_id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update quiz score' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz_score: newScore,
      correct_count,
      elapsed_ms: elapsed,
      unlocked: correct_count >= 2, // ถูกครบ 2 ข้อ = ปลดล็อก
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
