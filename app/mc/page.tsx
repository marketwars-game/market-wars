// app/mc/page.tsx
// =============================================
// MC Landing — PIN Gate + Create Room
// Flow: ใส่ PIN → ผ่าน → เห็นปุ่ม Create Room (หรือ "กลับเข้าห้องเดิม")
// =============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MCPage() {
  const router = useRouter();

  // --- State ---
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // ห้องที่เปิดอยู่ (ถ้ามี)
  const [existingRoom, setExistingRoom] = useState<{
    id: string;
    status: string;
  } | null>(null);

  // --- เช็ค PIN session ตอนเปิดหน้า ---
  useEffect(() => {
    const session = localStorage.getItem('mc_pin_verified');
    if (session === 'true') {
      setIsPinVerified(true);
      checkExistingRoom();
    }
    setIsCheckingSession(false);
  }, []);

  // --- ตรวจสอบ PIN ---
  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;

    setIsLoading(true);
    setPinError('');

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('mc_pin_verified', 'true');
        setIsPinVerified(true);
        await checkExistingRoom();
      } else {
        setPinError(data.error || 'รหัสไม่ถูกต้อง');
        setPin('');
      }
    } catch {
      setPinError('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }

  // --- เช็คห้องที่เปิดอยู่ ---
  async function checkExistingRoom() {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();

      if (data.exists) {
        setExistingRoom(data.room);
      } else {
        setExistingRoom(null);
      }
    } catch {
      console.error('Error checking rooms');
    }
  }

  // --- สร้างห้องใหม่ ---
  async function handleCreateRoom(forceNew: boolean = false) {
    setIsLoading(true);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceNew }),
      });

      const data = await res.json();

      if (data.success && data.room) {
        router.push(`/mc/${data.room.id}`);
      } else if (data.error === 'ROOM_EXISTS') {
        setExistingRoom(data.room);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      alert('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }

  // --- จบเกมเก่า + สร้างห้องใหม่ ---
  async function handleEndAndCreate() {
    if (!confirm('จบเกมเก่า + สร้างห้องใหม่?\n\nเกมเก่าจะถูกจบทันที ย้อนกลับไม่ได้!')) {
      return;
    }
    await handleCreateRoom(true);
  }

  // --- Loading ---
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-[#00FFB2] text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white tracking-wider">
          MARKET <span className="text-[#00FFB2]">WARS</span>
        </h1>
        <p className="text-gray-400 mt-2">Game Master Control</p>
      </div>

      {!isPinVerified ? (
        // ========== PIN GATE ==========
        <div className="w-full max-w-sm">
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                🔒 Master PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="ใส่ PIN..."
                className="w-full bg-[#161B22] border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-[#00FFB2] transition-colors"
                autoFocus
                maxLength={10}
              />
              {pinError && (
                <p className="text-red-400 text-sm mt-2 text-center">
                  ❌ {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="w-full bg-[#00FFB2] text-[#0D1117] font-bold py-3 rounded-lg hover:bg-[#00D4FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      ) : (
        // ========== CREATE ROOM / EXISTING ROOM ==========
        <div className="w-full max-w-sm space-y-4">
          {existingRoom ? (
            // --- มีห้องเปิดอยู่แล้ว ---
            <div className="bg-[#161B22] border border-yellow-500/30 rounded-xl p-6 text-center space-y-4">
              <p className="text-yellow-400 text-sm">⚠️ มีห้องเปิดอยู่แล้ว</p>
              <div className="text-5xl font-mono font-bold text-[#00FFB2] tracking-widest">
                {existingRoom.id}
              </div>
              <p className="text-gray-400 text-sm">
                Status: {existingRoom.status}
              </p>

              <button
                onClick={() => router.push(`/mc/${existingRoom.id}`)}
                className="w-full bg-[#00FFB2] text-[#0D1117] font-bold py-3 rounded-lg hover:bg-[#00D4FF] transition-colors"
              >
                กลับเข้าห้องเดิม
              </button>

              <button
                onClick={handleEndAndCreate}
                disabled={isLoading}
                className="w-full bg-transparent border border-red-500/50 text-red-400 font-bold py-3 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'กำลังสร้าง...' : 'จบเกมนี้ + สร้างห้องใหม่'}
              </button>
            </div>
          ) : (
            // --- ไม่มีห้อง → สร้างใหม่ ---
            <div className="bg-[#161B22] border border-gray-700 rounded-xl p-6 text-center space-y-4">
              <p className="text-gray-400">พร้อมเริ่มเกมใหม่!</p>

              <button
                onClick={() => handleCreateRoom(false)}
                disabled={isLoading}
                className="w-full bg-[#00FFB2] text-[#0D1117] font-bold py-4 rounded-lg text-xl hover:bg-[#00D4FF] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'กำลังสร้าง...' : '🎮 สร้างห้องใหม่'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
