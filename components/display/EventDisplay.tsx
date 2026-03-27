// FILE: components/display/EventDisplay.tsx — Display Event + Event Result
// VERSION: B14-v1 — Event Result: description ตัวใหญ่ตรงกลาง (ไม่ใช่ bar เล็กด้านบน)
// LAST MODIFIED: 27 Mar 2026
// HISTORY: B5 created (inline) | B8R extracted to component | B12-UX compact layout | B14 large centered description
'use client';

import { COMPANIES, EVENTS, GOLDEN_DEALS, RETURN_TABLE } from '@/lib/constants';

interface EventDisplayProps {
  round: number;
  phase: 'event' | 'event_result' | 'golden_deal';
  players: any[];
}

export default function EventDisplay({ round, phase, players }: EventDisplayProps) {

  // === Event Reveal — compact card กลางจอ ===
  if (phase === 'event' && EVENTS[round - 1]) {
    const ev = EVENTS[round - 1];
    return (
      <div className="w-full h-full flex items-center justify-center px-8">
        <div className="bg-[#161b22] rounded-xl p-6 max-w-lg w-full text-center" style={{ border: '1px solid rgba(255,107,107,0.3)' }}>
          {ev.image ? (
            <img src={ev.image!} alt={ev.title} className="w-full rounded-lg mb-3 max-h-40 object-cover" />
          ) : (
            <div className="text-6xl mb-3">{ev.emoji}</div>
          )}
          <h3 className="text-2xl font-bold text-[#FF6B6B] mb-2">{ev.title}</h3>
          <p className="text-base text-gray-300 leading-relaxed">{ev.description}</p>
        </div>
      </div>
    );
  }

  // === Event Result — description ตัวใหญ่ตรงกลาง + 3x2 grid ===
  if (phase === 'event_result' && EVENTS[round - 1]) {
    const ev = EVENTS[round - 1];
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-6 gap-4">
        {/* Event description — ตัวใหญ่ตรงกลาง */}
        <div className="text-center max-w-2xl px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">{ev.emoji}</span>
            <h3 className="text-xl font-bold text-[#FF6B6B]">{ev.title}</h3>
          </div>
          <p className="text-base text-gray-300 leading-relaxed">{ev.description}</p>
        </div>
        {/* Grid 3x2 */}
        <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } } .return-card { opacity: 0; animation: fadeSlideUp 0.4s ease-out forwards; }`}</style>
        <div className="grid grid-cols-3 gap-3 w-full max-w-xl">
          {COMPANIES.map((c, i) => {
            const returnPct = RETURN_TABLE[c.id]?.[round - 1] || 0;
            const isPositive = returnPct >= 0;
            return (
              <div key={c.id} className="return-card rounded-lg p-3 text-center" style={{ animationDelay: `${i * 0.2}s`, background: '#161b22', borderTop: `2px solid ${c.color}` }}>
                <div className="text-xl mb-0.5">{c.icon}</div>
                <div className="text-[10px] font-semibold mb-1" style={{ color: c.color }}>{c.name}</div>
                <div className="text-2xl font-bold font-mono" style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>
                  {isPositive ? '+' : ''}{returnPct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === Golden Deal (placeholder) ===
  if (phase === 'golden_deal') {
    const deal = GOLDEN_DEALS.find((d) => d.round === round);
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">✨</div>
          <p className="text-2xl font-bold text-[#F59E0B]">{deal?.name || 'Golden Deal'}</p>
          <p className="text-base text-gray-400 mt-2">{deal?.description}</p>
        </div>
      </div>
    );
  }

  return null;
}
