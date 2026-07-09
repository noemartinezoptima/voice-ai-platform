<?php

namespace App\Infrastructure\Persistence\Eloquent\Webhook;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Database\Factories\WebhookDestinationModelFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string $url
 * @property array<int, string> $events
 * @property string|null $description
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class WebhookDestinationModel extends Model
{
    /** @use HasFactory<WebhookDestinationModelFactory> */
    use HasFactory, HasUuids;

    protected $table = 'webhook_destinations';

    protected $fillable = [
        'tenant_id',
        'url',
        'events',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'events' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<TenantModel, *> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class);
    }

    protected static function newFactory(): WebhookDestinationModelFactory
    {
        return WebhookDestinationModelFactory::new();
    }
}
