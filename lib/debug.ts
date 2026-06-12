// FILE: lib/debug.ts — lightweight perf-test instrumentation helpers
// VERSION: perf-v1 — debug flag (?debug=1) + timing + rolling event-rate (no behaviour change when off)
// LAST MODIFIED: 12 Jun 2026
// HISTORY: perf-v1 created (Season 2 load-test instrumentation)
'use client';

import { useEffect, useState } from 'react';

/** Synchronous read of the ?debug=1 flag. Safe in callbacks (no stale closure). */
export function readDebugFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('debug') === '1';
  } catch {
    return false;
  }
}

/** High-res clock for durations. */
export function dnow(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/** SSR-safe debug flag for rendering (false on server + first client render → no hydration mismatch). */
export function useDebug(): boolean {
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    setDebug(readDebugFlag());
  }, []);
  return debug;
}

/** Rolling event-rate tracker. Push on each event; read count within a window. */
export class RateMeter {
  private times: number[] = [];
  push(t = Date.now()) {
    this.times.push(t);
    const cutoff = t - 5000;
    while (this.times.length && this.times[0] < cutoff) this.times.shift();
  }
  /** events within the last `windowMs` (default 1s) */
  rate(windowMs = 1000): number {
    const cutoff = Date.now() - windowMs;
    return this.times.filter((t) => t >= cutoff).length;
  }
  last(): number | null {
    return this.times.length ? this.times[this.times.length - 1] : null;
  }
}
