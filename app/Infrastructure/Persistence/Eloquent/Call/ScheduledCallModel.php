<?php

namespace App\Infrastructure\Persistence\Eloquent\Call;

use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string $flow_id
 * @property string $phone_number
 * @property string $scheduled_at
 * @property string $frequency
 * @property string $status
 * @property string $timezone
 * @property string|null $last_triggered_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ScheduledCallModel extends Model
{
    use HasUuids;

    protected $table = 'scheduled_calls';

    protected $fillable = [
        'tenant_id', 'flow_id', 'phone_number', 'scheduled_at',
        'frequency', 'status', 'timezone', 'last_triggered_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'last_triggered_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<TenantModel, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class);
    }

    /** @return BelongsTo<FlowModel, $this> */
    public function flow(): BelongsTo
    {
        return $this->belongsTo(FlowModel::class);
    }

    /** @param Builder<$this> $query */
    public function scopePending(Builder $query): void
    {
        $query->where('status', 'pending');
    }

    /** @param Builder<$this> $query */
    public function scopeDue(Builder $query): void
    {
        $query->where('status', 'pending')->where('scheduled_at', '<=', now());
    }
}
