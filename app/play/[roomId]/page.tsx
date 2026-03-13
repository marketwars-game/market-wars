'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { STARTING_MONEY, COMPANIES } from '@/lib/constants';

// ============================================================
// หน้าผู้เล่น — /play/[roomId]
//
// 2 สถานะ:
//   1. ยังไม่ได้ join → แสดง form ใส่ชื่อ (กรณีเข้าจาก QR ตรง)
//   2. join แล้ว → แสดง Lobby (รอ MC เริ่มเกม)
//
// ใช้ Supabase Realtime subscribe:
//   - players table → เห็นคนอื่นเข้ามา
//   - rooms table → เห็นเมื่อ MC เริ่มเกม (phase change)
// ============================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================================
// Mini Join Form — แสดงเมื่อเข้าจาก QR โดยตรง (ยังไม่มี player data)
// ============================================================
function MiniJoinForm({ 
  roomId, 
  onJoined 
}: { 
  roomId: string; 
  onJoined: (player: PlayerData) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');

  const callJoinAPI = async (forceReconnect: boolean) => {
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        room_id: roomId,
        force_reconnect: forceReconnect,
      }),
    });
    const data = await res.json();
    return { res, data };
  };

  const onJoinSuccess = (data: { player: { id: string; name: string }; room: { id: string } }) => {
    const playerData: PlayerData = {
      id: data.player.id,
      name: data.player.name,
      room_id: data.room.id,
    };
    localStorage.setItem(`mw_player_${roomId}`, JSON.stringify(playerData));
    onJoined(playerData);
  };

  const handleJoin = async () => {
    setError('');
    setShowDuplicatePopup(false);
    if (!name.trim()) {
      setError('ใส่ชื่อของเธอก่อนนะ!');
      return;
    }
    if (name.trim().length > 20) {
      setError('ชื่อยาวเกินไป (ไม่เกิน 20 ตัว)');
      return;
    }

    setIsJoining(true);

    try {
      const { res, data } = await callJoinAPI(false);

      if (!res.ok) {
        setError(data.error || 'เข้าร่วมไม่สำเร็จ');
        setIsJoining(false);
        return;
      }

      if (data.duplicate) {
        setDuplicateName(data.existing_name);
        setShowDuplicatePopup(true);
        setIsJoining(false);
        return;
      }

      onJoinSuccess(data);

    } catch (err) {
      console.error('Join error:', err);
      setError('เชื่อมต่อไม่ได้ ลองใหม่');
      setIsJoining(false);
    }
  };

  const handleReconnect = async () => {
    setIsJoining(true);
    setShowDuplicatePopup(false);

    try {
      const { res, data } = await callJoinAPI(true);
      if (!res.ok) {
        setError(data.error || 'เข้าร่วมไม่สำเร็จ');
        setIsJoining(false);
        return;
      }
      onJoinSuccess(data);
    } catch (err) {
      console.error('Reconnect error:', err);
      setError('เชื่อมต่อไม่ได้ ลองใหม่');
      setIsJoining(false);
    }
  };

  const handleChangeName = () => {
    setShowDuplicatePopup(false);
    setName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showDuplicatePopup) handleJoin();
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black tracking-wider">
          <span className="text-[#00FFB2]">MARKET</span>{' '}
          <span className="text-[#00D4FF]">WARS</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Room: <span className="text-white font-mono">{roomId}</span></p>
      </div>

      <div className="w-full max-w-sm bg-[#161B22] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-white text-lg font-bold text-center mb-4">
          🎮 ใส่ชื่อเข้าเกม
        </h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ชื่อเล่นของเธอ..."
          maxLength={20}
          autoFocus
          className="w-full bg-[#0D1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-colors mb-4"
          disabled={isJoining}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Duplicate Name Popup */}
        {showDuplicatePopup && (
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-300 text-sm font-semibold text-center mb-1">
              ⚠️ ชื่อ &quot;{duplicateName}&quot; มีคนใช้แล้ว
            </p>
            <p className="text-gray-400 text-xs text-center mb-3">
              เธอคือ {duplicateName} คนเดิมที่เข้ามาก่อนหน้าใช่ไหม?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReconnect}
                className="flex-1 py-2 rounded-lg bg-[#00FFB2] text-[#0D1117] text-sm font-bold hover:opacity-90 transition-opacity"
              >
                ✅ ใช่ เข้าเกมต่อ
              </button>
              <button
                onClick={handleChangeName}
                className="flex-1 py-2 rounded-lg bg-gray-700 text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                ❌ ไม่ใช่ เปลี่ยนชื่อ
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={isJoining || !name.trim() || showDuplicatePopup}
          className="w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#00FFB2] to-[#00D4FF] text-[#0D1117] hover:opacity-90 active:scale-[0.98]"
        >
          {isJoining ? '⏳ กำลังเข้าห้อง...' : '🚀 เข้าเกม!'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Lobby Screen — แสดงหลัง join สำเร็จ
// ============================================================
function LobbyScreen({
  playerData,
  roomId,
}: {
  playerData: PlayerData;
  roomId: string;
}) {
  const router = useRouter();
  const [players, setPlayers] = useState<{ id: string; name: string; money: number }[]>([]);
  const [roomStatus, setRoomStatus] = useState<string>('lobby');
  const [roomPhase, setRoomPhase] = useState<string>('lobby');

  // โหลด player list ครั้งแรก
  const loadPlayers = useCallback(async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, name, money')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (!error && data) {
      setPlayers(data);
    }
  }, [roomId]);

  // โหลด room status ครั้งแรก
  const loadRoom = useCallback(async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('status, current_phase')
      .eq('id', roomId)
      .single();

    if (!error && data) {
      setRoomStatus(data.status);
      setRoomPhase(data.current_phase);
    }
  }, [roomId]);

  useEffect(() => {
    loadPlayers();
    loadRoom();

    // Subscribe to players table — เห็นคนอื่นเข้ามา real-time
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
          // Reload ทั้งหมดเมื่อมีการเปลี่ยนแปลง
          loadPlayers();
        }
      )
      .subscribe();

    // Subscribe to rooms table — เห็นเมื่อ MC เริ่มเกม
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
          const newRoom = payload.new as { status: string; current_phase: string };
          setRoomStatus(newRoom.status);
          setRoomPhase(newRoom.current_phase);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, loadPlayers, loadRoom]);

  // ถ้า MC เริ่มเกม (status เปลี่ยนจาก lobby → playing)
  // ตรงนี้ Task B3 จะเพิ่ม logic เปลี่ยนหน้าจอ
  // ตอนนี้แค่แสดงข้อความว่าเกมเริ่มแล้ว
  const gameStarted = roomStatus === 'playing';
  const gameFinished = roomStatus === 'finished';

  if (gameFinished) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🏁</p>
          <h2 className="text-white text-xl font-bold mb-2">เกมจบแล้ว!</h2>
          <p className="text-gray-400">ขอบคุณที่เข้าร่วม Market Wars</p>
        </div>
      </div>
    );
  }

  if (gameStarted) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-4xl mb-4 animate-bounce">🎮</p>
          <h2 className="text-[#00FFB2] text-xl font-bold mb-2">เกมเริ่มแล้ว!</h2>
          <p className="text-gray-400 text-sm">รอ MC เปลี่ยน phase...</p>
          <p className="text-gray-500 text-xs mt-2">Phase: {roomPhase} | Round: (coming in B3)</p>
        </div>
      </div>
    );
  }

  // === Lobby UI ===
  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col">
      {/* Header */}
      <div className="bg-[#161B22] border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-wider">
              <span className="text-[#00FFB2]">MARKET</span>{' '}
              <span className="text-[#00D4FF]">WARS</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">ROOM</p>
            <p className="text-white font-mono font-bold text-lg">{roomId}</p>
          </div>
        </div>
      </div>

      {/* Player Info Card */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-[#00FFB2]/10 to-[#00D4FF]/10 border border-[#00FFB2]/30 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">นักลงทุน</p>
              <p className="text-white text-xl font-bold">{playerData.name}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">เงินเริ่มต้น</p>
              <p className="text-[#00FFB2] text-xl font-mono font-bold">
                ฿{STARTING_MONEY.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Waiting Message */}
      <div className="px-4 mb-4">
        <div className="bg-[#161B22] rounded-xl p-4 text-center border border-gray-800">
          <p className="text-2xl mb-2 animate-pulse">⏳</p>
          <p className="text-white font-semibold">รอ MC เริ่มเกม...</p>
          <p className="text-gray-500 text-sm mt-1">เตรียมตัวให้พร้อม!</p>
        </div>
      </div>

      {/* 6 Companies Preview */}
      <div className="px-4 mb-4">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
          6 บริษัทที่จะลงทุน
        </p>
        <div className="grid grid-cols-3 gap-2">
          {COMPANIES.map((company) => (
            <div
              key={company.id}
              className="bg-[#161B22] rounded-xl p-3 border border-gray-800 text-center"
            >
              <p className="text-2xl mb-1">{company.icon}</p>
              <p className="text-white text-xs font-semibold leading-tight">{company.name}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{company.type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Player List */}
      <div className="px-4 flex-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-xs uppercase tracking-wider">
            นักลงทุนในห้อง
          </p>
          <p className="text-[#00FFB2] text-sm font-mono font-bold">
            {players.length} คน
          </p>
        </div>

        <div className="space-y-2 pb-6">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                player.id === playerData.id
                  ? 'bg-[#00FFB2]/10 border-[#00FFB2]/30'
                  : 'bg-[#161B22] border-gray-800'
              }`}
            >
              <span className="text-gray-500 text-sm font-mono w-6 text-right">
                {index + 1}.
              </span>
              <span className={`text-sm font-semibold flex-1 ${
                player.id === playerData.id ? 'text-[#00FFB2]' : 'text-white'
              }`}>
                {player.name}
                {player.id === playerData.id && (
                  <span className="text-[#00FFB2]/60 text-xs ml-1">(เธอ)</span>
                )}
              </span>
              <span className="text-gray-500 text-xs font-mono">
                ฿{player.money.toLocaleString()}
              </span>
            </div>
          ))}

          {players.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm">ยังไม่มีใครเข้ามา...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Type
// ============================================================
interface PlayerData {
  id: string;
  name: string;
  room_id: string;
}

// ============================================================
// Main Page Component
// ============================================================
export default function PlayerPage() {
  const params = useParams();
  const roomId = (params.roomId as string)?.toUpperCase();

  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // เช็ค localStorage ว่า join แล้วหรือยัง
  useEffect(() => {
    if (!roomId) return;

    const saved = localStorage.getItem(`mw_player_${roomId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PlayerData;
        setPlayerData(parsed);
      } catch {
        // Invalid data → ให้ join ใหม่
        localStorage.removeItem(`mw_player_${roomId}`);
      }
    }
    setIsLoading(false);
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  // ยังไม่ได้ join → แสดง form ใส่ชื่อ
  if (!playerData) {
    return (
      <MiniJoinForm
        roomId={roomId}
        onJoined={(player) => setPlayerData(player)}
      />
    );
  }

  // Join แล้ว → แสดง Lobby
  return <LobbyScreen playerData={playerData} roomId={roomId} />;
}
