#!/usr/bin/env bash
# FILE: scripts/display-sweep/run.sh — รัน sweep จอ Display (dev server ชั่วคราว + หน้า preview ชั่วคราว)
# ใช้: bash scripts/display-sweep/run.sh [screens] [lo:hi:step]   เช่น  run.sh final_ranking 1:200:1
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p app/b26preview && cp scripts/display-sweep/preview-page.tsx.txt app/b26preview/page.tsx
cleanup() { pkill -f "next dev -p 3111" 2>/dev/null || true; rm -rf app/b26preview .next/dev; git checkout -q next-env.d.ts 2>/dev/null || true; }
trap cleanup EXIT
export NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-https://dummy.supabase.co} NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-dummy}
npx next dev -p 3111 > /tmp/sweep-dev.log 2>&1 &
sleep 12
python3 scripts/display-sweep/sweep.py "${1:-final_ranking,invest,chance_card,results,leaderboard,lobby}" "${2:-1:200:1}"
