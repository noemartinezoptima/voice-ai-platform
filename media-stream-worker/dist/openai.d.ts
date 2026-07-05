import { EventEmitter } from "events";
interface LLMConfig {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
}
export declare class OpenAIClient extends EventEmitter {
    private client;
    private config;
    constructor(apiKey: string, config?: Partial<LLMConfig>);
    chat(messages: Array<{
        role: "user" | "assistant" | "system";
        content: string;
    }>, tools?: Array<{
        type: "function";
        function: {
            name: string;
            description: string;
            parameters: Record<string, unknown>;
        };
    }>): Promise<{
        content: string;
        toolCalls?: unknown[];
        usage?: unknown;
    }>;
}
export {};
//# sourceMappingURL=openai.d.ts.map