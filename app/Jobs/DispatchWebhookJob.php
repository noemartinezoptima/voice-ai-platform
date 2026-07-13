<?php

namespace App\Jobs;

use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDeliveryModel;
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

    public int $tries = 3;

    /** @var array<int, int> */
    public array $backoff = [10, 60, 300];

    public int $timeout = 10;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        private readonly WebhookDestinationModel $webhook,
        private readonly array $payload,
        private readonly string $event,
    ) {}

    public function handle(): void
    {
        $response = Http::timeout(8)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'User-Agent' => 'VoiceAI-Webhook/1.0',
            ])
            ->post($this->webhook->url, $this->payload);

        WebhookDeliveryModel::create([
            'webhook_destination_id' => $this->webhook->id,
            'event' => $this->event,
            'payload' => $this->payload,
            'status' => $response->successful() ? 'success' : 'failed',
            'response_code' => $response->status(),
            'response_body' => mb_substr($response->body(), 0, 5000),
            'attempt' => $this->attempts(),
            'next_attempt_at' => $response->failed() ? now()->addSeconds($this->getBackoff()) : null,
        ]);
    }

    public function failed(\Throwable $e): void
    {
        WebhookDeliveryModel::create([
            'webhook_destination_id' => $this->webhook->id,
            'event' => $this->event,
            'payload' => $this->payload,
            'status' => 'dead',
            'response_code' => 0,
            'response_body' => mb_substr($e->getMessage(), 0, 5000),
            'attempt' => $this->attempts(),
        ]);
    }

    public function retryUntil(): \DateTime
    {
        return now()->addMinutes(5);
    }

    private function getBackoff(): int
    {
        $index = min($this->attempts() - 1, count($this->backoff) - 1);

        return $this->backoff[$index];
    }
}
