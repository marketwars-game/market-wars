export default function PlayerGamePage({
  params,
}: {
  params: { roomId: string };
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <p className="text-sm text-gray-400 font-mono">ROOM</p>
      <h1 className="text-3xl font-bold font-mono text-neon-green">
        {params.roomId}
      </h1>
      <p className="mt-4 text-gray-500">Player screen — coming in Task B2</p>
    </main>
  );
}
