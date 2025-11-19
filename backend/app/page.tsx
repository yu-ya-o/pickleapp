export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">PickleHub API</h1>
      <p className="text-xl">Backend server is running!</p>
      <div className="mt-8 text-sm">
        <p>API Endpoints:</p>
        <ul className="list-disc list-inside mt-2">
          <li>POST /api/auth/google - Google Sign-In</li>
          <li>GET/POST /api/events - Events</li>
          <li>GET/PATCH/DELETE /api/events/[id] - Event details</li>
          <li>GET/POST /api/reservations - Reservations</li>
          <li>DELETE /api/reservations/[id] - Cancel reservation</li>
          <li>GET /api/chat/rooms/[eventId] - Chat room</li>
          <li>POST /api/chat/messages - Send message</li>
        </ul>
        <p className="mt-4">WebSocket: ws://localhost:3002</p>
      </div>
    </main>
  );
}
