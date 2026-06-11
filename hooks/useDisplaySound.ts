// FILE: hooks/useDisplaySound.ts — Display sound manager (unlock + SFX + BGM crossfade)
// VERSION: B16a-v2 — fix unlock race (don't pause the element that becomes active BGM)
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16a-BATCH1 created — HTMLAudio manager: silent-unlock, preload, playSfx, BGM crossfade, graceful missing files | B16a-BATCH1-fix unlock race condition
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BGM_FILES,
  SFX_FILES,
  PHASE_BGM,
  BGM_VOLUME,
  SFX_VOLUME,
  BGM_FADE_MS,
  type BgmKey,
  type SfxKey,
} from '@/lib/sound';

const FADE_STEP_MS = 50;

export function useDisplaySound() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const bgmRef = useRef<Partial<Record<BgmKey, HTMLAudioElement>>>({});
  const sfxRef = useRef<Partial<Record<SfxKey, HTMLAudioElement>>>({});
  const currentBgm = useRef<BgmKey | null>(null);
  const fadeTimers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // สร้าง audio element ครั้งเดียว (client เท่านั้น) + preload
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (Object.keys(BGM_FILES) as BgmKey[]).forEach((k) => {
      const a = new Audio(BGM_FILES[k]);
      a.loop = true;
      a.preload = 'auto';
      a.volume = 0;
      bgmRef.current[k] = a;
    });
    (Object.keys(SFX_FILES) as SfxKey[]).forEach((k) => {
      const a = new Audio(SFX_FILES[k]);
      a.preload = 'auto';
      a.volume = SFX_VOLUME;
      sfxRef.current[k] = a;
    });
    const bgm = bgmRef.current;
    const timers = fadeTimers.current;
    return () => {
      Object.values(bgm).forEach((a) => a && a.pause());
      Object.values(timers).forEach((t) => clearInterval(t));
    };
  }, []);

  // fade volume ของ element ไปยังค่าเป้าหมาย (ใช้ทำ crossfade)
  const fadeTo = useCallback((el: HTMLAudioElement, target: number, done?: () => void) => {
    const key = el.src;
    if (fadeTimers.current[key]) clearInterval(fadeTimers.current[key]);
    const steps = Math.max(1, Math.round(BGM_FADE_MS / FADE_STEP_MS));
    const start = el.volume;
    const delta = (target - start) / steps;
    let i = 0;
    fadeTimers.current[key] = setInterval(() => {
      i++;
      const v = Math.min(1, Math.max(0, start + delta * i));
      el.volume = v;
      if (i >= steps) {
        clearInterval(fadeTimers.current[key]);
        delete fadeTimers.current[key];
        el.volume = Math.min(1, Math.max(0, target));
        if (done) done();
      }
    }, FADE_STEP_MS);
  }, []);

  // ปลดล็อก autoplay — เล่นทุก element ที่ volume 0 (silent) ภายใน gesture เดียว
  const unlock = useCallback(() => {
    if (typeof window === 'undefined') return;
    const all: HTMLAudioElement[] = [
      ...(Object.values(bgmRef.current) as HTMLAudioElement[]),
      ...(Object.values(sfxRef.current) as HTMLAudioElement[]),
    ];
    all.forEach((a) => {
      if (!a) return;
      const restore = a.volume;
      a.volume = 0;
      const p = a.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          // ถ้า element นี้กลายเป็น BGM ที่กำลังเล่นอยู่ → ปล่อยให้เล่นต่อ (อย่า pause ทับ)
          const activeKey = currentBgm.current;
          if (activeKey && bgmRef.current[activeKey] === a) return;
          a.pause();
          a.currentTime = 0;
          a.volume = restore;
        }).catch(() => { a.volume = restore; });
      }
    });
    setIsUnlocked(true);
  }, []);

  const playBgm = useCallback((key: BgmKey) => {
    if (typeof window === 'undefined') return;
    if (currentBgm.current === key) return;
    const next = bgmRef.current[key];
    const prevKey = currentBgm.current;
    const prev = prevKey ? bgmRef.current[prevKey] : null;
    currentBgm.current = key;
    if (next) {
      next.volume = 0;
      next.play().catch(() => {});
      fadeTo(next, BGM_VOLUME);
    }
    if (prev && prev !== next) {
      fadeTo(prev, 0, () => { prev.pause(); prev.currentTime = 0; });
    }
  }, [fadeTo]);

  const playBgmForPhase = useCallback((phase: string) => {
    const key = PHASE_BGM[phase];
    if (!key) return; // phase ที่ไม่อยู่ในแมป → คงเพลงเดิม
    playBgm(key);
  }, [playBgm]);

  const playSfx = useCallback((key: SfxKey) => {
    if (typeof window === 'undefined') return;
    const el = sfxRef.current[key];
    if (!el) return;
    try {
      el.currentTime = 0;
      el.volume = SFX_VOLUME;
      el.play().catch(() => {});
    } catch {
      // ไฟล์หาย/เล่นไม่ได้ → เงียบ ไม่พัง
    }
  }, []);

  const stopBgm = useCallback(() => {
    const key = currentBgm.current;
    const cur = key ? bgmRef.current[key] : null;
    if (cur) fadeTo(cur, 0, () => { cur.pause(); cur.currentTime = 0; });
    currentBgm.current = null;
  }, [fadeTo]);

  return { isUnlocked, unlock, playSfx, playBgm, playBgmForPhase, stopBgm };
}
