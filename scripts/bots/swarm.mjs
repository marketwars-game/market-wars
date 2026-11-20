// FILE: scripts/bots/swarm.mjs — Bot swarm: ผู้เล่นจำลอง N คน join ห้องจริง เพื่อทดสอบ load + หน้าจอ
// VERSION: B26-v3 — ชื่อ bot ตามกติกางาน "ชื่อเล่น.อักษร" (default) + --names mixed | prev: B26-v2 — ชื่อไม่ซ้ำ (ตัดชื่อ ไม่ตัดเลข) · เลียนแบบ client ตามเวอร์ชันที่ deploy (ตรวจจาก /api/players/chance) | prev: B26 created
// LAST MODIFIED: 20 Nov 2026
// HISTORY: B26 created — join/quiz/invest/chance/leaderboard ตาม phase + realtime เหมือนหน้า player + รายงาน latency/integrity
//
// ใช้:  node scripts/bots/swarm.mjs --room ABCD --n 148 --url https://market-wars-five.vercel.app
// flag: --mc auto        bot เดิน phase เอง (default manual = MC กดเอง)
//       --dwell 6        วินาทีที่ค้างแต่ละ phase ที่ไม่มี timer (เฉพาะ --mc auto)
//       --speed 1        ตัวคูณความเร็วของ delay (2 = bot ตอบเร็วขึ้น 2 เท่า)
//       --join-window 45 กระจายการ join ภายในกี่วินาที
//       --no-realtime    ไม่เปิด websocket (poll อย่างเดียว) — ใช้แยกปัญหา realtime ออกจาก API
//       --seed 1         seed ของการสุ่ม (รันซ้ำได้พฤติกรรมเดิม)
//       --prefix ""      ขึ้นต้นชื่อ bot (เช่น "T-") เพื่อแยกจากเด็กจริง
//       --names event    รูปแบบชื่อ: event = "Almond.W" ตามกติกางาน (default) · mixed = ไทย/อังกฤษ/ยาว/อีโมจิ
// ⚠️ ไม่สร้างห้องเอง (POST /api/rooms forceNew จะปิดห้องอื่นทั้งหมด) — สร้างห้องจากหน้า MC ตามปกติ
// ⚠️ ห้ามรันกับห้องงานจริง

import { createClient } from '@supabase/supabase-js';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// ---------- args ----------
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const ROOM = String(arg('room', '')).toUpperCase();
const N = parseInt(arg('n', '148'), 10);
const BASE = String(arg('url', '')).replace(/\/+$/, '');
const MC_AUTO = arg('mc', 'manual') === 'auto';
const DWELL = parseFloat(arg('dwell', '6')) * 1000;
const SPEED = parseFloat(arg('speed', '1'));
const JOIN_WINDOW = parseFloat(arg('join-window', '45')) * 1000;
const REALTIME = !arg('no-realtime', false);
const PREFIX = arg('prefix', '') === true ? '' : String(arg('prefix', ''));
const NAME_STYLE = arg('names', 'event') === 'mixed' ? 'mixed' : 'event';
let seed = parseInt(arg('seed', '1'), 10) || 1;
if (!ROOM || !BASE) { console.error('ต้องระบุ --room และ --url  (ดูหัวไฟล์)'); process.exit(1); }

// ---------- env + constants (อ่านจาก repo — ไม่ hardcode) ----------
function readEnv() {
  const p = join(ROOT, '.env.local');
  const out = { ...process.env };
  if (existsSync(p)) for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}
const env = readEnv();
const SB_URL = env.NEXT_PUBLIC_SUPABASE_URL, SB_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SB_URL || !SB_KEY) { console.error('ไม่พบ NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local'); process.exit(1); }

const constSrc = readFileSync(join(ROOT, 'lib', 'constants.ts'), 'utf8');
const cardBlock = constSrc.slice(constSrc.indexOf('export const CHANCE_CARDS'), constSrc.indexOf('export function getChanceCard'));
const CARD_AMOUNTS = [...cardBlock.matchAll(/amount:\s*(-?\d+)\s*\}/g)].map((m) => parseInt(m[1], 10));
const qb = (k, d) => { const m = constSrc.match(new RegExp(k + ':\\s*(\\d+)')); return m ? parseInt(m[1], 10) : d; };
const QUIZ_BONUS = [qb('CORRECT_0', 0), qb('CORRECT_1', 50), qb('CORRECT_2', 100)];
const TOTAL_ROUNDS = parseInt((constSrc.match(/TOTAL_ROUNDS\s*=\s*(\d+)/) || [])[1] || '6', 10);
const COMPANY_IDS = ['robosnack', 'zoomzoom', 'megafun', 'greenpower', 'piggybank', 'safegold'];
if (CARD_AMOUNTS.length < 2) { console.error('อ่าน CHANCE_CARDS จาก lib/constants.ts ไม่ได้'); process.exit(1); }
// เหมือน getChanceCard() ใน lib/constants.ts
function cardAmount(roomId, round, playerId) {
  let h = 0; const s = `${roomId}-${round}-${playerId}`;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return CARD_AMOUNTS[Math.abs(h) % CARD_AMOUNTS.length];
}

// ---------- utils ----------
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const between = (a, b) => a + rnd() * (b - a);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => performance.now();
const pct = (arr, p) => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); return Math.round(s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]); };

const metrics = {}; // key → { ms: [], err: [], bytes: [] }
function rec(key, ms, err, bytes) {
  const m = (metrics[key] ||= { ms: [], err: [], bytes: [] });
  m.ms.push(ms); if (err) m.err.push(String(err).slice(0, 120)); if (bytes) m.bytes.push(bytes);
}
async function timed(key, fn) {
  const t0 = now();
  try { const r = await fn(); rec(key, now() - t0, r?.error ? (r.error.message || r.error) : null, r?.bytes); return r; }
  catch (e) { rec(key, now() - t0, e?.message || e); return { error: e }; }
}
async function api(path, method, body) {
  const res = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text(); let data = null; try { data = JSON.parse(text); } catch {}
  return { status: res.status, data, bytes: text.length, error: res.ok ? null : `HTTP ${res.status} ${data?.error || ''}` };
}

// ---------- names ----------
// default (--names event): กติกางานจริง "ชื่อเล่น.อักษรแรกชื่อจริง" เช่น Almond.W — ไม่ซ้ำกันทั้งห้อง
// --names mixed: ชุดเดิม (ไทย/อังกฤษ/ยาว/อีโมจิ + เลขท้าย) ไว้กดดัน layout
const NICKS = ['Almond', 'Mint', 'Poon', 'Alex', 'Proud', 'Tonkla', 'Bambi', 'Kevin', 'Namcha', 'Leo', 'Pim', 'Oscar', 'Jinny', 'Max', 'Kaimook', 'Ryu', 'Guitar', 'Pleng', 'Captain', 'Stamp', 'Tonkhao', 'Khaohom', 'Punpun', 'Ingfah', 'Porjai', 'Phupha', 'Tawan', 'Namsai', 'Malee', 'Lookpeach', 'Cheetah', 'Thame', 'Pun', 'Phoom', 'Aioun', 'Jaokha', 'Mind', 'Bew', 'Earth', 'Prim', 'Garfield', 'Chopper', 'Titan', 'Fah', 'Ice', 'Nene', 'Maximilian', 'Peach', 'Sky', 'Win', 'Ploy', 'Beam', 'Jedi', 'Nano', 'Kongphop', 'Nongmind'];
const INITIALS = 'WSPKTCNAJRMBDH';
const TH = ['น้องมายด์', 'ภูผา', 'ใบข้าว', 'ต้นกล้า', 'ปันปัน', 'อิงฟ้า', 'พอใจ', 'ข้าวหอม', 'ไออุ่น', 'เจ้าขา', 'ภูมิ', 'มะลิ', 'ตะวัน', 'น้ำใส', 'กัปตัน', 'เพลงพิณ', 'ธาม', 'ปุณณ์', 'ชีต้าร์', 'ลูกพีช'];
const EN = ['Mint', 'Poon', 'Alex', 'Proud', 'Tonkla', 'Bambi', 'Kevin', 'Namcha', 'Leo', 'Pim', 'Oscar', 'Jinny', 'Max', 'Kaimook', 'Ryu'];
const LONG = ['กัปตันอเมริกาตัวจริง', 'Maximilian-Alexander', 'น้องข้าวปุ้นป.5/2ภูเก็ต', 'PhuketSuperInvestor9', 'เด็กชายภูผา ใจดีมาก'];
const usedNames = new Set();
function makeName(i) {
  if (NAME_STYLE === 'mixed') {
    const r = rnd();
    let base = r < 0.06 ? pick(LONG) : r < 0.66 ? pick(TH) : pick(EN);
    if (rnd() < 0.08) base += pick(['🔥', '⭐', '🦄', '😎']);
    const tail = ' ' + (i + 1);
    return (PREFIX + base).slice(0, 20 - tail.length) + tail; // API จำกัด 20 ตัว · ตัดชื่อ ไม่ตัดเลขท้าย
  }
  for (let t = 0; t < 500; t++) { // ชื่อซ้ำ = API ถือเป็นคนเดิม (bot จะใช้แถวเดียวกัน) → ต้องไม่ซ้ำ
    const name = (PREFIX + pick(NICKS) + '.' + INITIALS[Math.floor(rnd() * INITIALS.length)]).slice(0, 20);
    if (!usedNames.has(name)) { usedNames.add(name); return name; }
  }
  return (PREFIX + 'Bot' + (i + 1) + '.X').slice(0, 20);
}

// ---------- bot ----------
const PROFILES = ['diversifier', 'diversifier', 'mixed', 'mixed', 'allin', 'saver', 'slow', 'noshow'];
function makePortfolio(profile) {
  const p = {};
  if (profile === 'allin') { p[pick(COMPANY_IDS.slice(0, 4))] = 100; return p; }
  if (profile === 'saver') { p.piggybank = 60; p.safegold = 40; return p; }
  const k = profile === 'diversifier' ? 5 : 3;
  const ids = [...COMPANY_IDS].sort(() => rnd() - 0.5).slice(0, k);
  let left = 10; // หน่วยละ 10%
  ids.forEach((id, i) => { const u = i === ids.length - 1 ? left : Math.max(1, Math.min(left - (ids.length - 1 - i), Math.round(between(1, 10 / k + 1.5)))); p[id] = u * 10; left -= u; });
  return p;
}

const shared = { phase: null, round: 0, phaseFirstSeen: {}, stop: false };
const rt = { phaseLat: [], missed: 0, disconnects: 0, subscribed: 0, resultsLat: [], resultsMissed: 0 };

class Bot {
  constructor(i) {
    this.i = i; this.name = makeName(i); this.profile = pick(PROFILES);
    this.sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    this.me = null; this.seenKey = null; this.acted = new Set(); this.expected = {}; // round → { quiz, card }
    this.pendingResults = null;
  }
  async join() {
    const r = await timed('join  POST /api/players', () => api('/api/players', 'POST', { name: this.name, room_id: ROOM, force_reconnect: true }));
    if (!r.data?.player) return false;
    this.me = r.data.player;
    // mount fetch เหมือนหน้า player (rooms + players ทั้งห้อง)
    const room = await timed('mount select rooms', async () => this.sb.from('rooms').select('*').eq('id', ROOM).single());
    if (B26) await this.freshMe('mount select me');
    else await timed('mount select players *', async () => { const q = await this.sb.from('players').select('*').eq('room_id', ROOM).order('joined_at', { ascending: true }); return { error: q.error, bytes: JSON.stringify(q.data || []).length }; });
    if (B26) this.pollTimer = setInterval(() => { if (!shared.stop) timed('poll  select rooms (10s fallback)', async () => this.sb.from('rooms').select('*').eq('id', ROOM).single()); }, 9000 + Math.random() * 2000);
    if (REALTIME) this.subscribe();
    if (room.data) this.onRoom(room.data, 'mount');
    return true;
  }
  subscribe() {
    let wasUp = false;
    this.sb.channel(`player-room-${ROOM}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${ROOM}` }, (p) => this.onRoom(p.new, 'rt'))
      .subscribe((s) => { if (s === 'SUBSCRIBED') { if (!wasUp) rt.subscribed++; wasUp = true; } else if (wasUp && (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' || s === 'CLOSED') && !shared.stop) { rt.disconnects++; wasUp = false; rt.subscribed--; } });
    this.sb.channel(`player-me-${this.me.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players', filter: `id=eq.${this.me.id}` }, (p) => this.onMe(p.new, 'rt'))
      .subscribe();
  }
  onMe(row, via) {
    this.me = { ...this.me, ...row };
    const pr = this.pendingResults;
    if (pr && row.round_returns && row.round_returns[String(pr.round)]) {
      rt.resultsLat.push(now() - pr.t0); if (via !== 'rt') rt.resultsMissed++; // missed = ได้ผลผ่าน fallback ไม่ใช่ realtime
      this.pendingResults = null;
    }
  }
  onRoom(room, via) {
    if (!room?.current_phase) return;
    const key = `${room.current_round}:${room.current_phase}`;
    if (this.seenKey === key) return;
    this.seenKey = key;
    const t = now();
    if (!shared.phaseFirstSeen[key]) { shared.phaseFirstSeen[key] = t; shared.phase = room.current_phase; shared.round = room.current_round; logPhase(room); }
    if (via === 'rt') rt.phaseLat.push(t - shared.phaseFirstSeen[key]);
    else if (via === 'poll' && REALTIME) rt.missed++; // realtime ไม่ส่งถึง bot นี้ภายในรอบ poll
    this.act(room.current_phase, room.current_round).catch((e) => rec('bot error', 0, e?.message || e));
  }
  async freshMe(label) {
    const q = await timed(label, async () => this.sb.from('players').select('*').eq('id', this.me.id).single());
    if (q.data) this.onMe(q.data, 'poll');
  }
  async act(phase, round) {
    const k = `${round}:${phase}`; if (this.acted.has(k)) return; this.acted.add(k);
    const exp = (this.expected[round] ||= { quiz: 0, card: 0 });
    const slow = this.profile === 'slow' ? 1.6 : 1;
    const wait = (a, b) => sleep((between(a, b) * 1000 * slow) / SPEED);
    if (phase === 'results') this.pendingResults = { round, t0: now() };
    if (B26 && phase !== 'lobby') { // เหมือน client B26: ดึงแถวตัวเองหลัง phase เปลี่ยน (+ลองซ้ำตอน results)
      (async () => {
        await sleep(1500 + Math.random() * 1500);
        for (let t = 0; t < 6; t++) {
          await this.freshMe('me    refetch after phase');
          if (phase !== 'results' || !this.pendingResults || this.pendingResults.round !== round) break;
          await sleep(3000);
        }
      })();
    }
    if (this.profile === 'noshow' && phase !== 'lobby') return; // join แล้วหาย (ไม่ตอบ/ไม่ลงทุน)

    if (phase === 'research') {
      const d = between(8, 70) * slow; await sleep((d * 1000) / SPEED);
      if (shared.phase !== 'research' || shared.round !== round) return; // หมดเวลา
      const r = rnd(); const correct = r < 0.75 ? 2 : r < 0.95 ? 1 : 0;
      const res = await timed('quiz  POST /api/players/quiz', () => api('/api/players/quiz', 'POST', { player_id: this.me.id, room_id: ROOM, round, correct_count: correct, elapsed_ms: Math.round(d * 1000) }));
      if (!res.error) exp.quiz = QUIZ_BONUS[correct];
    } else if (phase === 'invest') {
      await wait(10, 100);
      if (shared.phase !== 'invest' || shared.round !== round) return;
      await timed('invest PATCH /api/players/portfolio', () => api('/api/players/portfolio', 'PATCH', { player_id: this.me.id, room_id: ROOM, portfolio: makePortfolio(this.profile) }));
    } else if (phase === 'chance_card') {
      await wait(1, 20);
      if (shared.phase !== 'chance_card' || shared.round !== round) return;
      const amount = cardAmount(ROOM, round, this.me.id);
      // B26-F: ลอง API ใหม่ก่อน · 404/405 = โค้ดเก่า (เขียน DB ตรงจาก client เหมือน ChanceCard.tsx เดิม)
      const r = B26 ? await timed('chance POST /api/players/chance', () => api('/api/players/chance', 'POST', { player_id: this.me.id, room_id: ROOM, round })) : { status: 404 };
      if (r.status === 404) {
        if (!REALTIME) await this.freshMe('chance select me (no-rt)');
        const money = parseFloat(this.me.money) || 0; // stale ถ้า realtime โบนัส quiz ยังมาไม่ถึง = บั๊ก P4 ของจริง
        const q = await timed('chance UPDATE players (legacy client write)', async () => this.sb.from('players').update({ money: money + amount, duel_money_change: amount, duel_submitted_round: round }).eq('id', this.me.id));
        if (!q.error) exp.card = amount;
      } else if (!r.error) exp.card = amount;
    } else if (phase === 'results' && !B26) {
      await sleep(6000);
      if (this.pendingResults?.round === round) await this.freshMe('results fallback select me');
    } else if (B26 ? (phase === 'leaderboard' || phase === 'final') : (phase === 'leaderboard' || phase.startsWith('final'))) {
      await sleep(Math.random() * (B26 ? (phase === 'final' ? 3000 : 2000) : 800)); // jitter เหมือนหน้า player ของเวอร์ชันนั้น
      await timed('list  select players (leaderboard/final)', async () => { const q = await this.sb.from('players').select('id, name, money, round_returns, quiz_score, quiz_speed_ms').eq('room_id', ROOM).order('joined_at', { ascending: true }); return { error: q.error, bytes: JSON.stringify(q.data || []).length }; });
    }
  }
}

function logPhase(room) { console.log(`[${new Date().toLocaleTimeString('th-TH')}] ▶ ปี ${room.current_round} · ${room.current_phase}`); }

// ---------- MC auto ----------
const TIMED = { research: 90, invest: 120, chance_card: 30 };
async function mcAuto() {
  const post = (body) => timed(`mc    POST /api/game/phase (${body.action})`, () => api('/api/game/phase', 'POST', { room_id: ROOM, ...body }));
  await sleep(3000);
  let r = await post({ action: 'start' });
  if (r.error) console.log('  start:', r.error, '(ห้องอาจเริ่มไปแล้ว — เดินต่อ)');
  for (;;) {
    const ph = r.data?.current_phase || shared.phase;
    if (!ph || shared.stop) return;
    if (ph === 'final') break;
    const dwell = TIMED[ph] ? (TIMED[ph] * 1000) / SPEED + 3000 : (ph === 'results' ? Math.max(DWELL, 9000) : DWELL); // phase มี timer = รอเท่า timer จริง
    await sleep(dwell);
    const t0 = now(); r = await post({ action: 'next' });
    if (r.data?.current_phase === 'results' || r.data?.current_phase === 'research_reveal') rec(`mc    → ${r.data.current_phase} (รวมคำนวณทั้งห้อง)`, now() - t0);
    if (r.error) { console.log('  next error:', r.error); return; }
  }
  for (const step of ['final_podium', 'final_awards', 'final_ranking']) { await sleep(Math.max(DWELL, 8000)); await post({ action: 'set', phase: step }); }
  await sleep(8000);
}

// ---------- main ----------
const sbMain = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
const { data: room0, error: e0 } = await sbMain.from('rooms').select('*').eq('id', ROOM).single();
if (e0 || !room0) { console.error(`ไม่พบห้อง ${ROOM} — สร้างห้องจากหน้า MC ก่อน`); process.exit(1); }
const { count: existing } = await sbMain.from('players').select('id', { count: 'exact', head: true }).eq('room_id', ROOM);
console.log(`\nMarket Wars bot swarm · ห้อง ${ROOM} (${room0.status}/${room0.current_phase}) · มีผู้เล่นอยู่แล้ว ${existing ?? 0} คน`);
console.log(`bots ${N} · url ${BASE} · realtime ${REALTIME ? 'on' : 'off'} · mc ${MC_AUTO ? 'auto' : 'manual'} · speed ×${SPEED}`);
console.log('เริ่มใน 5 วินาที (Ctrl+C เพื่อยกเลิก)…'); await sleep(5000);
if (room0.status === 'finished') { console.error('ห้องนี้จบแล้ว'); process.exit(1); }

// โค้ดที่ deploy เป็น B26 หรือยัง? (มี /api/players/chance) → bot เลียนแบบ client ให้ตรงเวอร์ชัน
const probe = await api('/api/players/chance', 'POST', {}).catch(() => ({ status: 0 }));
if (probe.status === 401 || probe.status === 403) { console.error(`URL นี้ตอบ HTTP ${probe.status} — น่าจะติด Vercel Deployment Protection (preview) bot เข้าไม่ได้`); process.exit(1); }
const B26 = probe.status === 400;
console.log(`client mode: ${B26 ? 'B26 (chance API · own-row mount · poll fallback)' : 'B25 (legacy)'}`);

const bots = Array.from({ length: N }, (_, i) => new Bot(i));
const tJoin = now();
const joined = (await Promise.all(bots.map(async (b) => { await sleep(rnd() * JOIN_WINDOW); return b.join(); }))).filter(Boolean).length;
console.log(`join เสร็จ ${joined}/${N} ใน ${((now() - tJoin) / 1000).toFixed(1)} วิ · realtime subscribed ${rt.subscribed}`);
const live = bots.filter((b) => b.me);

// poll กลาง 1 ตัว/2.5 วิ → ส่งให้ทุก bot (จับ phase ที่ realtime ไม่ส่ง) + ตรวจจบเกม
let finishedAt = 0;
const poller = setInterval(async () => {
  const { data } = await sbMain.from('rooms').select('*').eq('id', ROOM).single();
  if (!data) return;
  const key = `${data.current_round}:${data.current_phase}`;
  const first = shared.phaseFirstSeen[key];
  if (!first) { shared.phaseFirstSeen[key] = now(); shared.phase = data.current_phase; shared.round = data.current_round; logPhase(data); }
  if (!REALTIME || (first && now() - first > 4000)) live.forEach((b) => b.onRoom(data, 'poll'));
  if (data.current_phase === 'final_ranking' && !finishedAt) finishedAt = now();
}, 2500);

if (MC_AUTO) mcAuto(); else console.log('รอ MC กดเดินเกมจากหน้า MC … (จบที่ final_ranking หรือกด Ctrl+C เพื่อออกรายงาน)');
let reported = false;
process.on('SIGINT', () => { report().then(() => process.exit(0)); });
while (!finishedAt || now() - finishedAt < 6000) await sleep(1000);
await report(); process.exit(0);

// ---------- report ----------
async function report() {
  if (reported) return; reported = true; shared.stop = true; clearInterval(poller);
  const { data: rows } = await sbMain.from('players').select('id, name, money, round_returns, quiz_score').eq('room_id', ROOM);
  // integrity: เงินที่เข้าระหว่างรอบ (money_before(r) − money_after(r−1)) ต้องเท่ากับ โบนัส quiz + การ์ด ที่ bot ทำจริง
  const bad = []; let checked = 0;
  for (const b of live) {
    const row = rows?.find((x) => x.id === b.me.id); if (!row) { bad.push({ name: b.name, issue: 'ไม่พบแถวใน DB' }); continue; }
    const rr = row.round_returns || {}; let prev = 10000;
    for (let r = 1; r <= TOTAL_ROUNDS; r++) {
      const cur = rr[String(r)]; if (!cur) break;
      const flow = cur.money_before - prev, exp = (b.expected[r]?.quiz || 0) + (b.expected[r]?.card || 0); checked++;
      if (Math.abs(flow - exp) > 0.5) bad.push({ name: b.name, round: r, got: flow, expected: exp, quiz: b.expected[r]?.quiz || 0, card: b.expected[r]?.card || 0 });
      prev = cur.money_after;
    }
  }
  const table = Object.entries(metrics).sort().map(([k, m]) => ({ op: k, n: m.ms.length, err: m.err.length, p50: pct(m.ms, 50), p95: pct(m.ms, 95), max: Math.round(Math.max(0, ...m.ms)), kB: m.bytes.length ? Math.round(pct(m.bytes, 50) / 1024) : '' }));
  const realtime = {
    enabled: REALTIME, subscribedAtEnd: rt.subscribed, disconnects: rt.disconnects,
    phaseEvents: rt.phaseLat.length, phaseSpread_p50: pct(rt.phaseLat, 50), phaseSpread_p95: pct(rt.phaseLat, 95), phaseSpread_max: Math.round(Math.max(0, ...rt.phaseLat)),
    phaseMissed_viaPoll: rt.missed,
    resultsRow_p50: pct(rt.resultsLat, 50), resultsRow_p95: pct(rt.resultsLat, 95), resultsRow_max: Math.round(Math.max(0, ...rt.resultsLat)), resultsRow_missed: rt.resultsMissed,
  };
  console.log('\n===== API / DB (ms) ====='); console.table(table);
  console.log('===== Realtime (ms) ====='); console.table([realtime]);
  console.log(`===== Integrity ===== ตรวจ ${checked} รอบ-คน · ผิด ${bad.length}`); if (bad.length) console.table(bad.slice(0, 15));
  const errs = Object.fromEntries(Object.entries(metrics).filter(([, m]) => m.err.length).map(([k, m]) => [k, [...new Set(m.err)].slice(0, 5)]));
  if (Object.keys(errs).length) { console.log('===== Errors (ตัวอย่าง) ====='); console.log(errs); }
  const dir = join(ROOT, 'scripts', 'bots', 'reports'); mkdirSync(dir, { recursive: true });
  const file = join(dir, `${ROOM}-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`);
  writeFileSync(file, JSON.stringify({ client: B26 ? 'B26' : 'B25', room: ROOM, url: BASE, n: N, joined: live.length, mc: MC_AUTO ? 'auto' : 'manual', speed: SPEED, at: new Date().toISOString(), table, realtime, integrity: { checked, bad }, errors: errs, profiles: live.reduce((a, b) => ((a[b.profile] = (a[b.profile] || 0) + 1), a), {}) }, null, 2));
  console.log('\nรายงาน:', file);
  live.forEach((b) => clearInterval(b.pollTimer));
  await Promise.all(live.map((b) => b.sb.removeAllChannels().catch(() => {})));
}
