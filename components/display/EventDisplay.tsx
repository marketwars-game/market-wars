// FILE: components/display/EventDisplay.tsx — Display Event + Event Result
// VERSION: B22-v1 — event_result: cumulative price-chart sparkline per sector (shared Y axis, locked X axis 0..TOTAL_ROUNDS, per-year green/red segments, current year draws in). Removed ฿ price + cumulative badge (kids re-allocate each year). CHART_MODE flag ('cumulative' | 'yearly') for post-B23 re-evaluation.
// LAST MODIFIED: 10 Jul 2026
// HISTORY: B5 created (inline) | B8R extracted | B12-UX compact layout | B15-v1 projector polish | B15-v2 dramatic event reveal + big news bar | B19-BATCH4 backdrop + reveal animation + golden deal color fix | B19 icon grow-and-hold bigger | B22 sparkline on event_result (display-only, no DB/API/constants touched)
'use client';

import { COMPANIES, EVENTS, RETURN_TABLE, TOTAL_ROUNDS } from '@/lib/constants';
import AnimatedBackdrop from '@/components/display/AnimatedBackdrop';

interface EventDisplayProps {
  round: number;
  phase: 'event' | 'event_result' | 'golden_deal';
  players: any[];
}

// ==============================================
// ✅ B22 — Sparkline config (display-only, ไม่แตะ lib/constants.ts)
//
// CHART_MODE:
//   'cumulative' = เส้นทางของกลุ่มนั้นตั้งแต่ปี 0 (ทบต้น: 100 × Π(1+rᵢ)) — สอน "หุ้นมีกราฟ" + ทบต้น
//   'yearly'     = % ผลตอบแทนของแต่ละปีล้วนๆ (baseline 0%) — ตรงกลไกเกม (reallocate ทุกปี) แต่ไม่ใช่กราฟราคา
//
// 🔎 ตั้ง 'cumulative' ไว้ก่อน — หลัง B23 (balance pass) ให้เปิดจอปีที่ 6 ดูของจริงบน projector:
//    ถ้าเส้น 🐷 ออมทรัพย์ ยังจบสูงกว่ากลุ่มเสี่ยงจนสอนสวนทาง → พลิกเป็น 'yearly' ได้ที่บรรทัดเดียวนี้
//    (ปัจจุบัน RETURN_TABLE v5c: พลังงาน 114.9 · ออมทรัพย์ 113.7 · อาหาร 113.1 → 🐷 ที่ 2 = โจทย์ของ B23)
// ==============================================
const CHART_MODE: 'cumulative' | 'yearly' = 'cumulative';

const UP_COLOR = '#22c55e';
const DOWN_COLOR = '#ef4444';

// viewBox ของ sparkline (scale ตามความกว้างการ์ด)
const VB_W = 280;
const VB_H = 92;
const PAD_X = 6;
const PAD_Y = 12;

const BASELINE = CHART_MODE === 'cumulative' ? 100 : 0;

/** สร้างชุดข้อมูลของกลุ่มหนึ่ง ตั้งแต่ปี 0 ถึงปี `upto` (ยาว upto+1 จุด) */
function buildSeries(returns: number[], upto: number): number[] {
  if (CHART_MODE === 'yearly') {
    return [0, ...returns.slice(0, upto)];
  }
  const out = [100];
  let price = 100;
  for (let i = 0; i < upto; i++) {
    price = price * (1 + (returns[i] ?? 0) / 100);
    out.push(price);
  }
  return out;
}

export default function EventDisplay({ round, phase, players }: EventDisplayProps) {

  // === Event Reveal — B15-v2: dramatic เต็มจอ + radial glow ===
  if (phase === 'event' && EVENTS[round - 1]) {
    const ev = EVENTS[round - 1];
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <AnimatedBackdrop accent="#FF6B6B" accent2="#FF6B6B" />
        <style>{`
          @keyframes evFade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes evPop { 0% { opacity: 0; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1); } }
          .ev-anim { opacity: 0; animation: evFade 0.6s ease-out forwards; }
          .ev-pop { opacity: 0; animation: evPop 0.55s ease-out forwards; }
        `}</style>

        <div className="text-center z-10 px-12 max-w-3xl w-full">
          {ev.image ? (
            <img src={ev.image} alt={ev.title} className="ev-pop w-full rounded-2xl mb-6 max-h-64 object-cover mx-auto" style={{ maxWidth: '520px', animationDelay: '0.25s' }} />
          ) : (
            <div className="ev-pop mb-6" style={{ fontSize: '10rem', lineHeight: 1, animationDelay: '0.25s' }}>{ev.emoji}</div>
          )}
          <h3 className="ev-anim text-5xl font-black mb-5" style={{ color: '#FF6B6B', animationDelay: '0.6s' }}>{ev.title}</h3>
          <p className="ev-anim text-2xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)', animationDelay: '0.9s' }}>{ev.description}</p>
          <div className="ev-anim mt-8 inline-block px-6 py-2 rounded-full text-base font-semibold" style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.35)', color: '#FF6B6B', animationDelay: '1.2s' }}>
            รอดูผลกระทบ →
          </div>
        </div>
      </div>
    );
  }

  // === Event Result — B22-v1: news bar + sparkline grid 3x2 ===
  if (phase === 'event_result' && EVENTS[round - 1]) {
    const ev = EVENTS[round - 1];

    // --- ชุดข้อมูลทุกกลุ่ม (ปี 0 → ปีปัจจุบัน) ---
    const seriesList = COMPANIES.map((c) => buildSeries(RETURN_TABLE[c.id] ?? [], round));

    // --- แกน Y ร่วมกันทุกใบ (B22-A): เทียบความสูงข้ามการ์ดได้ ---
    const allValues = seriesList.flat();
    let lo = Math.min(BASELINE, ...allValues);
    let hi = Math.max(BASELINE, ...allValues);
    const padV = (hi - lo || 1) * 0.14;
    lo -= padV;
    hi += padV;

    // --- แกน X ล็อก ปี 0..TOTAL_ROUNDS เสมอ (B22-C): เส้นวิ่งเข้าพื้นที่ว่างทุกปี ---
    const xAt = (k: number) => PAD_X + ((VB_W - PAD_X * 2) * k) / TOTAL_ROUNDS;
    const yAt = (v: number) => PAD_Y + (VB_H - PAD_Y * 2) * (1 - (v - lo) / (hi - lo));

    const baselineY = yAt(BASELINE);

    return (
      <div className="w-full h-full flex flex-col">
        {/* News bar */}
        <div className="flex items-center gap-4 px-8 py-4 flex-shrink-0" style={{ background: '#161b22', borderBottom: '2px solid rgba(255,107,107,0.3)' }}>
          <span className="text-4xl flex-shrink-0">{ev.emoji}</span>
          <div>
            <div className="text-2xl font-bold mb-1" style={{ color: '#FF6B6B' }}>{ev.title}</div>
            <div className="text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>{ev.description}</div>
          </div>
        </div>

        {/* Caption — B22-H: กันเข้าใจผิดว่ากราฟคือเงินของตัวเอง */}
        <div className="text-center text-base flex-shrink-0 pt-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {CHART_MODE === 'cumulative'
            ? 'กราฟ = ผลงานของแต่ละกลุ่มตั้งแต่เริ่มเกม (ไม่ใช่เงินของหนู) · เส้นประ = จุดเริ่มต้น'
            : 'กราฟ = ผลตอบแทนของแต่ละกลุ่มในแต่ละปี (ไม่ใช่เงินของหนู) · เส้นประ = 0%'}
        </div>

        {/* Grid 3x2 */}
        <div className="flex-1 flex items-center justify-center px-8">
          <style>{`
            @keyframes b22CardIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes b22Draw { to { stroke-dashoffset: 0; } }
            @keyframes b22DotTravel { from { transform: translate(0px, 0px); } to { transform: translate(var(--dx), var(--dy)); } }
            @keyframes b22DotIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes b22DotPop { 0% { r: 5; } 55% { r: 8.5; } 100% { r: 5; } }
            @keyframes b22PctIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            .b22-card { opacity: 0; animation: b22CardIn 0.35s ease-out forwards; }
            .b22-draw { animation: b22Draw 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s forwards; }
            .b22-dot-g { animation: b22DotTravel 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s forwards; }
            .b22-dot { opacity: 0; animation: b22DotIn 0.2s ease-out 0.35s forwards, b22DotPop 0.4s ease-out 1.05s; }
            .b22-pct { opacity: 0; animation: b22PctIn 0.35s ease-out 1.05s forwards; }
          `}</style>

          <div className="grid grid-cols-3 gap-4 w-full max-w-5xl">
            {COMPANIES.map((c, i) => {
              const rets = RETURN_TABLE[c.id] ?? [];
              const s = seriesList[i];
              const returnPct = rets[round - 1] ?? 0;
              const isPositive = returnPct >= 0;

              const x1 = xAt(round - 1);
              const y1 = yAt(s[round - 1]);
              const x2 = xAt(round);
              const y2 = yAt(s[round]);
              const segLen = Math.hypot(x2 - x1, y2 - y1) || 1;

              return (
                <div
                  key={c.id}
                  className="b22-card rounded-xl px-4 pt-3 pb-2"
                  style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderTopColor: c.color, borderTopWidth: '3px' }}
                >
                  {/* หัวการ์ด: สีกลุ่มอยู่ตรงนี้ (B22-F) ไม่ไปแทรกในกราฟ */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{c.icon}</span>
                    <span className="text-base font-semibold" style={{ color: c.color }}>{c.name}</span>
                  </div>

                  {/* Sparkline */}
                  <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full" style={{ height: 'auto', overflow: 'visible' }}>
                    {/* เส้นประ = จุดเริ่มต้น */}
                    <line x1={PAD_X} y1={baselineY} x2={VB_W - PAD_X} y2={baselineY} stroke="rgba(255,255,255,0.22)" strokeWidth={1.2} strokeDasharray="5 5" />

                    {/* ขีดปี 0..6 — ปีที่ยังไม่ถึงจางกว่า */}
                    {Array.from({ length: TOTAL_ROUNDS + 1 }, (_, k) => (
                      <line key={k} x1={xAt(k)} y1={VB_H - 4} x2={xAt(k)} y2={VB_H} stroke={k <= round ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.14)'} strokeWidth={1.2} />
                    ))}

                    {/* ปีที่ผ่านมา — เขียว/แดง รายปี (settled ไม่ animate) */}
                    {s.slice(1, round).map((v, k) => (
                      <line
                        key={`seg${k}`}
                        x1={xAt(k)} y1={yAt(s[k])} x2={xAt(k + 1)} y2={yAt(v)}
                        stroke={(rets[k] ?? 0) >= 0 ? UP_COLOR : DOWN_COLOR}
                        strokeWidth={2.6} strokeLinecap="round" opacity={0.75}
                      />
                    ))}

                    {/* ปีนี้ — เส้นหนาสุด วาดเข้า 0.7 วิ พร้อมกันทั้ง 6 ใบ */}
                    <line
                      className="b22-draw"
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isPositive ? UP_COLOR : DOWN_COLOR}
                      strokeWidth={4.2} strokeLinecap="round"
                      strokeDasharray={segLen} strokeDashoffset={segLen}
                    />

                    {/* จุดปลายวิ่งตามเส้น แล้วเด้ง */}
                    <g className="b22-dot-g" style={{ ['--dx' as any]: `${x2 - x1}px`, ['--dy' as any]: `${y2 - y1}px` }}>
                      <circle className="b22-dot" cx={x1} cy={y1} r={5} fill={isPositive ? UP_COLOR : DOWN_COLOR} />
                    </g>
                  </svg>

                  {/* % ปีนี้ — ตัวเลขเดียวบนการ์ด (B22-B) */}
                  <div className="b22-pct text-5xl font-bold font-mono leading-none mt-1" style={{ color: isPositive ? UP_COLOR : DOWN_COLOR }}>
                    {isPositive ? '+' : ''}{returnPct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // === Golden Deal ===
  if (phase === 'golden_deal') {
    return (
      <div className="w-full h-full flex items-center justify-center px-8">
        <div className="text-center">
          <div className="text-8xl mb-6">⭐</div>
          <h3 className="text-5xl font-black mb-4" style={{ color: '#FFD700' }}>Golden Deal!</h3>
          <p className="text-2xl" style={{ color: 'rgba(255,255,255,0.75)' }}>โอกาสพิเศษประจำปีนี้</p>
        </div>
      </div>
    );
  }

  return null;
}
