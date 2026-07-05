import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { ElevenLabsConvAI } from "./elevenlabs-convai.js";

const { mockWs, mockCtor } = vi.hoisted(() => {
  const ws = {
    on: vi.fn(),
    send: vi.fn(),
    close: vi.fn(),
    terminate: vi.fn(),
    get readyState() { return 1; },
  };

  const ctor = Object.assign(
    vi.fn(() => ws),
    { OPEN: 1, CONNECTING: 0, CLOSING: 2, CLOSED: 3 },
  );

  return { mockWs: ws, mockCtor: ctor };
});

vi.mock("ws", () => ({
  default: mockCtor,
  WebSocket: mockCtor,
}));

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = mockFetch;
});

describe("ElevenLabsConvAI", () => {
  let convai: ElevenLabsConvAI;

  beforeEach(() => {
    convai = new ElevenLabsConvAI({
      agentId: "test-agent",
      apiKey: "test-key",
    });
  });

  it("emits error on connection timeout", async () => {
    vi.useFakeTimers();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ signed_url: "wss://example.com/conv" }),
    });

    mockWs.on.mockImplementation((_: string) => {});

    const promise = convai.connect();

    vi.advanceTimersByTimeAsync(11000);

    await expect(promise).rejects.toThrow("Connection timeout");
    vi.useRealTimers();
  });

  it("resolves on open", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ signed_url: "wss://example.com/conv" }),
    });

    mockWs.on.mockImplementation((event: string, cb: Function) => {
      if (event === "open") cb();
    });

    await expect(convai.connect()).resolves.toBeUndefined();
    expect(convai.isConnected).toBe(true);
  });

  it("rejects on ws error", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ signed_url: "wss://example.com/conv" }),
    });

    mockWs.on.mockImplementation((event: string, cb: Function) => {
      if (event === "error") cb(new Error("connect failed"));
    });

    await expect(convai.connect()).rejects.toThrow("connect failed");
  });

  it("rejects on signed URL fetch error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("unauthorized"),
    });

    mockWs.on.mockImplementation((event: string, cb: Function) => {
      if (event === "error") setTimeout(() => cb(new Error("should not reach")), 1000);
    });

    await expect(convai.connect()).rejects.toThrow("Failed to get signed URL");
  });

  it("sends audio when connected", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ signed_url: "wss://example.com/conv" }),
    });

    mockWs.on.mockImplementation((event: string, cb: Function) => {
      if (event === "open") cb();
    });

    await convai.connect();
    convai.sendAudio("dGVzdA==");

    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "audio", audio: "dGVzdA==" })
    );
  });

  it("throws sendAudio when not connected", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ signed_url: "wss://example.com/conv" }),
    });

    expect(() => convai.sendAudio("dGVzdA==")).toThrow("Not connected");
  });

  it("emits audio on audio message", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ signed_url: "wss://example.com/conv" }),
    });

    const audioHandler = vi.fn();
    convai.on("audio", audioHandler);

    mockWs.on.mockImplementation((event: string, cb: Function) => {
      if (event === "message") {
        cb(JSON.stringify({
          type: "audio",
          audio: "base64data",
          is_final: true,
        }));
      }
      if (event === "open") cb();
    });

    await convai.connect();

    expect(audioHandler).toHaveBeenCalledWith({ audio: "base64data", isFinal: true });
  });

  it("emits init on init message", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ signed_url: "wss://example.com/conv" }),
    });

    const initHandler = vi.fn();
    convai.on("init", initHandler);

    mockWs.on.mockImplementation((event: string, cb: Function) => {
      if (event === "message") {
        cb(JSON.stringify({
          type: "init",
          conversation_id: "conv-123",
        }));
      }
      if (event === "open") cb();
    });

    await convai.connect();

    expect(initHandler).toHaveBeenCalledWith("conv-123");
    expect(convai.conversationId).toBe("conv-123");
  });

  it("disconnects gracefully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ signed_url: "wss://example.com/conv" }),
    });

    mockWs.on.mockImplementation((event: string, cb: Function) => {
      if (event === "open") cb();
    });

    await convai.connect();

    convai.disconnect();
    expect(mockWs.close).toHaveBeenCalled();
    expect(convai.isConnected).toBe(false);
  });
});
