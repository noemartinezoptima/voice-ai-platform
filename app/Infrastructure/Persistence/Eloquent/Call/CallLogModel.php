<?php

namespace App\Infrastructure\Persistence\Eloquent\Call;

use Carbon\Carbon;
use Database\Factories\CallLogModelFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $call_id
 * @property string $step_type
 * @property string|null $step_id
 * @property string|null $input
 * @property string|null $output
 * @property array<string, mixed>|null $metadata
 * @property int $duration_ms
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class CallLogModel extends Model
{
    /** @use HasFactory<CallLogModelFactory> */
    use HasFactory;

    protected $table = 'call_logs';

    protected $fillable = [
        'call_id',
        'step_type',
        'step_id',
        'input',
        'output',
        'metadata',
        'duration_ms',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'duration_ms' => 'integer',
        ];
    }

    /** @return BelongsTo<CallModel, $this> */
    public function call(): BelongsTo
    {
        return $this->belongsTo(CallModel::class, 'call_id');
    }
}
