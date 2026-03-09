export default function MCGamePage({
  params,
}: {
  params: { roomId: string };
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <p className="text-sm text-gray-400 font-mono">MC CONTROL</p>
      <h1 className="text-3xl font-bold font-mono text-neon-cyan">
        {params.roomId}
      </h1>
      <p className="mt-4 text-gray-500">MC screen — coming in Task B1</p>
    </main>
  );
}
