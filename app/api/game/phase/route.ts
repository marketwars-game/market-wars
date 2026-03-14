import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getNextPhase, getPhaseOrder } from '@/lib/game-engine';
import { GOLDEN_DEAL_ROUNDS, TOTAL_ROUNDS } from '@/lib/constants';

// ใช้ Supabase client แบบ server-side (ไม่ต้องผ่าน browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

      // เปลี่ยน status → playing, phase → research, round → 1
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          status: 'playing',
          current_phase: 'research',
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
        current_phase: 'research',
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
