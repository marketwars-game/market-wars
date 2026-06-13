// FILE: components/display/FinalRanking.tsx — Final step ④ Full ranking + teaching overview
// VERSION: B20-v2 — green/red overview + summary stats + strategy icons (all-in vs diversify) + Smart Diversifier badge
// LAST MODIFIED: 13 Jun 2026
// HISTORY: B16d created — split from FinalDisplay; show all players for parents/photos | B16d-v2 responsive cols | B18 compareForRank | B20-v1 teaching redesign: cell green/red tint, header stats bar, strategy classify from portfolio_used, all-in vs diversify insight ranges, 🏅 Smart Diversifier winner badge, 2-line cards, removed photo wording | B20-v2 fix insight text color (was inheriting dark from shell → set explicit white, ≥0.65 brightness)
'use client';

import { useState, useMemo } from 'react';
import { compareForRank } from '@/lib/ranking';
import { calculateAwards } from '@/lib/awards';
import { STARTING_MONEY, COMPANIES } from '@/lib/constants';

interface FinalRankingProps {
  players: any[];
  animate: boolean;
}

type Strat = 'allin' | 'div' | 'mix';

// เกณฑ์จำแนกกลยุทธ์ (mirror lib/awards.ts roundIsDiversified + เพิ่ม all-in)
const ALLIN_SINGLE_PCT = 90;  // ทุ่ม ≥90% กลุ่มเดียว = กระจุก/all-in รอบนั้น
const DIV_MIN_SECTORS = 3;    // กระจาย ≥3 กลุ่ม
const DIV_MAX_SINGLE_PCT = 70;// และไม่ทุ่มเกิน 70%/กลุ่ม

function classifyStrategy(player: any): Strat {
  const rr = player?.round_returns || {};
  let played = 0, conc = 0, divr = 0;
  for (const key of Object.keys(rr)) {
    const pf = rr[key]?.portfolio_used;
    if (!pf) continue;
    const vals = COMPANIES.map((c: any) => parseFloat(pf[c.id]) || 0);
    const maxAlloc = Math.max(...vals, 0);
    if (maxAlloc <= 0) continue; // ไม่ได้ลงทุนรอบนี้ / ไม่มีข้อมูล
    played++;
    const sectorCount = vals.filter((v) => v > 0).length;
    if (maxAlloc >= ALLIN_SINGLE_PCT) conc++;
    if (sectorCount >= DIV_MIN_SECTORS && maxAlloc <= DIV_MAX_SINGLE_PCT) divr++;
  }
  if (played === 0) return 'mix';
  if (conc * 2 > played) return 'allin';  // ทุ่มกระจุกเป็นส่วนใหญ่ของรอบ
  if (divr * 2 > played) return 'div';     // กระจายเป็นส่วนใหญ่ของรอบ
  return 'mix';
}

const fmtPct = (v: number) => (v >= 0 ? '+' : '') + Math.round(v) + '%';
const retOf = (p: any) => ((parseFloat(p.money) || 0) - STARTING_MONEY) / STARTING_MONEY * 100;

export default function FinalRanking({ players, animate }: FinalRankingProps) {
  const [doAnim] = useState(animate); // snapshot ตอน mount

  const view = useMemo(() => {
    const sorted = [...players].sort(compareForRank);
    const n = sorted.length;

    // สรุปภาพรวม (ค่าไว้สอน)
    const greenCount = sorted.filter((p) => (parseFloat(p.money) || 0) >= STARTING_MONEY).length;
    const redCount = n - greenCount;
    const rets = sorted.map(retOf);
    const avg = n ? rets.reduce((a, b) => a + b, 0) / n : 0;
    const maxRet = n ? Math.max(...rets) : 0;
    const minRet = n ? Math.min(...rets) : 0;

    // จำแนกกลยุทธ์รายคน
    const stratOf: Record<string, Strat> = {};
    sorted.forEach((p) => { stratOf[p.id] = classifyStrategy(p); });

    const rangeFor = (s: Strat) => {
      const rs = sorted.filter((p) => stratOf[p.id] === s).map(retOf);
      if (!rs.length) return null;
      return { lo: Math.min(...rs), hi: Math.max(...rs), n: rs.length };
    };
    const aiRange = rangeFor('allin');
    const dvRange = rangeFor('div');

    // ผู้ชนะรางวัลกระจายความเสี่ยง (เปิดเผยใน step ③ แล้ว → โชว์ badge ใน step ④ ได้)
    let winnerIds: string[] = [];
    try {
      const div = calculateAwards(players).find((a) => a.id === 'smart_diversifier');
      if (div) winnerIds = (div.winnerIds && div.winnerIds.length ? div.winnerIds : (div.winnerId ? [div.winnerId] : [])) as string[];
    } catch { winnerIds = []; }

    const cols = Math.min(
      n <= 10 ? 3 : n <= 24 ? 4 : n <= 48 ? 6 : n <= 80 ? 8 : 10,
      Math.max(1, n)
    );

    return { sorted, n, greenCount, redCount, avg, maxRet, minRet, stratOf, aiRange, dvRange, winnerIds, cols };
  }, [players]);

  const { sorted, n, greenCount, redCount, avg, maxRet, minRet, stratOf, aiRange, dvRange, winnerIds, cols } = view;

  const medals = ['🥇', '🥈', '🥉'];
  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const waveTotal = 1100;
  const stEmoji = (s: Strat) => (s === 'allin' ? '🎯' : s === 'div' ? '🧺' : '');

  const cellBg = (i: number, profit: boolean) =>
    i === 0 ? 'linear-gradient(180deg,rgba(255,215,0,0.16),#161b22)' :
    i === 1 ? 'linear-gradient(180deg,rgba(192,192,192,0.11),#161b22)' :
    i === 2 ? 'linear-gradient(180deg,rgba(205,127,50,0.13),#161b22)' :
    profit ? 'rgba(34,197,94,0.09)' : 'rgba(239,68,68,0.09)';
  const cellBorder = (i: number, profit: boolean) =>
    i < 3 ? rankColors[i] : (profit ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.26)');

  return (
    <div className="relative h-screen flex flex-col px-6 pt-12 pb-6 overflow-hidden">
      <style>{`@keyframes mwCellIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* header: title + teaching stats บรรทัดเดียว */}
      <div className="flex items-baseline gap-5 mb-4 flex-wrap">
        <h1 className="text-4xl font-black whitespace-nowrap" style={{ color: '#FCD34D' }}>🏆 อันดับสุดท้าย · FINAL STANDINGS</h1>
        <div className="flex items-baseline gap-5 text-lg font-bold ml-auto whitespace-nowrap">
          <span style={{ color: '#22c55e' }}>🟢 กำไร {greenCount}</span>
          <span style={{ color: '#ef4444' }}>🔴 ขาดทุน {redCount}</span>
          <span style={{ color: 'rgba(255,255,255,0.82)' }}>📊 เฉลี่ย {fmtPct(avg)}</span>
          <span style={{ color: 'rgba(255,255,255,0.82)' }}>↑ {fmtPct(maxRet)}</span>
          <span style={{ color: 'rgba(255,255,255,0.82)' }}>↓ {fmtPct(minRet)}</span>
        </div>
      </div>

      {/* insight: เทียบช่วงผลตอบแทน all-in vs กระจาย (สอน) */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 rounded-lg px-4 py-2.5 text-base truncate" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.92)' }}>
          🎯 <b>ทุ่มหมดหน้าตัก {aiRange ? aiRange.n : 0} คน</b>{aiRange ? ` · ${fmtPct(aiRange.lo)} ถึง ${fmtPct(aiRange.hi)} · เหวี่ยงแรง (โชคล้วน)` : ' · —'}
        </div>
        <div className="flex-1 rounded-lg px-4 py-2.5 text-base truncate" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.92)' }}>
          🧺 <b>กระจายความเสี่ยง {dvRange ? dvRange.n : 0} คน</b>{dvRange ? ` · ${fmtPct(dvRange.lo)} ถึง ${fmtPct(dvRange.hi)} · นิ่งกว่า ฉลาดระยะยาว` : ' · —'}
        </div>
      </div>

      {/* grid: ทุกคน — การ์ด 2 บรรทัด (ชื่ออ่านออก / กลยุทธ์ + %) พื้นเขียว-แดง */}
      <div className="grid gap-2 flex-1 content-start" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {sorted.map((p, i) => {
          const money = parseFloat(p.money) || 0;
          const profit = money >= STARTING_MONEY;
          const win = winnerIds.includes(p.id);
          const s = stratOf[p.id];
          return (
            <div key={p.id} className="rounded-lg px-3 py-2 flex flex-col justify-center gap-0.5"
              style={{
                background: cellBg(i, profit),
                border: win ? '1.5px solid #00FFB2' : `1px solid ${cellBorder(i, profit)}`,
                boxShadow: win ? '0 0 11px rgba(0,255,178,0.45)' : 'none',
                animation: doAnim ? 'mwCellIn 0.4s ease-out both' : 'none',
                animationDelay: doAnim ? `${(i * (waveTotal / Math.max(1, n))).toFixed(0)}ms` : '0ms',
              }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold flex-shrink-0" style={{ fontSize: i < 3 ? '1.15rem' : '0.95rem', color: i < 3 ? rankColors[i] : 'rgba(255,255,255,0.5)' }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </span>
                <span className="flex-1 min-w-0 font-bold text-lg truncate" style={{ color: i < 3 ? rankColors[i] : '#fff' }}>{p.name}</span>
                {win && <span className="flex-shrink-0" style={{ fontSize: '1.05rem' }}>🏅</span>}
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
  );
}
