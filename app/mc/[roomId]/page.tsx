// app/mc/[roomId]/page.tsx
// =============================================
// MC Control Room — Lobby view
// แสดง Room Code, player list, ปุ่ม Start Game, End Game
// Real-time subscription สำหรับ player list
// =============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { MC_TIPS, MAX_PLAYERS } from '@/lib/constants';

// Supabase client (browser-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Room {
  id: string;
  status: string;
  current_round: number;
  current_phase: string;
  created_at: string;
}

interface Player {
  id: string;
  name: string;
  money: number;
  joined_at: string;
}

export default function MCControlPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- เช็ค PIN session ---
  useEffect(() => {
    const session = localStorage.getItem('mc_pin_verified');
    if (session !== 'true') {
      router.push('/mc');
      return;
    }
    loadRoomData();
  }, [roomId]);

  // --- โหลดข้อมูลห้อง ---
  const loadRoomData = useCallback(async () => {
    try {
      // โหลดข้อมูลห้อง
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

      // โหลดผู้เล่น
      const { data: playersData } = await supabase
        .from('players')
        .select('id, name, money, joined_at')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

      setPlayers(playersData || []);
    } catch {
      setError('เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // --- Realtime subscription ---
  useEffect(() => {
    // Subscribe to players table changes
    const playersChannel = supabase
      .channel(`players-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          // Reload player list when any change happens
          loadRoomData();
        }
      )
      .subscribe();

    // Subscribe to room changes
    const roomChannel = supabase
      .channel(`room-${roomId}`)
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
  }, [roomId, loadRoomData]);

  // --- End Game ---
  async function handleEndGame() {
    if (!confirm('⚠️ จบเกมเลย?\n\nจะข้ามไปหน้า Final Summary ทันที')) return;
    if (!confirm('ยืนยันอีกครั้ง — จบเกม ย้อนกลับไม่ได้!')) return;

    try {
      await fetch('/api/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          status: 'finished',
          phase: 'final',
        }),
      });
    } catch {
      alert('เกิดข้อผิดพลาด');
    }
  }

  // --- Open Display ---
  function openDisplay() {
    const displayUrl = `/display/${roomId}`;
    window.open(displayUrl, '_blank');
  }

  // --- Loading / Error ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-[#00FFB2] text-xl animate-pulse">
          Loading room...
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">❌ {error}</p>
          <button
            onClick={() => router.push('/mc')}
            className="text-[#00FFB2] underline"
          >
            กลับหน้า MC
          </button>
        </div>
      </div>
    );
  }

  const currentTip = MC_TIPS[room.current_phase] || '';

  return (
    <div className="min-h-screen bg-[#0D1117] text-white p-4">
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            MC <span className="text-[#00FFB2]">CONTROL</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Room: <span className="text-[#00FFB2] font-mono text-lg">{room.id}</span>
            {' '} | Round {room.current_round} | Phase: {room.current_phase}
          </p>
        </div>

        {/* End Game button — แสดงตลอด */}
        <button
          onClick={handleEndGame}
          className="bg-transparent border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
        >
          ⛔ End Game
        </button>
      </div>

      {/* --- MC Tip --- */}
      {currentTip && (
        <div className="bg-[#161B22] border border-[#00FFB2]/20 rounded-lg p-3 mb-6">
          <p className="text-[#00FFB2] text-sm">💡 {currentTip}</p>
        </div>
      )}

      {/* --- Room Info Card --- */}
      <div className="bg-[#161B22] border border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm">Room Code</p>
            <p className="text-5xl font-mono font-bold text-[#00FFB2] tracking-widest">
              {room.id}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`text-lg font-bold ${
              room.status === 'lobby' ? 'text-yellow-400' :
              room.status === 'playing' ? 'text-green-400' :
              'text-gray-400'
            }`}>
              {room.status === 'lobby' ? '⏳ Lobby' :
               room.status === 'playing' ? '🎮 Playing' :
               '✅ Finished'}
            </p>
          </div>
        </div>

        {/* Open Display button */}
        <button
          onClick={openDisplay}
          className="w-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] py-3 rounded-lg hover:bg-[#00D4FF]/20 transition-colors"
        >
          📺 เปิดหน้า Display (สำหรับจอใหญ่)
        </button>
      </div>

      {/* --- Player List --- */}
      <div className="bg-[#161B22] border border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            👥 ผู้เล่น ({players.length})
          </h2>
          {players.length >= 2 && room.status === 'lobby' && (
            <span className="text-[#00FFB2] text-sm">✅ พร้อมเริ่ม</span>
          )}
        </div>

        {players.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">รอเด็กสแกน QR เข้าห้อง...</p>
            <p className="text-gray-600 text-sm mt-2">
              ให้เด็กเปิดหน้า Display บนจอใหญ่แล้วสแกน QR Code
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="bg-[#0D1117] rounded-lg px-3 py-2 flex items-center gap-2"
              >
                <span className="text-gray-500 text-sm font-mono">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-white truncate">{player.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Action Buttons --- */}
      {room.status === 'lobby' && (
        <div className="space-y-3">
          <button
            disabled={players.length < 1} // MVP: อนุญาต 1 คนก็เริ่มได้ (สำหรับทดสอบ)
            className="w-full bg-[#00FFB2] text-[#0D1117] font-bold py-4 rounded-xl text-xl hover:bg-[#00D4FF] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            🚀 Start Game ({players.length} players)
          </button>
          <p className="text-gray-500 text-center text-sm">
            * ปุ่ม Start Game จะทำงานจริงใน Task B3
          </p>
        </div>
      )}
    </div>
  );
}
