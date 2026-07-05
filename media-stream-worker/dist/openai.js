import OpenAI from "openai";
import { EventEmitter } from "events";
export class OpenAIClient extends EventEmitter {
    client;
    config;
    constructor(apiKey, config = {}) {
        super();
        this.client = new OpenAI({ apiKey });
        this.config = {
            model: "gpt-4o",
            temperature: 0.7,
            maxTokens: 512,
            systemPrompt: "You are a helpful AI voice assistant. Be concise and conversational.",
            ...config,
        };
    }
    async chat(messages, tools) {
        const response = await this.client.chat.completions.create({
            model: this.config.model,
            messages: [
                { role: "system", content: this.config.systemPrompt },
                ...messages,
            ],
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
            tools: tools,
        });
        const choice = response.choices[0];
        return {
            content: choice.message.content ?? "",
            toolCalls: choice.message.tool_calls,
            usage: response.usage,
        };
    }
}
//# sourceMappingURL=openai.js.map