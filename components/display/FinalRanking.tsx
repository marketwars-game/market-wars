// FILE: components/display/FinalRanking.tsx — Final step ④ Full ranking + teaching overview
// VERSION: B20-v3 — inline benchmark "ghosts" (dynamic from RETURN_TABLE) + scale-to-fit height + Top-3/winner glow
// LAST MODIFIED: 13 Jun 2026
// HISTORY: B16d created — split from FinalDisplay; show all players for parents/photos | B16d-v2 responsive cols | B18 compareForRank | B20-v1 teaching redesign (cell green/red tint, header stats bar, strategy classify from portfolio_used, insight ranges, 🏅 diversifier badge, 2-line cards, removed photo wording) | B20-v2 fix insight text color | B20-v3 replace min–max insight with inline benchmark ghosts computed dynamically from RETURN_TABLE+COMPANIES (best/worst all-in, savings, equal-weight; ranked among real players; blue dashed, no rank #); scale-to-fit height so all N players always fit (useEffect measure + transform, independent of display zoom); Top-3 medal-colored glow + winner green glow override
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { compareForRank } from '@/lib/ranking';
import { calculateAwards } from '@/lib/awards';
import { STARTING_MONEY, COMPANIES, RETURN_TABLE } from '@/lib/constants';

interface FinalRankingProps {
  players: any[];
  animate: boolean;
}

type Strat = 'allin' | 'div' | 'mix';

// เกณฑ์จำแนกกลยุทธ์ (mirror lib/awards.ts roundIsDiversified + เพิ่ม all-in)
const ALLIN_SINGLE_PCT = 90;   // ทุ่ม ≥90% กลุ่มเดียว = กระจุก/all-in รอบนั้น
const DIV_MIN_SECTORS = 3;
const DIV_MAX_SINGLE_PCT = 70;

const fmtPct = (v: number) => (v >= 0 ? '+' : '') + Math.round(v) + '%';
const retOf = (p: any) => ((parseFloat(p.money) || 0) - STARTING_MONEY) / STARTING_MONEY * 100;

function classifyStrategy(player: any): Strat {
  const rr = player?.round_returns || {};
  let played = 0, conc = 0, divr = 0;
  for (const key of Object.keys(rr)) {
    const pf = rr[key]?.portfolio_used;
    if (!pf) continue;
    const vals = (COMPANIES as any[]).map((c) => parseFloat(pf[c.id]) || 0);
    const maxAlloc = Math.max(...vals, 0);
    if (maxAlloc <= 0) continue; // ไม่ได้ลงทุนรอบนี้
    played++;
    const sectorCount = vals.filter((v) => v > 0).length;
    if (maxAlloc >= ALLIN_SINGLE_PCT) conc++;
    if (sectorCount >= DIV_MIN_SECTORS && maxAlloc <= DIV_MAX_SINGLE_PCT) divr++;
  }
  if (played === 0) return 'mix';
  if (conc * 2 > played) return 'allin';
  if (divr * 2 > played) return 'div';
  return 'mix';
}

// ---- Benchmarks — คำนวณ dynamic จาก RETURN_TABLE + COMPANIES (ตลาดล้วน ไม่รวมการ์ด/ควิซ) ----
interface Bench { id: string; label: string; icon: string; money: number; }

function compound(arr: number[]): number {
  let m = STARTING_MONEY;
  for (const r of arr) m *= (1 + (Number(r) || 0) / 100);
  return m;
}
function companyMeta(id: string) {
  const c = (COMPANIES as any[]).find((x) => x.id === id);
  return { name: c?.name ?? id, icon: c?.icon ?? '📊' };
}
function computeBenchmarks(): Bench[] {
  const table = (RETURN_TABLE || {}) as Record<string, number[]>;
  const ids = Object.keys(table);
  if (!ids.length) return [];
  const rounds = table[ids[0]]?.length ?? 0;
  if (!rounds) return [];

  const allin = ids.map((id) => ({ id, money: compound(table[id]) }));
  const best = allin.reduce((a, b) => (b.money > a.money ? b : a));
  const worst = allin.reduce((a, b) => (b.money < a.money ? b : a));

  const eqRounds: number[] = [];
  for (let r = 0; r < rounds; r++) {
    eqRounds.push(ids.reduce((s, id) => s + (Number(table[id][r]) || 0), 0) / ids.length);
  }
  const equalMoney = compound(eqRounds);

  const out: Bench[] = [];
  const bm = companyMeta(best.id);
  out.push({ id: 'bm_best', label: `ทุ่ม${bm.name} (ท็อป)`, icon: bm.icon, money: best.money });

  // ฝากเงินเฉยๆ = ออมทรัพย์ (ถ้ามี sector piggybank และไม่ซ้ำกับ best/worst)
  if (table['piggybank'] && best.id !== 'piggybank' && worst.id !== 'piggybank') {
    const pm = companyMeta('piggybank');
    out.push({ id: 'bm_savings', label: 'ฝากเงินเฉยๆ', icon: pm.icon, money: compound(table['piggybank']) });
  }

  out.push({ id: 'bm_equal', label: 'กระจายเท่ากัน', icon: '🧺', money: equalMoney });

  const wm = companyMeta(worst.id);
  out.push({ id: 'bm_worst', label: `ทุ่ม${wm.name} (แย่)`, icon: wm.icon, money: worst.money });

  return out;
}

const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
const medalGlow = ['rgba(255,215,0,0.55)', 'rgba(192,192,192,0.5)', 'rgba(205,127,50,0.5)'];
const medals = ['🥇', '🥈', '🥉'];

export default function FinalRanking({ players, animate }: FinalRankingProps) {
  const [doAnim] = useState(animate);
  const boxRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const view = useMemo(() => {
    const sortedPlayers = [...players].sort(compareForRank);
    const n = sortedPlayers.length;

    const greenCount = sortedPlayers.filter((p) => (parseFloat(p.money) || 0) >= STARTING_MONEY).length;
    const redCount = n - greenCount;
    const rets = sortedPlayers.map(retOf);
    const avg = n ? rets.reduce((a, b) => a + b, 0) / n : 0;
    const maxRet = n ? Math.max(...rets) : 0;
    const minRet = n ? Math.min(...rets) : 0;

    const stratOf: Record<string, Strat> = {};
    sortedPlayers.forEach((p) => { stratOf[p.id] = classifyStrategy(p); });

    let winnerIds: string[] = [];
    try {
      const div = calculateAwards(players).find((a) => a.id === 'smart_diversifier');
      if (div) winnerIds = (div.winnerIds && div.winnerIds.length ? div.winnerIds : (div.winnerId ? [div.winnerId] : [])) as string[];
    } catch { winnerIds = []; }

    // merge players + benchmark ghosts, sort by money desc (players pre-sorted → stable within ties)
    const benches = computeBenchmarks();
    const combined: any[] = [
      ...sortedPlayers.map((p) => ({ kind: 'p', money: parseFloat(p.money) || 0, p })),
      ...benches.map((b) => ({ kind: 'b', money: b.money, b })),
    ];
    combined.sort((a, b) => b.money - a.money);

    const cols = Math.min(n <= 10 ? 3 : n <= 24 ? 4 : n <= 48 ? 6 : n <= 80 ? 8 : 10, Math.max(1, n));

    return { combined, n, greenCount, redCount, avg, maxRet, minRet, stratOf, winnerIds, cols };
  }, [players]);

  const { combined, n, greenCount, redCount, avg, maxRet, minRet, stratOf, winnerIds, cols } = view;

  // scale-to-fit height — ให้ทุกคนอยู่ครบเสมอ (ทำงานทับ CSS zoom ของ display page ได้ เพราะวัดเป็น px จริง)
  useEffect(() => {
    const fit = () => {
      const box = boxRef.current, g = gridRef.current;
      if (!box || !g) return;
      const avail = box.clientHeight;
      const natural = g.scrollHeight; // ไม่ได้รับผลจาก transform → เป็นความสูงเต็มเสมอ
      const s = natural > avail && natural > 0 ? Math.max(0.5, avail / natural) : 1;
      setScale(s);
    };
    const raf = requestAnimationFrame(fit);
    const t = setTimeout(fit, 150); // เผื่อ emoji/ฟอนต์โหลดเสร็จ
    window.addEventListener('resize', fit);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); window.removeEventListener('resize', fit); };
  }, [combined, cols]);

  const waveTotal = 1100;
  const stEmoji = (s: Strat) => (s === 'allin' ? '🎯' : s === 'div' ? '🧺' : '');
  const cellBg = (i: number, profit: boolean) =>
    i === 0 ? 'linear-gradient(180deg,rgba(255,215,0,0.16),#161b22)' :
    i === 1 ? 'linear-gradient(180deg,rgba(192,192,192,0.11),#161b22)' :
    i === 2 ? 'linear-gradient(180deg,rgba(205,127,50,0.13),#161b22)' :
    profit ? 'rgba(34,197,94,0.09)' : 'rgba(239,68,68,0.09)';
  const cellBorder = (profit: boolean) => (profit ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.26)');

  let rank = 0; // เลขอันดับ — นับเฉพาะผู้เล่นจริง (ghost ไม่กินเลข)

  return (
    <div className="relative h-screen flex flex-col px-6 pt-12 pb-6 overflow-hidden">
      <style>{`@keyframes mwCellIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* header: title + teaching stats บรรทัดเดียว */}
      <div className="flex items-baseline gap-5 mb-3 flex-wrap">
        <h1 className="text-4xl font-black whitespace-nowrap" style={{ color: '#FCD34D' }}>🏆 อันดับสุดท้าย · FINAL STANDINGS</h1>
        <div className="flex items-baseline gap-5 text-lg font-bold ml-auto whitespace-nowrap">
          <span style={{ color: '#22c55e' }}>🟢 กำไร {greenCount}</span>
          <span style={{ color: '#ef4444' }}>🔴 ขาดทุน {redCount}</span>
          <span style={{ color: 'rgba(255,255,255,0.82)' }}>📊 เฉลี่ย {fmtPct(avg)}</span>
          <span style={{ color: 'rgba(255,255,255,0.82)' }}>↑ {fmtPct(maxRet)}</span>
          <span style={{ color: 'rgba(255,255,255,0.82)' }}>↓ {fmtPct(minRet)}</span>
        </div>
      </div>

      {/* grid (measured) — scale เพื่อ fit ความสูง ให้ทุกคนอยู่ครบ */}
      <div ref={boxRef} className="flex-1 overflow-hidden">
        <div ref={gridRef} className="grid gap-2 content-start"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
          {combined.map((item, idx) => {
            // ---- benchmark ghost ----
            if (item.kind === 'b') {
              const b: Bench = item.b;
              const bRet = (b.money - STARTING_MONEY) / STARTING_MONEY * 100;
              return (
                <div key={b.id} className="rounded-lg px-3 py-2 flex flex-col justify-center gap-0.5"
                  style={{ border: '2px dashed #7DD3FC', background: 'rgba(125,211,252,0.08)' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0" style={{ fontSize: '1rem' }}>{b.icon}</span>
                    <span className="flex-1 min-w-0 font-bold truncate" style={{ fontSize: '1.05rem', color: '#BAE6FD' }}>{b.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#7DD3FC', letterSpacing: '0.3px' }}>ถ้าเล่นแบบนี้</span>
                    <span className="font-bold" style={{ fontSize: '0.95rem', color: bRet >= 0 ? '#22c55e' : '#ef4444' }}>
                      {bRet >= 0 ? '▲' : '▼'} {fmtPct(bRet)}
                    </span>
                  </div>
                </div>
              );
            }

            // ---- real player ----
            rank++;
            const i = rank - 1;
            const p = item.p;
            const money = parseFloat(p.money) || 0;
            const profit = money >= STARTING_MONEY;
            const win = winnerIds.includes(p.id);
            const s = stratOf[p.id];

            let border = i < 3 ? `1.5px solid ${rankColors[i]}` : `1px solid ${cellBorder(profit)}`;
            let boxShadow = i < 3 ? `0 0 15px ${medalGlow[i]}` : 'none';
            if (win) { border = '1.5px solid #00FFB2'; boxShadow = '0 0 16px rgba(0,255,178,0.6)'; } // winner เขียวชนะทุกกรณี

            return (
              <div key={p.id} className="rounded-lg px-3 py-2 flex flex-col justify-center gap-0.5"
                style={{
                  background: cellBg(i, profit),
                  border,
                  boxShadow,
                  animation: doAnim ? 'mwCellIn 0.4s ease-out both' : 'none',
                  animationDelay: doAnim ? `${(idx * (waveTotal / Math.max(1, combined.length))).toFixed(0)}ms` : '0ms',
                }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold flex-shrink-0" style={{ fontSize: i < 3 ? '1.15rem' : '0.95rem', color: i < 3 ? rankColors[i] : 'rgba(255,255,255,0.5)' }}>
                    {i < 3 ? medals[i] : `#${i + 1}`}
                  </span>
                  <span className="flex-1 min-w-0 font-bold text-lg truncate" style={{ color: i < 3 ? rankColors[i] : '#fff' }}>{p.name}</span>
                  {win && <span className="flex-shrink-0" style={{ fontSize: '1.25rem', filter: 'drop-shadow(0 0 4px rgba(0,255,178,0.9))' }}>🏅</span>}
                </div>
                <div className="flex items-center gap-2">
                  {s && <span style={{ fontSize: '0.95rem' }}>{stEmoji(s)}</span>}
                  <span className="font-semibold" style={{ fontSize: '0.95rem', color: profit ? '#22c55e' : '#ef4444', letterSpacing: '0.3px' }}>
                    {profit ? '▲' : '▼'} {fmtPct(retOf(p))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* legend */}
      <div className="mt-2 text-center" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
        🎯 ทุ่มกระจุก · 🧺 กระจาย · 🏅 ชนะรางวัลกระจาย · <span style={{ color: '#7DD3FC' }}>▢ กรอบฟ้า = ถ้าเล่นแบบนี้ (ตลาดล้วน ไม่รวมการ์ด/ควิซ)</span>
      </div>
    </div>
  );
}
