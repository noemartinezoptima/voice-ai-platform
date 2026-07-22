<?php

namespace App\Infrastructure\Persistence\Eloquent\Sms;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Database\Factories\SmsMessageModelFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Laravel\Scout\Searchable;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string $from_number
 * @property string $to_number
 * @property string $body
 * @property string $channel
 * @property string $direction
 * @property string $status
 * @property string|null $message_sid
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class SmsMessageModel extends Model
{
    /** @use HasFactory<SmsMessageModelFactory> */
    use HasFactory, HasUuids, Searchable;

    protected static function newFactory(): SmsMessageModelFactory
    {
        return SmsMessageModelFactory::new();
    }

    protected $table = 'sms_messages';

    protected $fillable = [
        'tenant_id',
        'from_number',
        'to_number',
        'body',
        'channel',
        'direction',
        'status',
        'message_sid',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<TenantModel, *> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class);
    }

    /** @return array<string, mixed> */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'from_number' => $this->from_number,
            'to_number' => $this->to_number,
            'body' => $this->body,
            'channel' => $this->channel,
            'direction' => $this->direction,
        ];
    }
}
