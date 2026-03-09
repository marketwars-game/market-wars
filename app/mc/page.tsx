"use client";

export default function MCPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          <span className="text-neon-cyan">MC</span>{" "}
          <span className="text-gray-400">CONTROL PANEL</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Market Wars — The Investment Game
        </p>
      </div>

      <button className="mt-8 rounded-lg bg-neon-cyan px-8 py-3 font-semibold text-base transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]">
        CREATE NEW ROOM
      </button>

      <p className="mt-6 text-xs text-gray-600">
        Coming in Task B1 — Room creation + QR code
      </p>
    </main>
  );
}
