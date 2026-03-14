// app/display/[roomId]/page.tsx
// =============================================
// Display Screen — สำหรับจอใหญ่ / Projector
// แสดง QR Code + Room Code + รายชื่อผู้เล่น
// Read-only, ไม่ต้อง PIN
// Sync ผ่าน Supabase Realtime
// =============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';
import { MAX_PLAYERS } from '@/lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Room {
  id: string;
  status: string;
  current_round: number;
  current_phase: string;
}

interface Player {
  id: string;
  name: string;
  joined_at: string;
}

export default function DisplayPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- สร้าง Join URL สำหรับ QR Code ---
  // ใช้ window.location.origin เพื่อให้ทำงานทั้ง localhost และ Vercel
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/play/${roomId}`);
    }
  }, [roomId]);

  // --- โหลดข้อมูล ---
  const loadData = useCallback(async () => {
    try {
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError || !roomData) {
        setError('ไม่พบห้องนี้');
        return;
      }

      setRoom(roomData);

      const { data: playersData } = await supabase
        .from('players')
        .select('id, name, joined_at')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

      setPlayers(playersData || []);
    } catch {
      setError('เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Realtime ---
  useEffect(() => {
    const playersChannel = supabase
      .channel(`display-players-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    const roomChannel = supabase
      .channel(`display-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom(payload.new as Room);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, loadData]);

  // --- Loading / Error ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-[#00FFB2] text-2xl animate-pulse">
          MARKET WARS
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <p className="text-red-400 text-2xl">❌ {error}</p>
      </div>
    );
  }

  // ========== LOBBY DISPLAY ==========
  if (room.current_phase === 'lobby') {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white tracking-wider mb-2">
            MARKET <span className="text-[#00FFB2]">WARS</span>
          </h1>
          <p className="text-[#00D4FF] text-xl">The Investment Game</p>
        </div>

        {/* QR Code + Room Code */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          {/* QR Code */}
          <div className="bg-white p-6 rounded-2xl shadow-lg shadow-[#00FFB2]/20">
            {joinUrl ? (
              <QRCodeSVG
                value={joinUrl}
                size={280}
                bgColor="#FFFFFF"
                fgColor="#0D1117"
                level="M"
                includeMargin={false}
              />
            ) : (
              <div className="w-[280px] h-[280px] bg-gray-200 animate-pulse rounded" />
            )}
          </div>

          {/* Room Code + Instructions */}
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-lg mb-2">สแกน QR หรือเข้าเว็บแล้วใส่:</p>
            <div className="text-8xl font-mono font-bold text-[#00FFB2] tracking-[0.2em] mb-4">
              {room.id}
            </div>
            <p className="text-gray-500 text-sm">
              {joinUrl}
            </p>
          </div>
        </div>

        {/* Player List */}
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white">
              Players Joined
            </h2>
            <span className="bg-[#00FFB2]/10 text-[#00FFB2] px-4 py-1 rounded-full text-xl font-mono font-bold">
              {players.length}
            </span>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-2xl animate-pulse">
                Waiting for players...
              </p>
              <p className="text-gray-600 mt-2">
                สแกน QR Code ด้านบนเพื่อเข้าร่วม
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-[#161B22] border border-[#00FFB2]/20 rounded-xl px-4 py-3 text-center animate-in fade-in"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <p className="text-[#00FFB2] font-mono text-xs mb-1">
                    #{String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="text-white font-bold truncate">
                    {player.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer pulse */}
        <div className="mt-8">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-2 h-2 bg-[#00FFB2] rounded-full animate-pulse" />
            <span>Waiting for Game Master to start the game...</span>
          </div>
        </div>
      </div>
    );
  }

  // ========== OTHER PHASES (placeholder for Task B3+) ==========
  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-white mb-4">
        MARKET <span className="text-[#00FFB2]">WARS</span>
      </h1>
      <p className="text-[#00D4FF] text-xl mb-2">
        Round {room.current_round} — {room.current_phase}
      </p>
      <p className="text-gray-500">
        (Display สำหรับ phase นี้จะสร้างใน Task B3+)
      </p>
    </div>
  );
}
