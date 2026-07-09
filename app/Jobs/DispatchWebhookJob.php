<?php

namespace App\Jobs;

use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class DispatchWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 10;

    /**
     * @param array<string, mixed> $payload
     */
    public function __construct(
        private readonly WebhookDestinationModel $webhook,
        private readonly array $payload,
    ) {}

    public function handle(): void
    {
        Http::timeout(8)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'User-Agent' => 'VoiceAI-Webhook/1.0',
            ])
            ->post($this->webhook->url, $this->payload);
    }
}
