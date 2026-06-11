// FILE: components/display/SoundGate.tsx — full-screen "tap to enable sound" gate
// VERSION: B16a-v1 — sound foundation
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16a-BATCH1 created — one-time autoplay-unlock overlay (no mute toggle, per design)
'use client';

export default function SoundGate({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div
      onClick={onUnlock}
      className="fixed inset-0 flex flex-col items-center justify-center gap-5 cursor-pointer"
      style={{ background: 'rgba(0,0,0,0.82)', zIndex: 100 }}
    >
      <div style={{ fontSize: '64px' }}>🔊</div>
      <div className="text-3xl font-bold text-white text-center px-6">
        เปิดเสียงเพื่อเริ่ม <span style={{ color: 'rgba(255,255,255,0.55)' }}>·</span> Enable sound
      </div>
      <button
        onClick={onUnlock}
        className="animate-pulse text-xl font-semibold px-8 py-4 rounded-full"
        style={{ background: 'rgba(0,255,178,0.12)', border: '1.5px solid #00FFB2', color: '#00FFB2' }}
      >
        👆 แตะเพื่อเปิดเสียง · Tap for sound
      </button>
      <div className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
        แนะนำให้เปิดก่อนเด็กเข้าห้อง
      </div>
    </div>
  );
}
