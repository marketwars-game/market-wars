import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST — เด็กเข้าร่วมห้อง (Join Room)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, room_id, force_reconnect } = body;

    // === Validation ===

    // 1. ชื่อต้องไม่ว่าง
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'กรุณาใส่ชื่อ' },
        { status: 400 }
      );
    }

    // 2. ชื่อไม่ยาวเกิน 20 ตัวอักษร
    if (name.trim().length > 20) {
      return NextResponse.json(
        { error: 'ชื่อยาวเกินไป (ไม่เกิน 20 ตัว)' },
        { status: 400 }
      );
    }

    // 3. Room code ต้องไม่ว่าง
    if (!room_id || room_id.trim().length === 0) {
      return NextResponse.json(
        { error: 'กรุณาใส่ Room Code' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedRoomId = room_id.trim().toUpperCase();

    // 4. เช็คว่าห้องมีอยู่จริง
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', trimmedRoomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'ไม่พบห้องนี้ — ลองเช็ค Room Code อีกครั้ง' },
        { status: 404 }
      );
    }

    // 5. เช็คว่าห้องยังรับคนได้ (lobby หรือ playing สำหรับ reconnect)
    if (room.status === 'finished') {
      return NextResponse.json(
        { error: 'ห้องนี้จบเกมแล้ว' },
        { status: 400 }
      );
    }

    // 6. เช็คชื่อซ้ำในห้องเดียวกัน
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id, name, money, portfolio, action, quiz_score')
      .eq('room_id', trimmedRoomId)
      .eq('name', trimmedName)
      .maybeSingle();

    if (existingPlayer) {
      // ถ้า force_reconnect = true → เด็กกดยืนยันว่าเป็นคนเดิม → เข้าเกมต่อเลย
      if (force_reconnect) {
        return NextResponse.json({
          player: existingPlayer,
          room: room,
          reconnected: true,
        });
      }

      // ไม่ได้ force → ส่ง duplicate flag กลับให้ client ถามเด็กก่อน
      return NextResponse.json({
        duplicate: true,
        existing_name: existingPlayer.name,
        message: `ชื่อ "${trimmedName}" มีคนใช้แล้วในห้องนี้`,
      });
    }

    // 7. ถ้าห้อง status = "playing" แต่ชื่อไม่ซ้ำ → ไม่ให้เข้า (เกมเริ่มแล้ว คนใหม่เข้าไม่ได้)
    if (room.status === 'playing') {
      return NextResponse.json(
        { error: 'เกมเริ่มไปแล้ว — เข้าร่วมไม่ได้' },
        { status: 400 }
      );
    }

    // === Insert player ใหม่ (เฉพาะ lobby เท่านั้น) ===
    const { data: newPlayer, error: insertError } = await supabase
      .from('players')
      .insert({
        room_id: trimmedRoomId,
        name: trimmedName,
        money: 10000,
        portfolio: {},
        quiz_score: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert player error:', insertError);
      return NextResponse.json(
        { error: 'เข้าร่วมไม่สำเร็จ ลองใหม่อีกครั้ง' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      player: newPlayer,
      room: room,
      reconnected: false,
    });

  } catch (error) {
    console.error('Join room error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
