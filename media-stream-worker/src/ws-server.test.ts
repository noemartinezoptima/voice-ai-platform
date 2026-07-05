import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createWsServer, getActiveCallCount, getIsShuttingDown, closeAllCalls, resetForTest } from "./ws-server.js";
import { WebSocket } from "ws";
import { type Server } from "http";

vi.mock("./elevenlabs-convai.js", () => ({
  ElevenLabsConvAI: vi.fn(() => ({
    connect: vi.fn(() => Promise.resolve()),
    sendAudio: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    get isConnected() {
      return true;
    },
  })),
}));

const BASE_ENV: Record<string, string> = {
  ELEVENLABS_API_KEY: "sk-test-key",
  ELEVENLABS_AGENT_ID: "test-agent",
};

describe("ws-server", () => {
  let server: Server;
  let port: number;
  let redis: any;

  beforeEach(() => {
    process.env = { ...BASE_ENV };
    resetForTest();

    redis = {
      set: vi.fn(),
      get: vi.fn(),
      publish: vi.fn().mockResolvedValue(0),
      quit: vi.fn(),
    };
  });

  afterEach(() => {
    closeAllCalls();
    server?.close();
  });

  function createTestServer(): Promise<void> {
    server = createWsServer(redis);
    return new Promise<void>((resolve) => {
      server.listen(0, () => {
        port = (server.address() as any).port;
        resolve();
      });
    });
  }

  function wsConnect(path: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${port}${path}`);
      ws.on("open", () => resolve(ws));
      ws.on("error", reject);
    });
  }

  function wsExpectClose(path: string, expectedCode: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${port}${path}`);
      ws.on("close", (code) => {
        expect(code).toBe(expectedCode);
        resolve();
      });
      ws.on("error", () => {});
    });
  }

  it("returns health status", async () => {
    await createTestServer();
    const res = await fetch(`http://localhost:${port}/health`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.max).toBe(100);
  });

  it("returns 404 for unknown routes", async () => {
    await createTestServer();
    const res = await fetch(`http://localhost:${port}/unknown`);
    expect(res.status).toBe(404);
  });

  it("rejects websocket without agent id", async () => {
    delete process.env.ELEVENLABS_AGENT_ID;
    await createTestServer();
    await wsExpectClose("/stream/test-call", 4000);
  });

  it("rejects websocket without callSid", async () => {
    await createTestServer();
    await wsExpectClose("/", 4000);
  });

  it("connects successfully with valid params", async () => {
    await createTestServer();
    const ws = await wsConnect("/stream/call-valid?tenant_id=t1&flow_id=f1");
    expect(getActiveCallCount()).toBe(1);
    ws.close();
  });

  it("tracks call count", async () => {
    await createTestServer();

    expect(getActiveCallCount()).toBe(0);

    const ws1 = await wsConnect("/stream/call-a");
    expect(getActiveCallCount()).toBe(1);

    const ws2 = await wsConnect("/stream/call-b");
    expect(getActiveCallCount()).toBe(2);

    ws1.close();
    ws2.close();

    await new Promise((r) => setTimeout(r, 50));
    expect(getActiveCallCount()).toBe(0);
  });

  it("rejects duplicate callSid", async () => {
    await createTestServer();
    const ws1 = await wsConnect("/stream/call-dup");
    await wsExpectClose("/stream/call-dup", 4000);
    ws1.close();
  });

  it("rejects connection during shutdown", async () => {
    await createTestServer();
    const ws1 = await wsConnect("/stream/call-shutdown");
    closeAllCalls();
    await wsExpectClose("/stream/after-shutdown", 1013);
  });

  it("publishes state events on start message", async () => {
    await createTestServer();
    const ws = await wsConnect("/stream/call-events");

    ws.send(JSON.stringify({ event: "connected" }));

    ws.send(JSON.stringify({
      event: "start",
      streamSid: "MZ-123",
    }));

    await new Promise((r) => setTimeout(r, 100));

    const publishCalls = redis.publish.mock.calls;
    const stateChanges = publishCalls.filter((c: any[]) => c[0] === "events:call.call-events");
    expect(stateChanges.length).toBe(2);

    expect(JSON.parse(stateChanges[0][1])).toMatchObject({
      type: "state_change",
      data: { status: "connected" },
    });

    expect(JSON.parse(stateChanges[1][1])).toMatchObject({
      type: "state_change",
      data: { status: "in_progress", streamSid: "MZ-123" },
    });

    ws.close();
  });
});
