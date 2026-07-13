<?php

namespace App\Infrastructure\Persistence\Eloquent\Call;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $call_id
 * @property string $tenant_id
 * @property int $total_score
 * @property int|null $politeness_score
 * @property int|null $resolution_score
 * @property int|null $duration_score
 * @property array<string, mixed>|null $details
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class CallQualityScoreModel extends Model
{
    use HasUuids;

    protected $table = 'call_quality_scores';

    protected $fillable = [
        'call_id',
        'tenant_id',
        'total_score',
        'politeness_score',
        'resolution_score',
        'duration_score',
        'details',
    ];

    protected function casts(): array
    {
        return [
            'total_score' => 'integer',
            'politeness_score' => 'integer',
            'resolution_score' => 'integer',
            'duration_score' => 'integer',
            'details' => 'array',
        ];
    }

    /** @return BelongsTo<CallModel, $this> */
    public function call(): BelongsTo
    {
        return $this->belongsTo(CallModel::class, 'call_id');
    }

    /** @return BelongsTo<TenantModel, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class, 'tenant_id');
    }
}
