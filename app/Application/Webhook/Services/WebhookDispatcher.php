<?php

namespace App\Application\Webhook\Services;

use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use App\Jobs\DispatchWebhookJob;

class WebhookDispatcher
{
    /** @param array<string, mixed> $data */
    public function dispatch(string $event, array $data): void
    {
        $webhooks = WebhookDestinationModel::where('is_active', true)
            ->whereJsonContains('events', $event)
            ->get();

        $payload = [
            'event' => $event,
            'timestamp' => now()->toIso8601String(),
            'data' => $data,
        ];

        foreach ($webhooks as $webhook) {
            DispatchWebhookJob::dispatch($webhook, $payload);
        }
    }
}
