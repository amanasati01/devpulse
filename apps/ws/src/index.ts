import { WebSocketServer } from "ws";
import { getRedisClient } from "@devpulse/lib";

const port = Number(process.env.WS_PORT ?? 3001);
const wss = new WebSocketServer({ port });
const sub = getRedisClient().duplicate();

wss.on("connection", (socket) => {
  socket.send(
    JSON.stringify({
      type: "connected",
      payload: { message: "Connected to DevPulse realtime server" },
      timestamp: new Date().toISOString()
    })
  );
});

sub.subscribe("devpulse:events", (err) => {
  if (err) {
    console.error("Redis subscribe error", err);
  }
});

sub.on("message", (_channel, message) => {
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
});

console.log(`DevPulse ws server running on :${port}`);
