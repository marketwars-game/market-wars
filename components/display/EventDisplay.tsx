// FILE: components/display/EventDisplay.tsx — Display Event + Event Result
// VERSION: B8R-v1 — Extracted from display/[roomId]/page.tsx
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B5 created (inline) | B8R extracted to component
'use client';

import { COMPANIES, EVENTS, GOLDEN_DEALS, RETURN_TABLE } from '@/lib/constants';

interface EventDisplayProps {
  round: number;
  phase: 'event' | 'event_result' | 'golden_deal';
  players: any[];
}

export default function EventDisplay({ round, phase, players }: EventDisplayProps) {

  // === Event Reveal ===
  if (phase === 'event' && EVENTS[round - 1]) {
    return (
      <div className="mt-8 bg-[#161b22] rounded-xl p-8 border border-[#FF6B6B]/30 max-w-lg mx-auto">
        {EVENTS[round - 1].image ? (
          <img src={EVENTS[round - 1].image!} alt={EVENTS[round - 1].title} className="w-full rounded-lg mb-4 max-h-64 object-cover" />
        ) : (
          <div className="text-7xl mb-4">{EVENTS[round - 1].emoji}</div>
        )}
        <h3 className="text-3xl font-bold text-[#FF6B6B] mb-3">{EVENTS[round - 1].title}</h3>
        <p className="text-lg text-gray-300 leading-relaxed">{EVENTS[round - 1].description}</p>
      </div>
    );
  }

  // === Event Result — stagger animation ===
  if (phase === 'event_result' && EVENTS[round - 1]) {
    return (
      <div className="mt-8 max-w-lg mx-auto">
        <div className="bg-[#161b22] rounded-lg p-3 mb-4 border border-[#FF6B6B]/20 flex items-center gap-3 justify-center">
          <span className="text-2xl">{EVENTS[round - 1].emoji}</span>
          <span className="text-sm text-gray-400">{EVENTS[round - 1].title}</span>
        </div>
        <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } } .return-card { opacity: 0; animation: fadeSlideUp 0.4s ease-out forwards; }`}</style>
        <div className="grid grid-cols-3 gap-3">
          {COMPANIES.map((c, i) => {
            const returnPct = RETURN_TABLE[c.id]?.[round - 1] || 0;
            const isPositive = returnPct >= 0;
            return (
              <div key={c.id} className="return-card bg-[#161b22] rounded-lg p-4 text-center" style={{ animationDelay: `${i * 0.2}s`, borderLeft: `3px solid ${c.color}` }}>
                <div className="text-2xl mb-1">{c.icon}</div>
                <div className="text-xs text-gray-400 mb-1">{c.name}</div>
                <div className="text-2xl font-bold" style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>{isPositive ? '+' : ''}{returnPct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === Golden Deal ===
  if (phase === 'golden_deal') {
    const deal = GOLDEN_DEALS.find((d) => d.round === round);
    if (!deal) return null;
    return (
      <div className="mt-8 bg-[#161b22] rounded-xl p-8 border border-[#F59E0B]/30 max-w-lg mx-auto">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-3xl font-bold text-[#F59E0B] mb-3">{deal.name}</h3>
        <p className="text-lg text-gray-300">{deal.description}</p>
      </div>
    );
  }

  return null;
}
