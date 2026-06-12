// FILE: components/display/LobbyDisplay.tsx — Display lobby (QR + joined players)
// VERSION: B19-v2 — AnimatedBackdrop (Network+Grid) replaces static radial glows
// LAST MODIFIED: 13 Jun 2026
// HISTORY: B16a-BATCH0 extracted inline lobby from display/page.tsx (qrOpen state moved local) | B19-BATCH2 AnimatedBackdrop
'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import AnimatedBackdrop from '@/components/display/AnimatedBackdrop';

export default function LobbyDisplay({ players, roomId, joinUrl, zoom }: { players: any[]; roomId: string; joinUrl: string; zoom: number }) {
  const [qrOpen, setQrOpen] = useState(false);
  return (
    <div className="h-screen bg-[#0D1117] text-white overflow-hidden relative" style={{ zoom }}>
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
        <div className="flex-1 flex flex-col justify-between px-12 py-10 h-full">
          <div>
            <h1 className="font-black tracking-widest leading-tight mb-2" style={{ fontSize: '56px', fontFamily: 'monospace' }}>
              <span style={{ color: '#00FFB2' }}>MARKET</span>{' '}
              <span style={{ color: '#00D4FF' }}>WARS</span>
            </h1>
            <p className="text-xl tracking-[3px]" style={{ color: 'rgba(255,255,255,0.65)' }}>The Investment Game</p>
            <div className="mt-3 h-1 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #00FFB2, #00D4FF)' }} />
          </div>
          <div>
            <p className="text-sm tracking-[3px] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>PLAYERS JOINED</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {players.map((p) => (
                <span key={p.id} className="px-4 py-2 rounded-full text-lg font-semibold" style={{ background: 'rgba(0,255,178,0.1)', border: '1px solid rgba(0,255,178,0.3)', color: '#00FFB2' }}>
                  {p.name}
                </span>
              ))}
              {players.length === 0 && <p className="text-lg" style={{ color: 'rgba(255,255,255,0.35)' }}>รอผู้เล่นเข้าร่วม...</p>}
            </div>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>{players.length} players joined</p>
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
