<?php

namespace App\Infrastructure\Persistence\Eloquent\Sms;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string $name
 * @property string $message
 * @property array<int, string> $recipients
 * @property string $status
 * @property int $sent_count
 * @property int $total_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class SmsCampaignModel extends Model
{
    use HasUuids;

    protected $table = 'sms_campaigns';

    protected $fillable = [
        'tenant_id',
        'name',
        'message',
        'recipients',
        'status',
        'sent_count',
        'total_count',
    ];

    protected function casts(): array
    {
        return [
            'recipients' => 'array',
        ];
    }

    /** @return BelongsTo<TenantModel, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class, 'tenant_id');
    }
}
