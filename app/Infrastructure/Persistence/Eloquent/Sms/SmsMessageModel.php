<?php

namespace App\Infrastructure\Persistence\Eloquent\Sms;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Database\Factories\SmsMessageModelFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string $from_number
 * @property string $to_number
 * @property string $body
 * @property string $direction
 * @property string $status
 * @property string|null $message_sid
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class SmsMessageModel extends Model
{
    /** @use HasFactory<SmsMessageModelFactory> */
    use HasFactory, HasUuids;

    protected $table = 'sms_messages';

    protected $fillable = [
        'tenant_id',
        'from_number',
        'to_number',
        'body',
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
}
