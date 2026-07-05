import { EventEmitter } from "events";
interface DeepgramConfig {
    model: string;
    language?: string;
    smartFormat?: boolean;
    utteranceEndMs?: number;
    interimResults?: boolean;
    endpointing?: number;
}
export declare class DeepgramSTT extends EventEmitter {
    private client;
    private socket;
    private config;
    constructor(apiKey: string, config?: Partial<DeepgramConfig>);
    connect(): Promise<void>;
    sendAudio(audioBase64: string): void;
    disconnect(): void;
}
export {};
//# sourceMappingURL=deepgram.d.ts.map