// FILE: app/api/players/name/route.ts — ผู้เล่นแก้ชื่อตัวเอง (เฉพาะตอนห้องอยู่ใน lobby)
// VERSION: B26 — created
// LAST MODIFIED: 21 Nov 2026
// HISTORY: B26 created — เดิมแก้ชื่อไม่ได้: เด็กที่ตั้งผิดต้อง join ใหม่ → ชื่อเก่าค้างเป็นแถวผีในห้อง · แก้บนแถวเดิม ไม่สร้างแถวใหม่

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// PATCH /api/players/name  { player_id, room_id, name }
export async function PATCH(request: Request) {
  try {
    const { player_id, room_id, name } = await request.json();
    const newName = typeof name === 'string' ? name.trim() : '';
    if (!player_id || !room_id) return NextResponse.json({ error: 'Missing required fields: player_id, room_id' }, { status: 400 });
    if (!newName) return NextResponse.json({ error: 'กรุณาใส่ชื่อ' }, { status: 400 });
    if (newName.length > 20) return NextResponse.json({ error: 'ชื่อยาวเกินไป (ไม่เกิน 20 ตัว)' }, { status: 400 });

    const { data: room } = await supabase.from('rooms').select('status').eq('id', room_id).single();
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    // แก้ได้เฉพาะก่อนเริ่มเกม — หลัง Start ชื่อผูกกับจอ/อันดับแล้ว
    if (room.status !== 'lobby') return NextResponse.json({ error: 'เกมเริ่มแล้ว — แก้ชื่อไม่ได้' }, { status: 400 });

    const { data: me } = await supabase.from('players').select('id, name').eq('id', player_id).eq('room_id', room_id).maybeSingle();
    if (!me) return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    if (me.name === newName) return NextResponse.json({ success: true, name: newName });

    // ชื่อซ้ำกับคนอื่นในห้อง = ไม่ให้ (join ใช้ชื่อเป็นตัวระบุตอน reconnect)
    const { data: taken } = await supabase.from('players').select('id').eq('room_id', room_id).eq('name', newName).neq('id', player_id).limit(1);
    if (taken && taken.length > 0) return NextResponse.json({ error: `ชื่อ "${newName}" มีคนใช้แล้วในห้องนี้` }, { status: 409 });

    const { data: updated, error } = await supabase.from('players').update({ name: newName }).eq('id', player_id).eq('room_id', room_id).select('id, name');
    if (error || !updated || updated.length === 0) return NextResponse.json({ error: 'Failed to update name' }, { status: 500 });
    return NextResponse.json({ success: true, name: newName });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
