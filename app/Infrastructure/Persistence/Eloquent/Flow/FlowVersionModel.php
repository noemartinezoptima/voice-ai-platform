<?php

namespace App\Infrastructure\Persistence\Eloquent\Flow;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $flow_id
 * @property int|null $user_id
 * @property int $version
 * @property array<string, mixed> $config
 * @property string|null $change_description
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class FlowVersionModel extends Model
{
    use HasUuids;

    protected $table = 'flow_versions';

    protected $fillable = [
        'flow_id',
        'user_id',
        'version',
        'config',
        'change_description',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'version' => 'integer',
        ];
    }

    /** @return BelongsTo<FlowModel, $this> */
    public function flow(): BelongsTo
    {
        return $this->belongsTo(FlowModel::class, 'flow_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
