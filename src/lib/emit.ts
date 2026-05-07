// Server-side socket event emitter
// Used by API routes to broadcast changes to all connected clients

export function emit(event: string, data: unknown) {
  const io = (global as { __io?: import("socket.io").Server }).__io;
  if (io) {
    io.emit(event, data);
  }
}
