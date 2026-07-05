import { EventEmitter } from "events";
interface TTSConfig {
    voiceId: string;
    stability?: number;
    similarityBoost?: number;
    modelId?: string;
}
export declare class ElevenLabsTTS extends EventEmitter {
    private client;
    private config;
    private abortController;
    constructor(apiKey: string, config?: Partial<TTSConfig>);
    speak(text: string): Promise<void>;
    cancel(): void;
}
export {};
//# sourceMappingURL=elevenlabs.d.ts.map