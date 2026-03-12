// app/api/rooms/route.ts
// =============================================
// Room API — สร้างห้อง + เช็คห้องที่เปิดอยู่
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateRoomCode } from '@/lib/game-engine';

// ใช้ server-side Supabase client
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// GET — เช็คว่ามีห้องที่ status = lobby | playing อยู่ไหม
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .in('status', ['lobby', 'playing'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking rooms:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (rooms && rooms.length > 0) {
      return NextResponse.json({
        exists: true,
        room: rooms[0],
      });
    }

    return NextResponse.json({ exists: false });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — สร้างห้องใหม่
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const forceNew = body?.forceNew === true;

    // เช็คห้องที่เปิดอยู่ก่อน (ป้องกัน Create ซ้ำ)
    if (!forceNew) {
      const { data: existingRooms } = await supabase
        .from('rooms')
        .select('id, status')
        .in('status', ['lobby', 'playing'])
        .limit(1);

      if (existingRooms && existingRooms.length > 0) {
        return NextResponse.json(
          {
            error: 'ROOM_EXISTS',
            room: existingRooms[0],
            message: `มีห้อง ${existingRooms[0].id} เปิดอยู่แล้ว`,
          },
          { status: 409 }
        );
      }
    }

    // ถ้า forceNew → จบห้องเก่าก่อน
    if (forceNew) {
      await supabase
        .from('rooms')
        .update({ status: 'finished', current_phase: 'final' })
        .in('status', ['lobby', 'playing']);
    }

    // สร้าง Room Code ที่ไม่ซ้ำ
    let roomCode = generateRoomCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('rooms')
        .select('id')
        .eq('id', roomCode)
        .limit(1);

      if (!existing || existing.length === 0) break;

      roomCode = generateRoomCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'ไม่สามารถสร้าง Room Code ได้ ลองใหม่อีกครั้ง' },
        { status: 500 }
      );
    }

    // Insert ห้องใหม่
    const { data: room, error } = await supabase
      .from('rooms')
      .insert({
        id: roomCode,
        status: 'lobby',
        current_round: 1,
        current_phase: 'lobby',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, room });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH — อัพเดทสถานะห้อง (End Game)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { roomId, status, phase } = await request.json();

    const { data, error } = await supabase
      .from('rooms')
      .update({
        status: status || 'finished',
        current_phase: phase || 'final',
      })
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('Error updating room:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, room: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}