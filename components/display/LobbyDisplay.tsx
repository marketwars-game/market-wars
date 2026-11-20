// FILE: components/display/LobbyDisplay.tsx — Display lobby (QR + joined players)
// VERSION: B26-fit — ชื่อผู้เล่นย่อขนาดตาม N (3 ระดับ) + scale-to-fit → 148 คนไม่ล้นจอ · N ≤ 40 เหมือนเดิม | prev: B21 — drop zoom prop; fill FitStage box (h-screen style={{zoom}} → w-full h-full)
// LAST MODIFIED: 20 Nov 2026
// HISTORY: B16a-BATCH0 extracted inline lobby from display/page.tsx (qrOpen state moved local) | B19-BATCH2 AnimatedBackdrop | B21 FitStage fit-to-screen (retire CSS zoom) | B26 large-roster fit (chip tiers + useFitScale)
'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import AnimatedBackdrop from '@/components/display/AnimatedBackdrop';
import { useFitScale } from '@/hooks/useFitScale';

export default function LobbyDisplay({ players, roomId, joinUrl }: { players: any[]; roomId: string; joinUrl: string }) {
  const [qrOpen, setQrOpen] = useState(false);
  // ✅ B26: chip ย่อตามจำนวนคน (เดิมขนาดเดียว → 148 คน ~21 แถว ล้นกล่อง) + scale-to-fit กันล้นทุก N
  const n = players.length;
  // ✅ B26: คน join ล่าสุดอยู่บนสุด (Display โหลดเรียงตามเงิน = เท่ากันหมดใน lobby → ลำดับไม่แน่นอน)
  const ordered = [...players].sort((a, b) => String(b.joined_at || '').localeCompare(String(a.joined_at || '')));
  const chip = n <= 40 ? { font: 18, pad: '8px 16px', gap: 8 } : n <= 80 ? { font: 15, pad: '4px 11px', gap: 6 } : n <= 120 ? { font: 13, pad: '2px 8px', gap: 4 } : { font: 12, pad: '1px 7px', gap: 4 };
  const { boxRef, innerRef, scale } = useFitScale([n]);
  return (
    <div className="w-full h-full bg-[#0D1117] text-white overflow-hidden relative">
      <AnimatedBackdrop accent="#00FFB2" accent2="#00D4FF" />

      <div className="relative z-10 h-full flex items-center">
        {/* Left: QR */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center px-12 h-full" style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <div
            className="bg-white rounded-2xl p-4 cursor-pointer mb-5"
            onClick={() => setQrOpen(true)}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            style={{ transition: 'opacity 0.2s' }}
          >
            {joinUrl && <QRCodeSVG value={joinUrl} size={210} />}
            <p className="text-center text-xs text-gray-400 mt-2">กดเพื่อขยาย</p>
          </div>
          <p className="text-3xl font-bold font-mono tracking-[10px] mb-2" style={{ color: '#00D4FF' }}>{roomId}</p>
          <p className="text-base mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>Scan QR หรือพิมพ์รหัสเข้าร่วม</p>
          <p className="text-base font-semibold" style={{ color: '#00D4FF' }}>bit.ly/marketwars</p>
        </div>

        <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Right: Title + Players */}
        <div className="flex-1 flex flex-col justify-between px-12 py-10 h-full" style={{ minWidth: 0 }}>
          <div>
            <h1 className="font-black tracking-widest leading-tight mb-2" style={{ fontSize: '56px', fontFamily: 'monospace' }}>
              <span style={{ color: '#00FFB2' }}>MARKET</span>{' '}
              <span style={{ color: '#00D4FF' }}>WARS</span>
            </h1>
            <p className="text-xl tracking-[3px]" style={{ color: 'rgba(255,255,255,0.65)' }}>The Investment Game</p>
            <div className="mt-3 h-1 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #00FFB2, #00D4FF)' }} />
          </div>
          <div className="flex flex-col" style={{ flex: 1, minHeight: 0, marginTop: 20 }}>
            <div className="flex items-baseline mb-3" style={{ gap: 14 }}>
              <span style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, color: '#00FFB2', fontVariantNumeric: 'tabular-nums' }}>{n}</span>
              <span className="text-sm tracking-[3px]" style={{ color: 'rgba(255,255,255,0.5)' }}>PLAYERS JOINED · ล่าสุดอยู่บน</span>
            </div>
            <div ref={boxRef} className="overflow-hidden mb-3" style={{ flex: 1, minHeight: 0 }}>
              <div ref={innerRef} className="flex flex-wrap content-start" style={{ gap: chip.gap, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                {ordered.map((p) => (
                  <span key={p.id} className="rounded-full font-semibold" style={{ fontSize: chip.font, padding: chip.pad, whiteSpace: 'nowrap', background: 'rgba(0,255,178,0.1)', border: '1px solid rgba(0,255,178,0.3)', color: '#00FFB2' }}>
                    {p.name}
                  </span>
                ))}
                {n === 0 && <p className="text-lg" style={{ color: 'rgba(255,255,255,0.35)' }}>รอผู้เล่นเข้าร่วม...</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Popup */}
      {qrOpen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 cursor-pointer" style={{ background: 'rgba(0,0,0,0.88)', zIndex: 50 }} onClick={() => setQrOpen(false)}>
          <div className="bg-white rounded-2xl p-6">
            {joinUrl && <QRCodeSVG value={joinUrl} size={320} />}
          </div>
          <p className="text-4xl font-bold font-mono tracking-[12px]" style={{ color: '#00D4FF' }}>{roomId}</p>
          <p className="text-2xl font-semibold" style={{ color: '#00D4FF' }}>bit.ly/marketwars</p>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>กดที่ใดก็ได้เพื่อปิด</p>
        </div>
      )}
    </div>
  );
}
