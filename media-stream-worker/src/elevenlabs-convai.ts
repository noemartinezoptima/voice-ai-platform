import WebSocket from "ws";
import { EventEmitter } from "events";

interface ConvAIConfig {
  agentId: string;
  apiKey: string;
}

export class ElevenLabsConvAI extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: ConvAIConfig;
  private _conversationId: string | null = null;

  constructor(config: ConvAIConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    const signedUrl = await this.getSignedUrl();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, 10000);

      this.ws = new WebSocket(signedUrl);

      this.ws.on("open", () => {
        clearTimeout(timeout);
        this.emit("connected", this._conversationId);
        resolve();
      });

      this.ws.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          this.handleMessage(msg);
        } catch {
          this.emit("error", new Error("Failed to parse message"));
        }
      });

      this.ws.on("close", () => {
        clearTimeout(timeout);
        this.emit("disconnected");
        this.ws = null;
      });

      this.ws.on("error", (err) => {
        clearTimeout(timeout);
        this.emit("error", err);
        reject(err);
      });
    });
  }

  private async getSignedUrl(): Promise<string> {
    const resp = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${this.config.agentId}`,
      {
        headers: { "xi-api-key": this.config.apiKey },
      }
    );

    if (!resp.ok) {
      throw new Error(
        `Failed to get signed URL: ${resp.status} ${await resp.text()}`
      );
    }

    const data = (await resp.json()) as { signed_url: string };
    return data.signed_url;
  }

  private handleMessage(msg: any): void {
    switch (msg.type) {
      case "init":
        this._conversationId = msg.conversation_id;
        this.emit("init", msg.conversation_id);
        break;

      case "audio":
        this.emit("audio", {
          audio: msg.audio,
          isFinal: msg.is_final ?? false,
        });
        break;

      case "user_transcript":
        this.emit("user_transcript", msg.user_transcript);
        break;

      case "agent_response":
        this.emit("agent_response", {
          content: msg.content,
          isFinal: msg.is_final ?? true,
        });
        break;

      case "interruption":
        this.emit("interruption");
        break;

      case "close":
        this.emit("close");
        break;

      case "error":
        this.emit("error", new Error(msg.message ?? "Unknown error"));
        break;

      case "ping":
        this.send({ type: "pong" });
        break;
    }
  }

  sendAudio(audioBase64: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Not connected to ElevenLabs ConvAI");
    }

    this.send({ type: "audio", audio: audioBase64 });
  }

  private send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get conversationId(): string | null {
    return this._conversationId;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
