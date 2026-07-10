// FILE: components/player/FinalHold.tsx — Player hold screen ระหว่างรอ MC เฉลยอันดับ
// VERSION: B22b-v1 — created; แสดงตอน phase final / final_podium / final_awards (เผยจริงตอน final_ranking เท่านั้น)
// LAST MODIFIED: 10 Jul 2026
// HISTORY: B22b created — กัน player เห็นอันดับ/เงินตัวเองก่อนจอใหญ่ประกาศ
'use client';

interface FinalHoldProps {
  phase: 'final' | 'final_podium' | 'final_awards';
}

const COPY: Record<FinalHoldProps['phase'], { th: string; en: string }> = {
  final: { th: 'ใครคือแชมป์?', en: "Who's the champion?" },
  final_podium: { th: 'กำลังประกาศ 3 อันดับแรก', en: 'Announcing the top 3' },
  final_awards: { th: 'กำลังแจกรางวัลพิเศษ', en: 'Special awards' },
};

export default function FinalHold({ phase }: FinalHoldProps) {
  const copy = COPY[phase] || COPY.final;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <style>{`
        @keyframes fhBlink { 0%,100%{ opacity:.25 } 50%{ opacity:1 } }
        @keyframes fhFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } }
      `}</style>

      <div className="text-xs tracking-[0.2em] mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
        MARKET WARS
      </div>

      <div className="text-6xl mb-3" style={{ animation: 'fhFloat 2s ease-in-out infinite' }}>👀</div>

      <div className="text-3xl font-bold leading-tight" style={{ color: '#00FFB2' }}>ดูจอใหญ่!</div>
      <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Look at the big screen</div>

      <div className="mt-8 text-lg font-semibold text-white">{copy.th}</div>
      <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{copy.en}</div>

      <div className="mt-7 text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
        <span style={{ animation: 'fhBlink 1.2s infinite' }}>●</span>
        <span style={{ animation: 'fhBlink 1.2s infinite', animationDelay: '0.2s' }}> ●</span>
        <span style={{ animation: 'fhBlink 1.2s infinite', animationDelay: '0.4s' }}> ●</span>
      </div>
    </div>
  );
}
