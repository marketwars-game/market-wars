// FILE: components/display/FinalAwards.tsx — Final step ③ Special Awards + Dr.Bow twist
// VERSION: B16d-v1 — Top Researcher pills → Smart Diversifier twist (egg/basket) last
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16d created — split from FinalDisplay; staggered reveal + twist confetti; bilingual TH·EN
'use client';

import { useEffect, useState } from 'react';
import { calculateAwards } from '@/lib/awards';
import type { SfxKey } from '@/lib/sound';
import ConfettiCanvas from '@/components/display/ConfettiCanvas';

interface FinalAwardsProps {
  players: any[];
  animate: boolean;
  playSfx?: (k: SfxKey) => void;
}

export default function FinalAwards({ players, animate, playSfx }: FinalAwardsProps) {
  const [doAnim] = useState(animate); // snapshot ตอน mount
  const awards = calculateAwards(players);
  const quizMaster = awards.find((a) => a.id === 'quiz_master');
  const diversifier = awards.find((a) => a.id === 'smart_diversifier');

  const [twistFired, setTwistFired] = useState(0);

  useEffect(() => {
    if (!doAnim) return;
    const t: ReturnType<typeof setTimeout>[] = [];
    if (playSfx) {
      t.push(setTimeout(() => playSfx('sfx_reveal'), 700));   // quiz master card
      t.push(setTimeout(() => { playSfx('sfx_reveal'); playSfx('sfx_confetti'); }, 2200)); // twist
    }
    t.push(setTimeout(() => setTwistFired((n) => n + 1), 2200)); // twist confetti burst
    return () => t.forEach(clearTimeout);
  }, [doAnim, playSfx]);

  const cardAnim = (delay: number) => doAnim
    ? { animation: 'mwAwIn 0.55s cubic-bezier(.2,1.2,.4,1) both', animationDelay: `${delay}s` }
    : {};

  return (
    <div className="relative h-screen flex flex-col items-center justify-start px-10 pt-16 overflow-hidden">
      <style>{`@keyframes mwAwIn { from { opacity:0; transform:translateY(28px) scale(.96) } to { opacity:1; transform:translateY(0) scale(1) } }`}</style>
      <ConfettiCanvas fire={doAnim} nonce={twistFired} scale={0.55} />

      <h1 className="text-5xl font-black mb-10" style={{ color: '#00FFB2', ...(doAnim ? { animation: 'mwAwIn .5s ease-out both' } : {}) }}>
        🏅 รางวัลพิเศษ · Special Awards
      </h1>

      {/* Top Researcher */}
      {quizMaster && quizMaster.winnerId && (
        <div className="w-[80%] max-w-4xl rounded-2xl px-8 py-6 mb-7 flex items-center gap-6"
          style={{ background: '#161b22', border: '1px solid rgba(168,85,247,0.3)', ...cardAnim(0.2) }}>
          <span className="text-6xl">{quizMaster.emoji}</span>
          <div className="flex-1">
            <p className="text-3xl font-bold" style={{ color: '#C084FC' }}>{quizMaster.name}</p>
            <p className="text-lg mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{quizMaster.nameEn} · {quizMaster.stat}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {(quizMaster.winnerNames || [quizMaster.winnerName]).map((n, i) => (
                <span key={i} className="text-xl px-4 py-1.5 rounded-full font-semibold" style={{ background: 'rgba(168,85,247,0.22)', color: '#E9D5FF' }}>{n}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Smart Diversifier — the twist */}
      {diversifier && diversifier.winnerId && (
        <div className="relative w-[80%] max-w-4xl rounded-2xl px-8 py-6 flex items-center gap-6"
          style={{ background: '#161b22', border: '1.5px solid #22c55e', boxShadow: '0 0 40px rgba(34,197,94,0.28)', ...cardAnim(1.6) }}>
          <span className="absolute top-4 right-6 text-base font-bold" style={{ color: '#00FFB2' }}>✨ พี่โบว์เฉลย · Dr.Bow reveals</span>
          <span className="text-6xl">{diversifier.emoji}</span>
          <div className="flex-1">
            <p className="text-3xl font-bold" style={{ color: '#34d399' }}>{diversifier.name}</p>
            <p className="text-lg mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{diversifier.nameEn} · {diversifier.stat}</p>
            <div className="flex gap-3 mt-3 text-4xl">
              <span>🧺🥚</span><span>🧺🥚</span><span>🧺🥚</span>
            </div>
            <p className="text-lg mt-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <b style={{ color: '#00FFB2' }}>"อย่าใส่ไข่ทั้งหมดในตะกร้าใบเดียว"</b> · {diversifier.lessonEn}
            </p>
            <div className="mt-3">
              <span className="text-2xl px-5 py-2 rounded-full font-bold" style={{ background: 'rgba(34,197,94,0.18)', border: '1px solid #22c55e', color: '#fff' }}>{diversifier.winnerName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
