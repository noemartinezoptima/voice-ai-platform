import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { EventEmitter } from "events";
export class ElevenLabsTTS extends EventEmitter {
    client;
    config;
    abortController = null;
    constructor(apiKey, config = {}) {
        super();
        this.client = new ElevenLabsClient({ apiKey });
        this.config = {
            voiceId: "21m00Tcm4TlvDq8ikWAM",
            stability: 0.7,
            similarityBoost: 0.8,
            modelId: "eleven_turbo_v2",
            ...config,
        };
    }
    async speak(text) {
        this.abortController = new AbortController();
        try {
            const response = await this.client.textToSpeech.stream(this.config.voiceId, {
                text,
                modelId: this.config.modelId,
                outputFormat: "ulaw_8000",
            });
            const reader = response.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                this.emit("audio", {
                    audio: Buffer.from(value).toString("base64"),
                    isFinal: false,
                });
            }
            this.emit("done");
        }
        catch (err) {
            if (err?.name === "AbortError") {
                this.emit("cancel");
                return;
            }
            this.emit("error", err);
        }
    }
    cancel() {
        this.abortController?.abort();
        this.abortController = null;
    }
}
//# sourceMappingURL=elevenlabs.js.map