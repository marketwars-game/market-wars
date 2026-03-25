// FILE: components/player/MarketFight.tsx — Market Fight (เป่ายิงฉุบ)
// VERSION: B9-v5 — Matching animation before choosing
// LAST MODIFIED: 25 Mar 2026
// HISTORY: B9 created | B9-v2 client-side calc + reset | B9-v3 auto-submit + money sign fix

'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { DUEL_CONFIG } from '@/lib/constants';

interface MarketFightProps {
  playerId: string;
  roomId: string;
  round: number;
  player: any;
  players: any[];
}

export default function MarketFight({ playerId, roomId, round, player, players }: MarketFightProps) {
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [duelState, setDuelState] = useState<'matching' | 'matched' | 'choosing' | 'locked' | 'countdown' | 'result'>('matching');
  const [countdown, setCountdown] = useState(3);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const matchingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ดึงข้อมูล duel จาก player prop (update ผ่าน Realtime)
  const opponentId = player.duel_opponent_id;
  const opponentName = player.duel_opponent_name;
  const duelResult = player.duel_result;
  const duelMoneyChange = parseFloat(player.duel_money_change) || 0;
  const myMove = player.duel_move;

  // หาข้อมูล opponent จาก players array
  const opponent = players.find(p => p.id === opponentId);
  const opponentMove = opponent?.duel_move;
  const opponentSubmitted = opponent?.duel_submitted_round >= round;

  // === Matching animation: รอ pair API จับคู่ → แสดง "กำลังหาคู่..." ===
  useEffect(() => {
    if (duelState === 'matching' && opponentId) {
      // พบคู่แล้ว → แสดง "พบแล้ว!" 1 วินาที → ไป choosing
      setDuelState('matched');
      matchingTimerRef.current = setTimeout(() => {
        setDuelState('choosing');
      }, 1200);
    }
    return () => { if (matchingTimerRef.current) clearTimeout(matchingTimerRef.current); };
  }, [duelState, opponentId]);

  // === Reset state เมื่อเข้ารอบใหม่ (pair API reset DB แล้ว) ===
  useEffect(() => {
    // ถ้า duel_submitted_round < round หรือ duel_move เป็น null (pair reset แล้ว) → reset
    if (player.duel_submitted_round < round || (!myMove && !player.duel_result)) {
      setSelectedMove(null);
      setLocked(false);
      setSubmitting(false);
      // ถ้ามี opponent แล้ว → ไป matched/choosing ไม่ต้องกลับ matching
      if (opponentId) {
        setDuelState('choosing');
      } else {
        setDuelState('matching');
      }
    }
  }, [round, player.duel_submitted_round, myMove, player.duel_result, opponentId]);

  // === ตรวจว่า player ส่ง move แล้วหรือยัง (กรณี reconnect) ===
  useEffect(() => {
    if (player.duel_submitted_round >= round && myMove) {
      setSelectedMove(myMove);
      setLocked(true);
      // ถ้าทั้งคู่ส่งแล้ว หรือมี result แล้ว → ไป result
      if (duelResult && duelResult !== 'null') {
        setDuelState('result');
      } else if (opponentSubmitted) {
        setDuelState('countdown');
      } else {
        setDuelState('locked');
      }
    }
  }, [player.duel_submitted_round, round, myMove, duelResult, opponentSubmitted]);

  // === เมื่อทั้งคู่กดแล้ว → เริ่ม countdown ===
  useEffect(() => {
    if (duelState === 'locked' && locked && opponentSubmitted) {
      setDuelState('countdown');
    }
  }, [duelState, locked, opponentSubmitted]);

  // === Countdown animation ===
  useEffect(() => {
    if (duelState !== 'countdown') return;
    setCountdown(3);
    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(countdownRef.current!);
        setCountdown(0);
        setDuelState('result');
      } else {
        setCountdown(count);
      }
    }, 700);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [duelState]);

  // === เมื่อ duel_result ถูก set จาก resolve API (MC กด Next) ===
  useEffect(() => {
    if (duelResult && duelResult !== 'null' && duelState !== 'result') {
      // MC กด Next → resolve แล้ว → แสดงผลเลย
      setDuelState('result');
    }
  }, [duelResult, duelState]);

  // === Lock In: ส่ง move ไป API ===
  async function handleLockIn() {
    if (!selectedMove || submitting || locked) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/players/duel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move', player_id: playerId, move: selectedMove, round }),
      });
      const data = await res.json();
      if (data.success) {
        setLocked(true);
        setDuelState('locked');
      }
    } catch (err) {
      console.error('Duel move error:', err);
    }
    setSubmitting(false);
  }

  // === MATCHING Screen — กำลังหาคู่ต่อสู้ ===
  if (duelState === 'matching') {
    return (
      <div className="bg-[#161b22] rounded-lg p-6 text-center">
        <div className="text-center mb-4">
          <span className="text-xs font-mono tracking-wider px-3 py-1 rounded-full" style={{ background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444' }}>MARKET FIGHT</span>
        </div>
        <div className="py-8">
          <div className="text-5xl mb-4 animate-bounce">⚔️</div>
          <div className="text-lg font-bold text-[#F59E0B] mb-2">กำลังหาคู่ต่อสู้...</div>
          <div className="text-gray-500 text-sm">Matching you with an opponent</div>
          <div className="mt-5 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // === MATCHED Screen — พบคู่แล้ว! ===
  if (duelState === 'matched') {
    return (
      <div className="bg-[#161b22] rounded-lg p-6 text-center">
        <div className="text-center mb-4">
          <span className="text-xs font-mono tracking-wider px-3 py-1 rounded-full" style={{ background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444' }}>MARKET FIGHT</span>
        </div>
        <div className="py-8">
          <div className="text-5xl mb-4">🎯</div>
          <div className="text-lg font-bold text-[#00FFB2] mb-3">พบคู่ต่อสู้แล้ว!</div>
          <div className="inline-flex items-center gap-3 bg-[#0D1117] px-5 py-3 rounded-xl">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold" style={{ background: `hsl(${(opponentName || 'X').charCodeAt(0) * 7}, 50%, 30%)`, color: '#ffffff80' }}>
              {(opponentName || '?')[0]}
            </div>
            <span className="text-xl font-bold text-white">{opponentName}</span>
          </div>
        </div>
      </div>
    );
  }

  // === BYE Screen ===
  if (!opponentId || duelResult === 'bye') {
    return (
      <div className="bg-[#161b22] rounded-lg p-6 text-center">
        <div className="text-center mb-4">
          <span className="text-xs font-mono tracking-wider px-3 py-1 rounded-full" style={{ background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444' }}>MARKET FIGHT</span>
        </div>
        <div className="py-6">
          <div className="text-5xl mb-3">🍀</div>
          <div className="text-xl font-bold text-[#22C55E] mb-2">Lucky!</div>
          <div className="text-gray-400">ไม่มีคู่ต่อสู้รอบนี้</div>
          <div className="text-gray-500 text-sm mt-3">คุณปลอดภัย — ฿0</div>
        </div>
        <div className="text-gray-600 text-xs mt-2">รอ MC กด Next เพื่อไปต่อ...</div>
      </div>
    );
  }

  // === RESULT Screen ===
  if (duelState === 'result') {
    const finalMyMove = myMove || selectedMove;
    const finalOppMove = opponentMove || opponent?.duel_move;

    // คำนวณผลฝั่ง client (ใช้ตอน DB ยังไม่ resolve)
    const calcResult = (): { result: string; moneyChange: number } => {
      // ถ้า DB มีผลแล้ว (หลัง resolve) → ใช้จาก DB
      if (duelResult && duelResult !== 'null' && duelResult !== null) {
        return { result: duelResult, moneyChange: duelMoneyChange };
      }
      // คำนวณเอง
      if (!finalMyMove || !finalOppMove) return { result: 'draw', moneyChange: 0 };
      if (finalMyMove === finalOppMove) return { result: 'draw', moneyChange: 0 };
      const w = DUEL_CONFIG.WINS_AGAINST as Record<string, string>;
      if (w[finalMyMove] === finalOppMove) {
        return { result: 'win', moneyChange: DUEL_CONFIG.WIN_AMOUNT };
      }
      return { result: 'lose', moneyChange: -DUEL_CONFIG.LOSE_AMOUNT };
    };

    const { result: finalResult, moneyChange: finalMoneyChange } = calcResult();

    const resultConfig: Record<string, { emoji: string; label: string; color: string; bg: string; border: string }> = {
      win: { emoji: '🏆', label: 'คุณชนะ!', color: '#00FFB2', bg: '#00FFB220', border: '#00FFB240' },
      lose: { emoji: '💥', label: 'คุณแพ้!', color: '#EF4444', bg: '#EF444420', border: '#EF444440' },
      draw: { emoji: '🤝', label: 'เสมอ!', color: '#F59E0B', bg: '#F59E0B20', border: '#F59E0B40' },
    };
    const rc = resultConfig[finalResult] || resultConfig.draw;

    // หา description ของผล
    const getResultDesc = () => {
      if (!finalMyMove || !finalOppMove) return '';
      if (finalMyMove === finalOppMove) return 'เหมือนกัน!';
      const w = DUEL_CONFIG.WINS_AGAINST as Record<string, string>;
      if (w[finalMyMove] === finalOppMove) {
        return `${DUEL_CONFIG.MOVE_LABEL[finalMyMove]}ชนะ${DUEL_CONFIG.MOVE_LABEL[finalOppMove]}!`;
      }
      return `${DUEL_CONFIG.MOVE_LABEL[finalOppMove]}ชนะ${DUEL_CONFIG.MOVE_LABEL[finalMyMove]}!`;
    };

    return (
      <div className="bg-[#161b22] rounded-lg p-4">
        <div className="text-center mb-4">
          <span className="text-xs font-mono tracking-wider px-3 py-1 rounded-full" style={{ background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444' }}>MARKET FIGHT</span>
        </div>

        {/* VS Display */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-5xl mb-1">{finalMyMove ? DUEL_CONFIG.MOVE_EMOJI[finalMyMove] : '❓'}</div>
            <div className="text-xs font-bold text-[#00FFB2]">คุณ</div>
          </div>
          <div className="text-lg font-extrabold text-gray-700 tracking-widest">VS</div>
          <div className="text-center">
            <div className="text-5xl mb-1">{finalOppMove ? DUEL_CONFIG.MOVE_EMOJI[finalOppMove] : '❓'}</div>
            <div className="text-xs font-bold text-gray-500">{opponentName}</div>
          </div>
        </div>

        {/* Result */}
        <div className="text-center p-4 rounded-lg mb-3" style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
          <div className="text-2xl font-extrabold mb-1" style={{ color: rc.color }}>{rc.emoji} {rc.label}</div>
          <div className="text-lg font-bold" style={{ color: rc.color }}>
            {finalMoneyChange > 0 ? '+' : finalMoneyChange < 0 ? '-' : ''}฿{Math.abs(finalMoneyChange).toLocaleString()}
          </div>
          {getResultDesc() && <div className="text-xs text-gray-500 mt-1">{getResultDesc()}</div>}
        </div>

        <div className="text-center text-gray-600 text-xs">รอ MC กด Next เพื่อไปต่อ...</div>
      </div>
    );
  }

  // === COUNTDOWN Screen ===
  if (duelState === 'countdown') {
    return (
      <div className="bg-[#161b22] rounded-lg p-6 text-center">
        <div className="text-center mb-4">
          <span className="text-xs font-mono tracking-wider px-3 py-1 rounded-full" style={{ background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444' }}>MARKET FIGHT</span>
        </div>
        <div className="py-8">
          <div className="text-7xl font-extrabold text-[#F59E0B] animate-pulse">
            {countdown > 0 ? countdown : 'FIGHT!'}
          </div>
          <div className="text-gray-500 text-sm mt-4">vs {opponentName}</div>
        </div>
      </div>
    );
  }

  // === LOCKED (waiting for opponent) ===
  if (duelState === 'locked') {
    return (
      <div className="bg-[#161b22] rounded-lg p-4">
        <div className="text-center mb-4">
          <span className="text-xs font-mono tracking-wider px-3 py-1 rounded-full" style={{ background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444' }}>MARKET FIGHT</span>
        </div>

        <div className="text-center py-6">
          <div className="text-5xl mb-3">{selectedMove ? DUEL_CONFIG.MOVE_EMOJI[selectedMove] : '❓'}</div>
          <div className="text-[#00FFB2] font-bold mb-1">✓ Locked In!</div>
          <div className="text-gray-500 text-sm">รอ {opponentName} เลือก...</div>
          <div className="mt-4 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#00FFB2] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // === CHOOSING Screen (default) ===
  return (
    <div className="bg-[#161b22] rounded-lg p-4">
      {/* Header */}
      <div className="text-center mb-3">
        <span className="text-xs font-mono tracking-wider px-3 py-1 rounded-full" style={{ background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444' }}>MARKET FIGHT</span>
        <p className="text-gray-600 text-xs mt-2">Round {round}</p>
      </div>

      {/* Opponent */}
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 mb-1">คู่ของคุณ</p>
        <div className="inline-flex items-center gap-2 bg-[#0D1117] px-4 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `hsl(${(opponentName || 'X').charCodeAt(0) * 7}, 50%, 30%)`, color: '#ffffff80' }}>
            {(opponentName || '?')[0]}
          </div>
          <span className="text-base font-bold text-white">{opponentName}</span>
        </div>
      </div>

      {/* 3 choices — กดเลือกแล้ว submit ทันที */}
      <p className="text-xs text-gray-500 text-center mb-3">แตะเลย!</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {DUEL_CONFIG.MOVES.map((move) => {
          const isSelected = selectedMove === move;
          return (
            <button
              key={move}
              onClick={() => {
                if (locked || submitting) return;
                setSelectedMove(move);
                // Auto-submit ทันที
                setSubmitting(true);
                fetch('/api/players/duel', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'move', player_id: playerId, move, round }),
                }).then(res => res.json()).then(data => {
                  if (data.success) { setLocked(true); setDuelState('locked'); }
                  setSubmitting(false);
                }).catch(() => { setSubmitting(false); });
              }}
              className="flex flex-col items-center p-4 rounded-xl transition-all duration-200"
              style={{
                background: isSelected ? '#00FFB220' : '#ffffff08',
                border: `2px solid ${isSelected ? '#00FFB2' : '#ffffff15'}`,
                boxShadow: isSelected ? '0 0 20px #00FFB220' : 'none',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              <span className="text-4xl mb-1">{DUEL_CONFIG.MOVE_EMOJI[move]}</span>
              <span className="text-xs font-bold" style={{ color: isSelected ? '#00FFB2' : '#ffffff60' }}>
                {DUEL_CONFIG.MOVE_LABEL[move]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
