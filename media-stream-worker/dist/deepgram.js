import { DeepgramClient } from "@deepgram/sdk";
import { EventEmitter } from "events";
export class DeepgramSTT extends EventEmitter {
    client;
    socket = null;
    config;
    constructor(apiKey, config = {}) {
        super();
        this.client = new DeepgramClient({ apiKey });
        this.config = {
            model: "nova-2",
            language: "en",
            smartFormat: true,
            utteranceEndMs: 1000,
            interimResults: true,
            endpointing: 300,
            ...config,
        };
    }
    async connect() {
        if (this.socket)
            return;
        const socket = await this.client.listen.v1.connect({
            model: this.config.model,
            language: this.config.language,
            smart_format: this.config.smartFormat ? "true" : "false",
            utterance_end_ms: this.config.utteranceEndMs,
            interim_results: this.config.interimResults ? "true" : "false",
            endpointing: this.config.endpointing,
            encoding: "mulaw",
            sample_rate: 8000,
            channels: 1,
            Authorization: `Token ${this.client._options?.apiKey ?? ""}`,
        });
        this.socket = socket;
        socket.on("open", () => {
            this.emit("connected");
        });
        socket.on("error", (err) => {
            this.emit("error", err);
        });
        socket.on("close", () => {
            this.emit("disconnected");
            this.socket = null;
        });
        socket.on("message", (msg) => {
            if (msg.type !== "Results")
                return;
            const { is_final, channel } = msg;
            if (!channel?.alternatives?.[0])
                return;
            const transcript = channel.alternatives[0].transcript;
            const confidence = channel.alternatives[0].confidence ?? 0;
            if (!transcript)
                return;
            const event = { transcript, isFinal: is_final ?? false, confidence };
            this.emit("transcript", event);
            if (is_final) {
                this.emit("utterance", event);
            }
        });
    }
    sendAudio(audioBase64) {
        if (!this.socket) {
            throw new Error("Deepgram not connected");
        }
        const buffer = Buffer.from(audioBase64, "base64");
        this.socket.sendMedia(buffer);
    }
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}
//# sourceMappingURL=deepgram.js.map