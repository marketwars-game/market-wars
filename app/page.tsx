"use client";

import { useState } from "react";

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      {/* Logo / Title */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-neon-green">MARKET</span>{" "}
          <span className="text-neon-cyan">WARS</span>
        </h1>
        <p className="mt-2 text-sm text-gray-400 font-mono">
          THE INVESTMENT GAME
        </p>
      </div>

      {/* Join Form */}
      <div className="w-full max-w-sm space-y-4">
        <input
          type="text"
          placeholder="ใส่ชื่อของคุณ"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={12}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
        />
        <input
          type="text"
          placeholder="Room Code (เช่น ABCD)"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={4}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-white placeholder-gray-500 placeholder:text-base placeholder:tracking-normal focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green"
        />
        <button
          disabled={!playerName.trim() || roomCode.length < 4}
          className="w-full rounded-lg bg-neon-green py-3 font-semibold text-base transition-all hover:shadow-[0_0_20px_rgba(0,255,178,0.3)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          JOIN GAME
        </button>
      </div>

      {/* MC Link */}
      <a
        href="/mc"
        className="mt-8 text-sm text-gray-500 underline decoration-dotted hover:text-neon-cyan"
      >
        MC? สร้างห้องที่นี่
      </a>

      {/* Supabase Connection Test */}
      <div className="mt-12 text-center">
        <p className="text-xs text-gray-600 font-mono">
          v0.1.0 — Starter Build
        </p>
        <SupabaseStatus />
      </div>
    </main>
  );
}

function SupabaseStatus() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const testConnection = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setStatus(data.supabase ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <button
      onClick={testConnection}
      className="mt-2 text-xs font-mono text-gray-600 hover:text-neon-cyan"
    >
      {status === "idle" && "[ Test Supabase Connection ]"}
      {status === "ok" && (
        <span className="text-neon-green">✓ Supabase Connected</span>
      )}
      {status === "error" && (
        <span className="text-accent-red">✗ Connection Failed — check .env.local</span>
      )}
    </button>
  );
}
