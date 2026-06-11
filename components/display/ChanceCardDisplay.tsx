// FILE: components/display/ChanceCardDisplay.tsx — Chance Card Display (luck wall)
// VERSION: B16b-v1 — spectator wall: every player A-Z, cell lights green/red + amount on open
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B13 created (replacing FightDisplay) | B15 projector polish | B16b live luck wall (LiveNameBoard)
'use client';

import LiveNameBoard from '@/components/display/LiveNameBoard';

interface ChanceCardDisplayProps {
  players: any[];
  round: number;
}

export default function ChanceCardDisplay({ players, round }: ChanceCardDisplayProps) {
  return <LiveNameBoard players={players} round={round} variant="chance" />;
}
