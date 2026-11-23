# FILE: scripts/display-sweep/sweep.py — ตรวจจอ Display ทุกขนาดห้อง (ไม่ล้น / ไม่ถูกตัด / ไม่หดไปกองกลางจอ)
# VERSION: B26 — created (23 Nov 2026)
# HISTORY: B26 created — หลังงาน Phuket: จอ Final ที่ 97 คนหดเหลือ ~70% กลางจอ เพราะทดสอบแค่ 50/74/148 → sweep ทุก N
# ใช้ผ่าน run.sh (ต้องมี python playwright + chromium) · ผลลัพธ์: ตารางรายการที่ไม่ผ่าน + รูปใน /tmp/sweep
import sys, json, os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('SWEEP_URL', 'http://localhost:3111/b26preview')
OUT = os.environ.get('SWEEP_OUT', '/tmp/sweep'); os.makedirs(OUT, exist_ok=True)
SCREENS = (sys.argv[1] if len(sys.argv) > 1 else 'final_ranking,invest,chance_card,results,leaderboard,lobby').split(',')
lo, hi, step = [int(x) for x in (sys.argv[2] if len(sys.argv) > 2 else '1:200:1').split(':')]
WAIT = {'final_ranking': 500, 'results': 2600, 'leaderboard': 2600}

CHECK = """() => {
  const W = 1280, H = 720, out = { clipped: 0, offstage: 0 };
  const isHidden = (cs) => /(hidden|clip)/.test(cs.overflowX + cs.overflowY + cs.overflow);
  const leaves = [...document.querySelectorAll('body *')].filter((el) => {
    if ([...el.childNodes].every((n) => n.nodeType !== 3 || !n.textContent.trim())) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
  });
  for (const el of leaves) {
    const r = el.getBoundingClientRect();
    if (r.bottom > H + 1 || r.right > W + 1 || r.left < -1 || r.top < -1) out.offstage++;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a); if (!isHidden(cs)) continue;
      if (cs.textOverflow === 'ellipsis') break;               // ตัดชื่อด้วย … = ตั้งใจ
      const ar = a.getBoundingClientRect();
      if (r.bottom > ar.bottom + 2 || r.top < ar.top - 2) { out.clipped++; break; }   // ถูกตัดแนวตั้ง = ข้อมูลหาย
    }
  }
  // กริดหลัก = display:grid ที่ลูกเยอะสุด
  let grid = null, best = 1;
  for (const el of document.querySelectorAll('body *')) { if (getComputedStyle(el).display === 'grid' && el.children.length > best) { best = el.children.length; grid = el; } }
  if (grid) {
    const gr = grid.getBoundingClientRect(), pr = grid.parentElement.getBoundingClientRect();
    out.cells = best;
    out.scale = +(gr.width / Math.max(1, grid.offsetWidth)).toFixed(2);
    out.widthFill = +(gr.width / Math.max(1, pr.width)).toFixed(2);
    out.heightFill = +(gr.height / Math.max(1, pr.height)).toFixed(2);
    const fs = [...grid.querySelectorAll('span')].map((s) => parseFloat(getComputedStyle(s).fontSize) * out.scale).filter((x) => x > 0);
    out.minFont = fs.length ? +Math.min(...fs).toFixed(1) : null;
  }
  const names = [...document.querySelectorAll('span')].filter((s) => getComputedStyle(s).textOverflow === 'ellipsis');
  out.names = names.length; out.namesCut = names.filter((s) => s.scrollWidth > s.clientWidth + 1).length;
  return out;
}"""

rows, bad = [], []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 720})
    for v in SCREENS:
        for n in range(lo, hi + 1, step):
            pg.goto(f'{BASE}?v={v}&n={n}', wait_until='networkidle', timeout=90000)
            pg.wait_for_timeout(WAIT.get(v, 500))
            r = pg.evaluate(CHECK); r.update(screen=v, n=n)
            why = []
            if r['clipped']: why.append(f"clipped {r['clipped']}")
            if r['offstage']: why.append(f"offstage {r['offstage']}")
            if r.get('widthFill') is not None and r['cells'] >= 12 and r['widthFill'] < 0.9: why.append(f"widthFill {r['widthFill']}")
            if r.get('minFont') is not None and r['minFont'] < 9: why.append(f"minFont {r['minFont']}")
            r['why'] = ', '.join(why); rows.append(r)
            if why:
                bad.append(r); pg.screenshot(path=f'{OUT}/FAIL-{v}-{n}.png')
    b.close()
json.dump(rows, open(f'{OUT}/sweep.json', 'w'))
print(f'checked {len(rows)} pages · failed {len(bad)}')
for v in SCREENS:
    f = [r for r in bad if r['screen'] == v]
    if not f: print(f'  {v}: OK'); continue
    ns = [r['n'] for r in f]
    print(f'  {v}: FAIL at n={ns[0]}..{ns[-1]} ({len(ns)} sizes) e.g. n={f[0]["n"]}: {f[0]["why"]}')
