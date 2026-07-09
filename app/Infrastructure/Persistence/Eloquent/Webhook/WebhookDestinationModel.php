<?php

namespace App\Infrastructure\Persistence\Eloquent\Webhook;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Database\Factories\WebhookDestinationModelFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string $url
 * @property array<int, string> $events
 * @property string|null $description
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class WebhookDestinationModel extends Model
{
    /** @use HasFactory<\Database\Factories\WebhookDestinationModelFactory> */
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

    /** @return BelongsTo<\App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel, *> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class);
    }

    protected static function newFactory(): WebhookDestinationModelFactory
    {
        return WebhookDestinationModelFactory::new();
    }
}
