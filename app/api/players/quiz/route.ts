// FILE: app/api/players/quiz/route.ts — Quiz submission API
// VERSION: B8-v2 — Save quiz score + quiz_answered_round + quiz_correct_this_round
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B8 created (v2: added quiz_correct_this_round for MC breakdown)

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player_id, room_id, round, correct_count } = body;

    // Validate input
    if (!player_id || !room_id || !round || correct_count === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: player_id, room_id, round, correct_count' },
        { status: 400 }
      );
    }

    // ดึงข้อมูล player ปัจจุบัน
    const { data: player, error: fetchError } = await supabase
      .from('players')
      .select('quiz_score, quiz_answered_round')
      .eq('id', player_id)
      .eq('room_id', room_id)
      .single();

    if (fetchError || !player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // ป้องกันส่งซ้ำ — เช็ค quiz_answered_round
    if (player.quiz_answered_round >= round) {
      return NextResponse.json({
        success: true,
        message: 'Quiz already submitted for this round',
        quiz_score: player.quiz_score,
      });
    }

    // อัปเดต quiz_score (สะสม) + quiz_answered_round
    const newScore = (player.quiz_score || 0) + correct_count;

    const { error: updateError } = await supabase
      .from('players')
      .update({
        quiz_score: newScore,
        quiz_answered_round: round,
        quiz_correct_this_round: correct_count, // ✅ B8: MC ใช้ดู UNLOCKED/LOCKED
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
      unlocked: correct_count >= 2, // ถูกครบ 2 ข้อ = ปลดล็อก
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
