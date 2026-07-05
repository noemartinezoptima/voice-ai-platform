import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { RedisClientType } from "redis";
import { ElevenLabsConvAI } from "./elevenlabs-convai.js";
import { muLawToPcm, pcmToMuLaw } from "./audio.js";

const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS || "100", 10);
const HEARTBEAT_INTERVAL_MS = parseInt(process.env.HEARTBEAT_INTERVAL_MS || "30000", 10);
const HEARTBEAT_TIMEOUT_MS = parseInt(process.env.HEARTBEAT_TIMEOUT_MS || "10000", 10);

interface CallStream {
  callSid: string;
  tenantId: string;
  flowId: string;
  ws: WebSocket;
  redis: RedisClientType;
  streamSid: string | null;
  convai: ElevenLabsConvAI | null;
  connectedAt: number;
  lastPong: number;
  isAlive: boolean;
}

const calls = new Map<string, CallStream>();
let isShuttingDown = false;

function log(callSid: string, msg: string, meta?: Record<string, unknown>): void {
  const entry = { ts: new Date().toISOString(), callSid, msg, ...meta };
  console.log(JSON.stringify(entry));
}

function resample8to16(pcm8: Int16Array): Int16Array {
  const len = pcm8.length;
  const pcm16 = new Int16Array(len * 2);

  for (let i = 0; i < len; i++) {
    pcm16[i * 2] = pcm8[i]!;
    pcm16[i * 2 + 1] = pcm8[i]!;
  }

  return pcm16;
}

function resample16to8(pcm16: Int16Array): Int16Array {
  const len = Math.floor(pcm16.length / 2);
  const pcm8 = new Int16Array(len);

  for (let i = 0; i < len; i++) {
    pcm8[i] = pcm16[i * 2]!;
  }

  return pcm8;
}

export function createWsServer(redis: RedisClientType): Server {
  const httpServer = createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: isShuttingDown ? "shutting_down" : "ok", calls: calls.size, max: MAX_CONNECTIONS }));
      return;
    }
    res.writeHead(404);
    res.end();
  });

  const wss = new WebSocketServer({ server: httpServer });

  const heartbeatTimer = setInterval(() => {
    const now = Date.now();
    for (const [sid, stream] of calls) {
      if (now - stream.lastPong > HEARTBEAT_TIMEOUT_MS) {
        log(sid, "heartbeat timeout, closing connection");
        stream.ws.terminate();
        cleanupCall(stream);
      }
    }
  }, HEARTBEAT_INTERVAL_MS);

  heartbeatTimer.unref();

  wss.on("connection", (ws, req) => {
    if (isShuttingDown) {
      ws.close(1013, "Server shutting down");
      return;
    }

    if (calls.size >= MAX_CONNECTIONS) {
      log("", "connection rejected — max connections reached", { max: MAX_CONNECTIONS });
      ws.close(1013, "Too many connections");
      return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const callSid = url.pathname.split("/").pop() ?? "";
    const tenantId = url.searchParams.get("tenant_id") ?? "";
    const flowId = url.searchParams.get("flow_id") ?? "";
    const elevenlabsApiKey = url.searchParams.get("elevenlabs_api_key") ?? "";
    const elevenlabsVoiceId = url.searchParams.get("elevenlabs_voice_id") ?? "";

    if (!callSid) {
      log("", "connection rejected — no callSid");
      ws.close(4000, "Missing callSid");
      return;
    }

    if (calls.has(callSid)) {
      log(callSid, "connection rejected — duplicate callSid");
      ws.close(4000, "Call already connected");
      return;
    }

    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY || elevenlabsApiKey;

    if (!agentId || !apiKey) {
      log(callSid, "connection rejected — missing credentials", { hasAgentId: !!agentId, hasApiKey: !!apiKey });
      ws.close(4000, "Missing ElevenLabs credentials");
      return;
    }

    const stream: CallStream = {
      callSid,
      tenantId,
      flowId,
      ws,
      redis,
      streamSid: null,
      convai: null,
      connectedAt: Date.now(),
      lastPong: Date.now(),
      isAlive: true,
    };

    calls.set(callSid, stream);
    log(callSid, "call connected", { tenantId, flowId, activeCalls: calls.size });

    ws.on("pong", () => {
      stream.lastPong = Date.now();
      stream.isAlive = true;
    });

    const convai = new ElevenLabsConvAI({ agentId, apiKey });

    convai.on("audio", ({ audio }: { audio: string }) => {
      if (!stream.streamSid) return;

      const pcm16 = Buffer.from(audio, "base64");
      const pcm16Array = new Int16Array(
        pcm16.buffer,
        pcm16.byteOffset,
        pcm16.byteLength / 2
      );
      const pcm8 = resample16to8(pcm16Array);
      const muLaw = pcmToMuLaw(pcm8);

      const msg = {
        event: "media",
        streamSid: stream.streamSid,
        media: { payload: muLaw },
      };

      try {
        ws.send(JSON.stringify(msg));
      } catch (err) {
        log(callSid, "failed to send audio to twilio", { error: String(err) });
      }
    });

    convai.on("user_transcript", (transcript: any[]) => {
      for (const entry of transcript) {
        if (entry.role === "user" && entry.content) {
          redis.publish(
            `events:call.${callSid}`,
            JSON.stringify({
              type: "transcript",
              data: {
                text: entry.content,
                role: "user",
                timestamp: Date.now(),
              },
            })
          ).catch((err) => log(callSid, "redis publish user_transcript failed", { error: String(err) }));
        }
      }
    });

    convai.on("agent_response", ({ content, isFinal }: { content: string; isFinal: boolean }) => {
      if (isFinal && content) {
        redis.publish(
          `events:call.${callSid}`,
          JSON.stringify({
            type: "transcript",
            data: {
              text: content,
              role: "agent",
              timestamp: Date.now(),
            },
          })
        ).catch((err) => log(callSid, "redis publish agent_response failed", { error: String(err) }));
      }
    });

    convai.on("error", (err: Error) => {
      log(callSid, "convai error", { error: err.message });
    });

    convai.on("disconnected", () => {
      log(callSid, "convai disconnected");
      ws.close();
    });

    convai.on("close", () => {
      log(callSid, "convai session closed");
      ws.close();
    });

    convai.connect().catch((err) => {
      log(callSid, "convai connect failed", { error: String(err) });
      ws.close();
    });

    stream.convai = convai;

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        handleMessage(stream, msg);
      } catch (err) {
        log(callSid, "parse error on ws message", { error: String(err) });
      }
    });

    ws.on("close", () => {
      log(callSid, "call disconnected", { durationMs: Date.now() - stream.connectedAt });
      cleanupCall(stream);
    });

    ws.on("error", (err) => {
      log(callSid, "ws error", { error: err.message });
      cleanupCall(stream);
    });
  });

  return httpServer;
}

export function getActiveCallCount(): number {
  return calls.size;
}

export function getIsShuttingDown(): boolean {
  return isShuttingDown;
}

export function closeAllCalls(): void {
  isShuttingDown = true;
  for (const [sid, stream] of calls) {
    log(sid, "force closing on shutdown");
    stream.ws.close(1013, "Server shutting down");
    cleanupCall(stream);
  }
}

export function resetForTest(): void {
  calls.clear();
  isShuttingDown = false;
}

function handleMessage(stream: CallStream, msg: any): void {
  switch (msg.event) {
    case "connected":
      stream.redis.publish(
        `events:call.${stream.callSid}`,
        JSON.stringify({
          type: "state_change",
          data: { status: "connected" },
        })
      ).catch((err) => log(stream.callSid, "redis publish connected failed", { error: String(err) }));
      break;

    case "start":
      stream.streamSid = msg.streamSid;

      stream.redis.publish(
        `events:call.${stream.callSid}`,
        JSON.stringify({
          type: "state_change",
          data: {
            status: "in_progress",
            streamSid: msg.streamSid,
            callSid: stream.callSid,
          },
        })
      ).catch((err) => log(stream.callSid, "redis publish start failed", { error: String(err) }));
      break;

    case "media":
      if (msg.media?.payload && stream.convai?.isConnected) {
        try {
          const pcm8 = muLawToPcm(msg.media.payload);
          const pcm16 = resample8to16(pcm8);
          stream.convai.sendAudio(
            Buffer.from(pcm16.buffer).toString("base64")
          );
        } catch (err) {
          log(stream.callSid, "audio processing error", { error: String(err) });
        }
      }
      break;

    case "stop":
      log(stream.callSid, "stream stopped");
      break;

    default:
      log(stream.callSid, "unknown ws event", { event: msg.event });
  }
}

function cleanupCall(stream: CallStream): void {
  if (stream.convai) {
    stream.convai.off("audio", () => {});
    stream.convai.off("user_transcript", () => {});
    stream.convai.off("agent_response", () => {});
    stream.convai.off("error", () => {});
    stream.convai.off("disconnected", () => {});
    stream.convai.off("close", () => {});
    stream.convai.disconnect();
    stream.convai = null;
  }

  calls.delete(stream.callSid);

  stream.redis.publish(
    `events:call.${stream.callSid}`,
    JSON.stringify({
      type: "completed",
      data: {
        callSid: stream.callSid,
        duration_seconds: Math.round((Date.now() - stream.connectedAt) / 1000),
      },
    })
  ).catch((err) => log(stream.callSid, "redis publish completed failed", { error: String(err) }));
}
