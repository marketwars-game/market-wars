// FILE: components/display/InvestDisplay.tsx — Display invest phase (live allocation wall)
// VERSION: B16b-v1 — spectator wall: every player A-Z + live allocation bar (LiveNameBoard)
// LAST MODIFIED: 11 Jun 2026
// HISTORY: B16a-BATCH0 extracted inline invest block | B16b live name wall + allocation bars
'use client';

import LiveNameBoard from '@/components/display/LiveNameBoard';

export default function InvestDisplay({ players, round }: { players: any[]; round: number }) {
  return <LiveNameBoard players={players} round={round} variant="invest" />;
}
