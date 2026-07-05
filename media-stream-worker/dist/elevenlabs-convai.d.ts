import { EventEmitter } from "events";
interface ConvAIConfig {
    agentId: string;
    apiKey: string;
}
export declare class ElevenLabsConvAI extends EventEmitter {
    private ws;
    private config;
    private _conversationId;
    constructor(config: ConvAIConfig);
    connect(): Promise<void>;
    private getSignedUrl;
    private handleMessage;
    sendAudio(audioBase64: string): void;
    private send;
    disconnect(): void;
    get conversationId(): string | null;
    get isConnected(): boolean;
}
export {};
//# sourceMappingURL=elevenlabs-convai.d.ts.map