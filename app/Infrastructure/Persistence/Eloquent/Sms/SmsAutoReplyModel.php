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
 * @property string $keyword
 * @property string $reply_text
 * @property bool $is_active
 * @property string $match_type
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class SmsAutoReplyModel extends Model
{
    use HasUuids;

    protected $table = 'sms_auto_replies';

    protected $fillable = [
        'tenant_id',
        'keyword',
        'reply_text',
        'is_active',
        'match_type',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<TenantModel, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class, 'tenant_id');
    }
}
