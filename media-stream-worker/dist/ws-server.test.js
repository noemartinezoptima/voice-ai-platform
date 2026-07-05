import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createWsServer } from "./ws-server.js";
import { WebSocket } from "ws";
vi.mock("./elevenlabs-convai.js", () => ({
    ElevenLabsConvAI: vi.fn(() => ({
        connect: vi.fn(() => Promise.resolve()),
        sendAudio: vi.fn(),
        disconnect: vi.fn(),
        on: vi.fn(),
        get isConnected() {
            return true;
        },
    })),
}));
describe("ws-server", () => {
    let server;
    let port;
    beforeEach(async () => {
        process.env.ELEVENLABS_API_KEY = "sk-test-key";
        process.env.ELEVENLABS_AGENT_ID = "test-agent";
        const redis = {
            set: vi.fn(),
            get: vi.fn(),
            publish: vi.fn(),
            quit: vi.fn(),
        };
        server = createWsServer(redis);
        await new Promise((resolve) => {
            server.listen(0, () => {
                port = server.address().port;
                resolve();
            });
        });
    });
    afterEach(() => {
        server.close();
    });
    it("returns health status", async () => {
        const res = await fetch(`http://localhost:${port}/health`);
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.status).toBe("ok");
    });
    it("returns 404 for unknown routes", async () => {
        const res = await fetch(`http://localhost:${port}/unknown`);
        expect(res.status).toBe(404);
    });
    it("rejects websocket without agent id", () => {
        delete process.env.ELEVENLABS_AGENT_ID;
        const ws = new WebSocket(`ws://localhost:${port}/stream/test-call`);
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("timeout")), 2000);
            ws.on("close", () => {
                clearTimeout(timeout);
                expect(ws.readyState).toBe(WebSocket.CLOSED);
                resolve();
            });
            ws.on("error", () => {
                /* expected */
            });
        });
    });
});
//# sourceMappingURL=ws-server.test.js.map