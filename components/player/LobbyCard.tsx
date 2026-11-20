// FILE: components/player/LobbyCard.tsx — จอรอใน lobby ของผู้เล่น + แก้ชื่อตัวเอง
// VERSION: B26 — created
// LAST MODIFIED: 21 Nov 2026
// HISTORY: B26 created — แยกจาก play/[roomId]/page.tsx (lobby block) + เพิ่มปุ่ม "แก้ชื่อ" (PATCH /api/players/name · ใช้ได้เฉพาะตอน lobby)
'use client';

import { useState } from 'react';
import { NAME_EXAMPLE, NAME_HINT, NAME_WARN, looksLikeEventName, formatEventName, nameBlocked } from '@/lib/name-rule';

interface LobbyCardProps {
  playerId: string;
  roomId: string;
  name: string;
  startingMoney: number;
  onRenamed: (newName: string) => void;
}

export default function LobbyCard({ playerId, roomId, name, startingMoney, onRenamed }: LobbyCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    const next = formatEventName(draft, true);
    if (!next) { setError('กรุณาใส่ชื่อ'); return; }
    if (nameBlocked(next)) { setError(NAME_WARN); return; }
    if (next === name) { setEditing(false); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/players/name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, room_id: roomId, name: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || 'แก้ชื่อไม่สำเร็จ ลองอีกครั้ง'); }
      else { onRenamed(data.name || next); setEditing(false); }
    } catch {
      setError('เชื่อมต่อไม่ได้ ลองอีกครั้ง');
    }
    setSaving(false);
  };

  return (
    <div className="bg-[#161b22] rounded-lg p-4 text-center">
      <p className="text-[#00FFB2] font-bold text-lg mb-2">You&apos;re in! 🎉</p>

      {!editing ? (
        <div className="mb-3">
          <p className="text-white text-xl font-bold break-words">{name}</p>
          {!looksLikeEventName(name) && <p className="text-amber-400 text-xs mt-1">{NAME_WARN}</p>}
          <button
            onClick={() => { setDraft(name); setError(''); setEditing(true); }}
            className="mt-2 px-4 py-1.5 rounded-lg text-sm border border-gray-600 text-gray-300 active:bg-gray-800"
          >
            ✏️ แก้ชื่อ · Edit name
          </button>
        </div>
      ) : (
        <div className="mb-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(formatEventName(e.target.value))}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
            maxLength={20}
            placeholder={`เช่น ${NAME_EXAMPLE}`}
            autoFocus
            disabled={saving}
            className="w-full bg-[#0D1117] border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-lg focus:border-[#00FFB2] focus:outline-none"
          />
          <p className="text-gray-500 text-xs mt-1">{NAME_HINT}</p>
          {draft.trim() && !looksLikeEventName(formatEventName(draft, true)) && <p className="text-amber-400 text-xs mt-1">{NAME_WARN}</p>}
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={() => { setEditing(false); setError(''); }} disabled={saving} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400">ยกเลิก</button>
            <button onClick={save} disabled={saving || !draft.trim() || nameBlocked(draft)} className="flex-1 py-2 rounded-lg font-bold text-[#0D1117] bg-[#00FFB2] disabled:opacity-50">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          </div>
        </div>
      )}

      <p className="text-gray-400 text-sm mb-3">Starting money: ฿{startingMoney.toLocaleString()}</p>
      <p className="text-gray-500 text-xs">📺 ดูจอใหญ่เพื่อดูรายชื่อผู้เล่น</p>
      <p className="text-gray-600 text-xs mt-1">รอ MC เริ่มเกม...</p>
    </div>
  );
}
