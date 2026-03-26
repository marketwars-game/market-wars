// FILE: components/player/ChanceCard.tsx — Chance Card mini-game
// VERSION: B13-BATCH2-v1 — New component replacing MarketFight
// LAST MODIFIED: 26 Mar 2026
// HISTORY: B13 created (replacing B9 MarketFight)
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getChanceCard } from '@/lib/constants';

interface ChanceCardProps {
  playerId: string;
  roomId: string;
  round: number;
  player: any;
}

export default function ChanceCard({ playerId, roomId, round, player }: ChanceCardProps) {
  const [cardState, setCardState] = useState<'ready' | 'flipping' | 'revealed'>('ready');
  const [submitting, setSubmitting] = useState(false);
  const flipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // สุ่มการ์ดจาก seed (deterministic — กดกี่ครั้งก็ได้การ์ดเดิม)
  const card = getChanceCard(roomId, round, playerId);
  const isPositive = card.amount >= 0;

  // === เช็คว่าเปิดการ์ดไปแล้วหรือยัง (reconnect safe) ===
  useEffect(() => {
    const submittedRound = player.duel_submitted_round || 0;
    if (submittedRound >= round) {
      setCardState('revealed');
    } else {
      setCardState('ready');
      setSubmitting(false);
    }
  }, [round, player.duel_submitted_round]);

  // === Cleanup timer ===
  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, []);

  // === กดเปิดการ์ด ===
  async function handleReveal() {
    if (cardState !== 'ready' || submitting) return;
    setSubmitting(true);
    setCardState('flipping');

    // Animation 1.5 วินาที → แสดงผล
    flipTimerRef.current = setTimeout(() => {
      setCardState('revealed');
    }, 1500);

    // Write DB: update money + reuse duel columns
    try {
      const currentMoney = parseFloat(player.money) || 0;
      await supabase
        .from('players')
        .update({
          money: currentMoney + card.amount,
          duel_money_change: card.amount,
          duel_submitted_round: round,
        })
        .eq('id', playerId);
    } catch (err) {
      console.error('Chance card DB error:', err);
    }
  }

  // === READY: หลังการ์ด + ปุ่มเปิด ===
  if (cardState === 'ready') {
    return (
      <div className="bg-[#161b22] rounded-lg p-6 text-center">
        <div className="text-center mb-4">
          <span className="text-[10px] tracking-[1.5px] px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
            CHANCE CARD
          </span>
        </div>

        {/* การ์ดหลัง */}
        <div
          className="mx-auto mb-5 rounded-xl flex items-center justify-center"
          style={{
            width: 160,
            height: 220,
            background: 'linear-gradient(135deg, #1a1f3d, #2a1f5e)',
            border: '2px solid rgba(245,158,11,0.3)',
            boxShadow: '0 8px 32px rgba(245,158,11,0.15)',
          }}
        >
          <div className="text-center">
            <div className="text-6xl mb-2">🃏</div>
            <div className="text-xs font-bold" style={{ color: '#F59E0B' }}>โชคชะตา</div>
          </div>
        </div>

        <button
          onClick={handleReveal}
          disabled={submitting}
          className="w-full py-3 rounded-lg font-bold text-sm transition-all"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            color: '#fff',
            opacity: submitting ? 0.5 : 1,
            boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
          }}
        >
          {submitting ? 'กำลังเปิด...' : 'เปิดการ์ดโชคชะตา!'}
        </button>
      </div>
    );
  }

  // === FLIPPING: Animation พลิกการ์ด ===
  if (cardState === 'flipping') {
    return (
      <div className="bg-[#161b22] rounded-lg p-6 text-center">
        <div className="text-center mb-4">
          <span className="text-[10px] tracking-[1.5px] px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
            CHANCE CARD
          </span>
        </div>

        <div className="py-8">
          <div className="text-6xl animate-bounce mb-4">🃏</div>
          <div className="text-lg font-bold text-[#F59E0B] animate-pulse">กำลังเปิดการ์ด...</div>
        </div>
      </div>
    );
  }

  // === REVEALED: แสดงผลการ์ด ===
  // ดึง amount จาก DB (กรณี reconnect) หรือจาก card ที่สุ่มได้
  const displayAmount = (player.duel_submitted_round >= round)
    ? parseFloat(player.duel_money_change) || card.amount
    : card.amount;
  const displayPositive = displayAmount >= 0;

  return (
    <div className="bg-[#161b22] rounded-lg p-6 text-center">
      <div className="text-center mb-4">
        <span className="text-[10px] tracking-[1.5px] px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
          CHANCE CARD
        </span>
      </div>

      {/* การ์ดหน้า */}
      <div
        className="mx-auto mb-4 rounded-xl flex flex-col items-center justify-center p-4"
        style={{
          width: 200,
          height: 260,
          background: displayPositive
            ? 'linear-gradient(135deg, rgba(0,255,178,0.08), rgba(0,255,178,0.02))'
            : 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))',
          border: `2px solid ${displayPositive ? 'rgba(0,255,178,0.3)' : 'rgba(239,68,68,0.3)'}`,
          boxShadow: `0 8px 32px ${displayPositive ? 'rgba(0,255,178,0.15)' : 'rgba(239,68,68,0.15)'}`,
        }}
      >
        <div className="text-5xl mb-3">{card.emoji}</div>
        <p className="text-sm text-white font-medium mb-3 leading-relaxed px-2">{card.text}</p>
        <div
          className="text-2xl font-extrabold"
          style={{ color: displayPositive ? '#00FFB2' : '#EF4444' }}
        >
          {displayPositive ? '+' : '-'}฿{Math.abs(displayAmount).toLocaleString()}
        </div>
      </div>

      {/* Status message */}
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        รอ MC กด Next เพื่อไปต่อ...
      </p>
    </div>
  );
}
