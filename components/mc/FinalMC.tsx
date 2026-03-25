// FILE: components/mc/FinalMC.tsx — MC Final Phase
// VERSION: B11-v1 — Awards box + portfolio breakdown + MC script
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B7 created (stats + leaderboard + tip) | B8R extracted to component | B11 awards + portfolio + script

import { STARTING_MONEY, COMPANIES } from '@/lib/constants';
import { calculateAwards } from '@/lib/awards';

interface FinalMCProps {
  players: any[];
}

export default function FinalMC({ players }: FinalMCProps) {
  const sorted = [...players].sort(
    (a, b) => (parseFloat(b.money) || 0) - (parseFloat(a.money) || 0)
  );

  // Stats
  const totalPlayers = players.length;
  const avgReturn =
    totalPlayers > 0
      ? players.reduce((sum, p) => {
          const m = parseFloat(p.money) || STARTING_MONEY;
          return sum + ((m - STARTING_MONEY) / STARTING_MONEY) * 100;
        }, 0) / totalPlayers
      : 0;

  const profitCount = players.filter(
    (p) => (parseFloat(p.money) || 0) > STARTING_MONEY
  ).length;
  const lossCount = players.filter(
    (p) => (parseFloat(p.money) || 0) < STARTING_MONEY
  ).length;

  // Biggest winner
  const biggestWinner = sorted[0];
  const bigWinPct = biggestWinner
    ? (((parseFloat(biggestWinner.money) || 0) - STARTING_MONEY) / STARTING_MONEY) * 100
    : 0;

  // Awards
  const awards = calculateAwards(players);

  return (
    <div className="space-y-3">
      {/* MC Tip — Script for announcing awards */}
      <div className="border-l-4 border-[#FCD34D] bg-[#1a1f2e] rounded-r-lg p-3">
        <p className="text-[#FCD34D] text-sm font-bold mb-2">🎤 Script แจกรางวัล</p>
        <div className="text-gray-400 text-xs space-y-2">
          <p>1. ประกาศ Top 3 นักลงทุนยอดเยี่ยม (อันดับ 3 → 2 → 1)</p>
          <p>2. ประกาศรางวัล "นักวิจัยยอดเยี่ยม 🧠" — ถามเด็ก: "ตอบ quiz ถูกเยอะขนาดนี้ ช่วยให้ตัดสินใจลงทุนดีขึ้นยังไง?"</p>
          <p>3. ประกาศรางวัล "นักลงทุนรอบคอบ 🛡️" — ถามเด็ก: "น้องลงหุ้นกี่ตัว? ทำไมถึงเลือกกระจายแบบนี้?"</p>
          <p className="text-gray-500 italic mt-2">
            💡 รางวัลนักลงทุนรอบคอบ = คนที่ไม่ทุ่มหุ้นตัวเดียว แต่กระจายลงหลายตัว แล้วยังกำไรด้วย — สอนว่า "อย่าใส่ไข่ทุกฟองในตะกร้าใบเดียว" ได้ผลจริง!
          </p>
          <p>4. สรุปบทเรียน 5 ข้อ (ดูด้านล่าง)</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#161b22] rounded-lg p-3 text-center">
          <div className="text-xl font-bold" style={{ color: '#00D4FF' }}>
            {totalPlayers}
          </div>
          <div className="text-xs text-gray-500">Total players</div>
        </div>
        <div className="bg-[#161b22] rounded-lg p-3 text-center">
          <div
            className="text-xl font-bold"
            style={{ color: avgReturn >= 0 ? '#22c55e' : '#ef4444' }}
          >
            {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Avg return</div>
        </div>
        <div className="bg-[#161b22] rounded-lg p-3 text-center">
          <div className="text-xl font-bold" style={{ color: '#FCD34D' }}>
            {biggestWinner?.name || '-'}
          </div>
          <div className="text-xs text-gray-500">
            Biggest winner ({bigWinPct >= 0 ? '+' : ''}{bigWinPct.toFixed(1)}%)
          </div>
        </div>
        <div className="bg-[#161b22] rounded-lg p-3 text-center">
          <span className="text-xl font-bold" style={{ color: '#22c55e' }}>
            {profitCount}
          </span>
          <span className="text-lg text-gray-600 mx-1">/</span>
          <span className="text-xl font-bold" style={{ color: '#ef4444' }}>
            {lossCount}
          </span>
          <div className="text-xs text-gray-500">Profit / Loss</div>
        </div>
      </div>

      {/* === B11: Awards Box === */}
      <div className="bg-[#161b22] rounded-lg p-3 border border-[#FCD34D]/30">
        <div className="text-xs tracking-widest text-[#FCD34D] mb-3">🏅 SPECIAL AWARDS</div>
        {awards.map((award) => (
          <div key={award.id} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{award.emoji}</span>
                <span className="text-sm font-bold text-gray-300">{award.name}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: '#FCD34D' }}>
                {award.winnerName}
              </span>
            </div>
            <div className="text-xs" style={{ color: '#00D4FF' }}>{award.stat}</div>
            <div className="text-xs text-gray-500 mt-0.5">{award.lesson}</div>

            {/* Portfolio breakdown สำหรับนักลงทุนรอบคอบ */}
            {award.portfolioBreakdown && award.portfolioBreakdown.length > 0 && (
              <div className="mt-2 bg-[#0d1117] rounded p-2">
                <div className="text-xs text-gray-500 mb-1">📊 Portfolio ทุกรอบ:</div>
                <div className="space-y-1">
                  {award.portfolioBreakdown.map((rb) => (
                    <div key={rb.round} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 w-6">R{rb.round}</span>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(rb.allocations).map(([name, pct]) => {
                          const company = COMPANIES.find((c) => c.name === name);
                          return (
                            <span
                              key={name}
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: `${company?.color || '#888'}20`,
                                color: company?.color || '#888',
                              }}
                            >
                              {name} {pct}%
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-[#161b22] rounded-lg p-3">
        <div className="text-xs tracking-widest text-gray-500 mb-2">FULL LEADERBOARD</div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {sorted.map((p, i) => {
            const m = parseFloat(p.money) || 0;
            const pct = ((m - STARTING_MONEY) / STARTING_MONEY) * 100;
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div
                key={p.id}
                className="flex justify-between items-center px-2 py-1 border-b border-gray-800/50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm w-6 text-center">
                    {i < 3 ? medals[i] : `${i + 1}`}
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      color: i < 3
                        ? ['#FCD34D', '#D1D5DB', '#FBBF24'][i]
                        : '#9CA3AF',
                      fontWeight: i < 3 ? 700 : 400,
                    }}
                  >
                    {p.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-300">฿{m.toLocaleString()}</span>
                  <span
                    className="text-xs ml-2"
                    style={{ color: pct >= 0 ? '#22c55e' : '#ef4444' }}
                  >
                    {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 บทเรียน */}
      <div className="bg-[#161b22] rounded-lg p-3">
        <div className="text-xs tracking-widest text-gray-500 mb-2">📚 5 บทเรียนการลงทุน</div>
        <div className="text-xs text-gray-400 space-y-1.5">
          <p>1. <strong style={{ color: '#22c55e' }}>กระจายความเสี่ยง = รอดดี</strong> — คนที่ลง 3-4 บริษัทไม่เคยขาดทุนหนัก</p>
          <p>2. <strong style={{ color: '#00D4FF' }}>High Risk = High Return & Loss</strong> — หุ้นเทคขึ้นเยอะ แต่ลงก็เยอะ</p>
          <p>3. <strong style={{ color: '#F59E0B' }}>ฝากอย่างเดียว ปลอดภัยแต่โตไม่ทัน</strong> — PiggyBank+ ไม่เคยลบ แต่ต่ำสุด</p>
          <p>4. <strong style={{ color: '#ef4444' }}>ดีเกินจริง มักไม่จริง</strong> — ระวังดีลที่การันตีกำไร!</p>
          <p>5. <strong style={{ color: '#A855F7' }}>ไม่มีใครเดาถูกทุกรอบ</strong> — ศึกษาข้อมูล กระจายเสี่ยง อดทน</p>
        </div>
      </div>
    </div>
  );
}
