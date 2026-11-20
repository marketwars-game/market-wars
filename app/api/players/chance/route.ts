// FILE: app/api/players/chance/route.ts — เปิดการ์ดโชคชะตา (server-side)
// VERSION: B26 — created
// LAST MODIFIED: 20 Nov 2026
// HISTORY: B26 created — ย้ายการเขียนเงินจาก client (ChanceCard.tsx เขียน money = state ในเครื่อง + amount) มาไว้ server:
//          อ่านเงินสดจาก DB ก่อนบวก (กันโบนัส quiz หายเมื่อ realtime มาช้า) · คำนวณการ์ดฝั่ง server · กันเปิดซ้ำ

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getChanceCard } from '@/lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/players/chance  { player_id, room_id, round }
export async function POST(request: Request) {
  try {
    const { player_id, room_id, round } = await request.json();
    const r = Number(round);
    if (!player_id || !room_id || !r) {
      return NextResponse.json({ error: 'Missing required fields: player_id, room_id, round' }, { status: 400 });
    }

    const [{ data: room }, { data: player }] = await Promise.all([
      supabase.from('rooms').select('status, current_round').eq('id', room_id).single(),
      supabase.from('players').select('id, money, duel_submitted_round, duel_money_change').eq('id', player_id).eq('room_id', room_id).single(),
    ]);
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });

    // เปิดไปแล้วรอบนี้ → idempotent (กดซ้ำ/retry ไม่ได้เงินซ้ำ)
    if ((player.duel_submitted_round || 0) >= r) {
      return NextResponse.json({ success: true, already: true, amount: parseFloat(player.duel_money_change) || 0 });
    }
    // ไม่เช็ค phase เข้ม (คำขอที่มาช้าตอน server ตึงยังควรได้การ์ด) — เช็คแค่รอบตรงกันและเกมยังเล่นอยู่
    if (room.status !== 'playing' || room.current_round !== r) {
      return NextResponse.json({ error: 'Chance card is not open for this round' }, { status: 400 });
    }

    const card = getChanceCard(room_id, r, player_id); // deterministic — ตรงกับการ์ดที่จอมือถือแสดง
    const money = parseFloat(player.money) || 0;

    // guard ซ้ำที่ระดับ DB: update เฉพาะแถวที่ยังไม่เปิดรอบนี้ (กัน 2 คำขอพร้อมกัน)
    const { data: updated, error } = await supabase
      .from('players')
      .update({ money: money + card.amount, duel_money_change: card.amount, duel_submitted_round: r })
      .eq('id', player_id)
      .or(`duel_submitted_round.is.null,duel_submitted_round.lt.${r}`)
      .select('id');

    if (error) return NextResponse.json({ error: 'Failed to save chance card' }, { status: 500 });
    return NextResponse.json({ success: true, already: !updated || updated.length === 0, amount: card.amount });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
