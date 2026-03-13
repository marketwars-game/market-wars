'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// ============================================================
// หน้า Join Screen — หน้าแรกที่เด็กเห็น
// เข้ามาได้ 2 ทาง:
//   1. พิมพ์ URL ตรง → ใส่ Room Code + ชื่อ
//   2. สแกน QR → URL มี ?room=XXXX → auto-fill Room Code
// ============================================================

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');

  // ถ้ามี ?room=XXXX ใน URL → auto-fill
  useEffect(() => {
    const roomFromUrl = searchParams.get('room');
    if (roomFromUrl) {
      setRoomCode(roomFromUrl.toUpperCase());
    }
  }, [searchParams]);

  // ฟังก์ชันหลัก — เรียก API join
  const callJoinAPI = async (forceReconnect: boolean) => {
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        room_id: roomCode.trim().toUpperCase(),
        force_reconnect: forceReconnect,
      }),
    });

    const data = await res.json();
    return { res, data };
  };

  // เข้าเกมสำเร็จ → เก็บ localStorage + redirect
  const onJoinSuccess = (data: { player: { id: string; name: string }; room: { id: string } }) => {
    localStorage.setItem(
      `mw_player_${data.room.id}`,
      JSON.stringify({
        id: data.player.id,
        name: data.player.name,
        room_id: data.room.id,
      })
    );
    router.push(`/play/${data.room.id}`);
  };

  const handleJoin = async () => {
    setError('');
    setShowDuplicatePopup(false);

    // Basic validation
    if (!name.trim()) {
      setError('ใส่ชื่อของเธอก่อนนะ!');
      return;
    }
    if (!roomCode.trim()) {
      setError('ใส่ Room Code ด้วย!');
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

      // ชื่อซ้ำ → แสดง popup ถามเด็ก
      if (data.duplicate) {
        setDuplicateName(data.existing_name);
        setShowDuplicatePopup(true);
        setIsJoining(false);
        return;
      }

      // สำเร็จ → เข้าเกม
      onJoinSuccess(data);

    } catch (err) {
      console.error('Join error:', err);
      setError('เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง');
      setIsJoining(false);
    }
  };

  // เด็กกดยืนยันว่าเป็นคนเดิม → reconnect
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
      setError('เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง');
      setIsJoining(false);
    }
  };

  // เด็กกดเปลี่ยนชื่อ → ปิด popup กลับไปแก้ชื่อ
  const handleChangeName = () => {
    setShowDuplicatePopup(false);
    setName('');
  };

  // กด Enter = submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showDuplicatePopup) handleJoin();
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-black tracking-wider">
          <span className="text-[#00FFB2]">MARKET</span>{' '}
          <span className="text-[#00D4FF]">WARS</span>
        </h1>
        <p className="text-gray-400 text-sm mt-2">The Investment Game</p>
      </div>

      {/* Join Card */}
      <div className="w-full max-w-sm bg-[#161B22] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-white text-lg font-bold text-center mb-6">
          🎮 เข้าร่วมเกม
        </h2>

        {/* Room Code Input */}
        <div className="mb-4">
          <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">
            Room Code
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
            onKeyDown={handleKeyDown}
            placeholder="เช่น MKTW"
            maxLength={4}
            className="w-full bg-[#0D1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-[0.3em] placeholder:text-gray-600 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-[#00FFB2] focus:ring-1 focus:ring-[#00FFB2] transition-colors"
            disabled={isJoining}
          />
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">
            ชื่อของเธอ
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ใส่ชื่อเล่น..."
            maxLength={20}
            className="w-full bg-[#0D1117] border border-gray-700 rounded-xl px-4 py-3 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-colors"
            disabled={isJoining}
            autoFocus={!!searchParams.get('room')} // ถ้ามี room code มาแล้ว auto-focus ที่ชื่อ
          />
        </div>

        {/* Error Message */}
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

        {/* Join Button */}
        <button
          onClick={handleJoin}
          disabled={isJoining || !name.trim() || !roomCode.trim()}
          className="w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#00FFB2] to-[#00D4FF] text-[#0D1117] hover:opacity-90 active:scale-[0.98]"
        >
          {isJoining ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> กำลังเข้าห้อง...
            </span>
          ) : (
            '🚀 เข้าเกม!'
          )}
        </button>
      </div>

      {/* Footer */}
      <p className="text-gray-600 text-xs mt-6">
        สแกน QR จากจอใหญ่ หรือพิมพ์ Room Code ด้านบน
      </p>
    </div>
  );
}

// Wrap in Suspense because useSearchParams needs it in Next.js 14+
export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <JoinForm />
    </Suspense>
  );
}
