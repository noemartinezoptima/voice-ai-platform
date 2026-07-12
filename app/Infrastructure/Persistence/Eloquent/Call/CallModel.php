<?php

namespace App\Infrastructure\Persistence\Eloquent\Call;

use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string|null $flow_id
 * @property string $call_sid
 * @property string $from_number
 * @property string $to_number
 * @property string $status
 * @property int $duration_seconds
 * @property string|null $current_step
 * @property array<string, mixed>|null $context
 * @property string|null $error
 * @property string|null $recording_sid
 * @property string|null $recording_url
 * @property string|null $recording_path
 * @property string|null $notes
 * @property string|null $retry_of_id
 * @property Carbon|null $started_at
 * @property Carbon|null $ended_at
 */
class CallModel extends Model
{
    use HasUuids;

    protected $table = 'calls';

    protected $fillable = [
        'tenant_id',
        'flow_id',
        'call_sid',
        'from_number',
        'to_number',
        'status',
        'duration_seconds',
        'current_step',
        'context',
        'error',
        'recording_sid',
        'recording_url',
        'recording_path',
        'notes',
        'retry_of_id',
        'started_at',
        'ended_at',
    ];

    /** @return BelongsTo<FlowModel, $this> */
    public function flow(): BelongsTo
    {
        return $this->belongsTo(FlowModel::class, 'flow_id');
    }

    /** @return BelongsTo<TenantModel, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class, 'tenant_id');
    }

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'duration_seconds' => 'integer',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }
}
