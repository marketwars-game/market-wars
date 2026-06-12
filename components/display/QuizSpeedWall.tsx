// FILE: components/display/QuizSpeedWall.tsx — Speed name-wall for quiz reveal (projector)
// VERSION: B18-v1 — dense chip grid of perfect-score players (ตอบถูกครบ 2 ข้อ), fastest first, cascade reveal
// LAST MODIFIED: 12 Jun 2026
// HISTORY: B18 created (Option D — speed name-wall: เน้นโชว์คนตอบถูกครบให้มากสุด เรียงตามความเร็ว)
'use client';

import { speedKey } from '@/lib/ranking';

interface QuizSpeedWallProps {
  players: any[];
  round: number;
}

const MAX_CHIPS = 48; // กันล้นจอ projector — รอบใหญ่ๆ โชว์เร็วสุด 48 คน

export default function QuizSpeedWall({ players, round }: QuizSpeedWallProps) {
  // คนตอบถูกครบ 2 ข้อในรอบนี้ → เรียงเร็วสุด (ms น้อย) ก่อน, เสมอ → id
  const perfect = players
    .filter((p) => (p.quiz_answered_round || 0) >= round && (p.quiz_correct_this_round || 0) >= 2)
    .map((p) => ({ id: p.id, name: p.name, ms: parseFloat(p.quiz_speed_this_round_ms) || 0 }))
    .sort((a, b) => {
      const d = speedKey(a.ms) - speedKey(b.ms);
      return d !== 0 ? d : (String(a.id) < String(b.id) ? -1 : 1);
    });

  const shown = perfect.slice(0, MAX_CHIPS);
  const fmt = (ms: number) => (ms > 0 ? (ms / 1000).toFixed(1) + 's' : '—');

  if (perfect.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '18px' }}>
          ยังไม่มีใครตอบถูกครบรอบนี้ <span style={{ fontSize: '14px' }}>· no perfect scores yet</span>
        </p>
      </div>
    );
  }

  const medals: Record<number, { bg: string; fg: string; tint: string; bd: string; glow: string }> = {
    0: { bg: '#FFD700', fg: '#3d2f00', tint: 'rgba(255,215,0,0.08)', bd: 'rgba(255,215,0,0.35)', glow: 'rgba(255,215,0,0.45)' },
    1: { bg: '#C0C0C0', fg: '#2b2b2b', tint: 'rgba(192,192,192,0.07)', bd: 'rgba(192,192,192,0.3)', glow: 'rgba(192,192,192,0.4)' },
    2: { bg: '#CD7F32', fg: '#ffffff', tint: 'rgba(205,127,50,0.08)', bd: 'rgba(205,127,50,0.32)', glow: 'rgba(205,127,50,0.45)' },
  };

  return (
    <div className="w-full">
      <style>{`@keyframes mwChipIn { from { opacity:0; transform:translateY(8px) scale(.96) } to { opacity:1; transform:none } }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
        {shown.map((p, i) => {
          const m = medals[i];
          const delay = Math.min(i * 0.04, 2); // cascade: เร็วสุดโผล่ก่อน
          return (
            <div
              key={p.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 12px', borderRadius: '10px',
                background: m ? m.tint : 'rgba(255,255,255,0.03)',
                border: `1px solid ${m ? m.bd : 'rgba(255,255,255,0.09)'}`,
                boxShadow: m ? `0 0 14px ${m.glow}` : 'none',
                opacity: 0,
                animation: 'mwChipIn 0.4s ease-out forwards',
                animationDelay: `${delay}s`,
              }}
            >
              {m ? (
                <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.bg, color: m.fg, fontSize: '13px', fontWeight: 700 }}>{i + 1}</span>
              ) : (
                <span style={{ flexShrink: 0, width: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{i + 1}</span>
              )}
              <span style={{ flex: 1, minWidth: 0, color: '#fff', fontSize: m ? '16px' : '15px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ flexShrink: 0, color: '#7DE3FF', fontSize: '13px', fontWeight: 500 }}>{fmt(p.ms)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
