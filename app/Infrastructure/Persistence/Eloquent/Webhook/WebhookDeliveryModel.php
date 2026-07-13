<?php

namespace App\Infrastructure\Persistence\Eloquent\Webhook;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $webhook_destination_id
 * @property string $event
 * @property array<string, mixed> $payload
 * @property string $status
 * @property int|null $response_code
 * @property string|null $response_body
 * @property int $attempt
 * @property Carbon|null $next_attempt_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property WebhookDestinationModel $webhookDestination
 */
class WebhookDeliveryModel extends Model
{
    protected $table = 'webhook_deliveries';

    protected $fillable = [
        'webhook_destination_id',
        'event',
        'payload',
        'status',
        'response_code',
        'response_body',
        'attempt',
        'next_attempt_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'next_attempt_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<WebhookDestinationModel, *> */
    public function webhookDestination(): BelongsTo
    {
        return $this->belongsTo(WebhookDestinationModel::class);
    }
}
