import { createServer } from "http";
import { WebSocketServer } from "ws";
import { ElevenLabsConvAI } from "./elevenlabs-convai.js";
import { muLawToPcm, pcmToMuLaw } from "./audio.js";
const calls = new Map();
function resample8to16(pcm8) {
    const len = pcm8.length;
    const pcm16 = new Int16Array(len * 2);
    for (let i = 0; i < len; i++) {
        pcm16[i * 2] = pcm8[i];
        pcm16[i * 2 + 1] = pcm8[i];
    }
    return pcm16;
}
function resample16to8(pcm16) {
    const len = Math.floor(pcm16.length / 2);
    const pcm8 = new Int16Array(len);
    for (let i = 0; i < len; i++) {
        pcm8[i] = pcm16[i * 2];
    }
    return pcm8;
}
export function createWsServer(redis) {
    const httpServer = createServer((req, res) => {
        if (req.url === "/health") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok", calls: calls.size }));
            return;
        }
        res.writeHead(404);
        res.end();
    });
    const wss = new WebSocketServer({ server: httpServer });
    wss.on("connection", (ws, req) => {
        const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
        const callSid = url.pathname.split("/").pop() ?? "";
        const tenantId = url.searchParams.get("tenant_id") ?? "";
        const flowId = url.searchParams.get("flow_id") ?? "";
        const elevenlabsApiKey = url.searchParams.get("elevenlabs_api_key") ?? "";
        const elevenlabsVoiceId = url.searchParams.get("elevenlabs_voice_id") ?? "";
        if (!callSid) {
            ws.close();
            return;
        }
        const agentId = process.env.ELEVENLABS_AGENT_ID;
        const apiKey = process.env.ELEVENLABS_API_KEY || elevenlabsApiKey;
        if (!agentId || !apiKey) {
            console.error("ELEVENLABS_AGENT_ID or ELEVENLABS_API_KEY not set");
            ws.close();
            return;
        }
        const stream = {
            callSid,
            tenantId,
            flowId,
            ws,
            redis,
            streamSid: null,
            convai: null,
        };
        calls.set(callSid, stream);
        console.log(`Call connected: ${callSid} (tenant=${tenantId})`);
        const convai = new ElevenLabsConvAI({ agentId, apiKey });
        convai.on("audio", ({ audio }) => {
            if (!stream.streamSid)
                return;
            const pcm16 = Buffer.from(audio, "base64");
            const pcm16Array = new Int16Array(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength / 2);
            const pcm8 = resample16to8(pcm16Array);
            const muLaw = pcmToMuLaw(pcm8);
            const msg = {
                event: "media",
                streamSid: stream.streamSid,
                media: { payload: muLaw },
            };
            ws.send(JSON.stringify(msg));
        });
        convai.on("user_transcript", (transcript) => {
            for (const entry of transcript) {
                if (entry.role === "user" && entry.content) {
                    redis.publish(`events:call.${callSid}`, JSON.stringify({
                        type: "transcript",
                        data: {
                            text: entry.content,
                            role: "user",
                            timestamp: Date.now(),
                        },
                    }));
                }
            }
        });
        convai.on("agent_response", ({ content, isFinal }) => {
            if (isFinal && content) {
                redis.publish(`events:call.${callSid}`, JSON.stringify({
                    type: "transcript",
                    data: {
                        text: content,
                        role: "agent",
                        timestamp: Date.now(),
                    },
                }));
            }
        });
        convai.on("error", (err) => {
            console.error(`ConvAI error for ${callSid}:`, err);
        });
        convai.on("disconnected", () => {
            console.log(`ConvAI disconnected for ${callSid}`);
            ws.close();
        });
        convai.on("close", () => {
            console.log(`ConvAI session closed for ${callSid}`);
            ws.close();
        });
        convai.connect().catch((err) => {
            console.error(`Failed to connect ConvAI for ${callSid}:`, err);
            ws.close();
        });
        stream.convai = convai;
        ws.on("message", (data) => {
            try {
                const msg = JSON.parse(data.toString());
                handleMessage(stream, msg);
            }
            catch (err) {
                console.error("Parse error:", err);
            }
        });
        ws.on("close", () => {
            console.log(`Call disconnected: ${callSid}`);
            cleanupCall(stream);
        });
        ws.on("error", (err) => {
            console.error(`WS error for ${callSid}:`, err);
            cleanupCall(stream);
        });
    });
    return httpServer;
}
function handleMessage(stream, msg) {
    switch (msg.event) {
        case "connected":
            stream.redis.publish(`events:call.${stream.callSid}`, JSON.stringify({
                type: "state_change",
                data: { status: "connected" },
            }));
            break;
        case "start":
            stream.streamSid = msg.streamSid;
            stream.redis.publish(`events:call.${stream.callSid}`, JSON.stringify({
                type: "state_change",
                data: {
                    status: "in_progress",
                    streamSid: msg.streamSid,
                    callSid: stream.callSid,
                },
            }));
            break;
        case "media":
            if (msg.media?.payload && stream.convai?.isConnected) {
                try {
                    const pcm8 = muLawToPcm(msg.media.payload);
                    const pcm16 = resample8to16(pcm8);
                    stream.convai.sendAudio(Buffer.from(pcm16.buffer).toString("base64"));
                }
                catch (err) {
                    console.error(`Audio error for ${stream.callSid}:`, err);
                }
            }
            break;
        case "stop":
            console.log(`Stream stopped: ${stream.callSid}`);
            break;
        default:
            console.log("Unknown event:", msg.event);
    }
}
function cleanupCall(stream) {
    if (stream.convai) {
        stream.convai.disconnect();
        stream.convai = null;
    }
    calls.delete(stream.callSid);
    stream.redis.publish(`events:call.${stream.callSid}`, JSON.stringify({
        type: "completed",
        data: {
            callSid: stream.callSid,
            duration_seconds: 0,
        },
    }));
}
//# sourceMappingURL=ws-server.js.map