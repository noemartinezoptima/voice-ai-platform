<?php

namespace App\Infrastructure\Persistence\Eloquent\Sms;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Database\Factories\SmsMessageModelFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
