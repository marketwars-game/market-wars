// FILE: lib/sound.ts — Display sound registry (18 assets) + phase→BGM map
// VERSION: B16d-v1 — research_reveal → bgm_results; final steps BGM (suspense→final)
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16a-BATCH1 created — 5 BGM loops + 13 SFX one-shots + PHASE_BGM map | B16d research_reveal mood + final_podium/awards/ranking BGM
//
// ไฟล์เสียงทั้งหมดวางที่ /public/sounds/<name>.mp3 (ตั้งชื่อให้ตรง key เป๊ะ)
// โค้ด graceful: ถ้าไฟล์ไหนยังไม่มา จะเงียบเฉยๆ ไม่พัง

export const SOUND_BASE = '/sounds';

// ---- BGM (background loops) ----
export type BgmKey =
  | 'bgm_lobby'
  | 'bgm_play'
  | 'bgm_suspense'
  | 'bgm_results'
  | 'bgm_final';

export const BGM_FILES: Record<BgmKey, string> = {
  bgm_lobby: `${SOUND_BASE}/bgm_lobby.mp3`,
  bgm_play: `${SOUND_BASE}/bgm_play.mp3`,
  bgm_suspense: `${SOUND_BASE}/bgm_suspense.mp3`,
  bgm_results: `${SOUND_BASE}/bgm_results.mp3`,
  bgm_final: `${SOUND_BASE}/bgm_final.mp3`,
};

// ---- SFX (one-shots) ----
export type SfxKey =
  | 'sfx_transition'
  | 'sfx_market_bell'
  | 'sfx_countdown'
  | 'sfx_timeup'
  | 'sfx_join'
  | 'sfx_card_flip'
  | 'sfx_reveal'
  | 'sfx_cash'
  | 'sfx_loss'
  | 'sfx_rankup'
  | 'sfx_drumroll'
  | 'sfx_fanfare'
  | 'sfx_confetti';

export const SFX_FILES: Record<SfxKey, string> = {
  sfx_transition: `${SOUND_BASE}/sfx_transition.mp3`,
  sfx_market_bell: `${SOUND_BASE}/sfx_market_bell.mp3`,
  sfx_countdown: `${SOUND_BASE}/sfx_countdown.mp3`,
  sfx_timeup: `${SOUND_BASE}/sfx_timeup.mp3`,
  sfx_join: `${SOUND_BASE}/sfx_join.mp3`,
  sfx_card_flip: `${SOUND_BASE}/sfx_card_flip.mp3`,
  sfx_reveal: `${SOUND_BASE}/sfx_reveal.mp3`,
  sfx_cash: `${SOUND_BASE}/sfx_cash.mp3`,
  sfx_loss: `${SOUND_BASE}/sfx_loss.mp3`,
  sfx_rankup: `${SOUND_BASE}/sfx_rankup.mp3`,
  sfx_drumroll: `${SOUND_BASE}/sfx_drumroll.mp3`,
  sfx_fanfare: `${SOUND_BASE}/sfx_fanfare.mp3`,
  sfx_confetti: `${SOUND_BASE}/sfx_confetti.mp3`,
};

// ---- phase → BGM mood ----
// phase ที่ไม่อยู่ในแมป = คงเพลงเดิมไว้ (ไม่ตัดเป็นเงียบ)
export const PHASE_BGM: Record<string, BgmKey> = {
  lobby: 'bgm_lobby',
  research: 'bgm_play',
  research_reveal: 'bgm_results', // B16d: reveal มู้ดเฉลย (เปลี่ยนจาก bgm_play)
  invest: 'bgm_play',
  chance_card: 'bgm_play',
  year_intro: 'bgm_suspense',
  market_open: 'bgm_suspense',
  event: 'bgm_suspense',
  event_result: 'bgm_results',
  golden_deal: 'bgm_results',
  results: 'bgm_results',
  leaderboard: 'bgm_results',
  final: 'bgm_suspense',          // B16d: step① "ใครคือแชมป์" = ตึงเครียด
  final_podium: 'bgm_final',      // B16d: เฉลย/ฉลอง
  final_awards: 'bgm_final',
  final_ranking: 'bgm_final',
};

// ระดับเสียง (BGM เบากว่า SFX ให้ SFX เด่น)
export const BGM_VOLUME = 0.5;
export const SFX_VOLUME = 0.9;
export const BGM_FADE_MS = 800;
