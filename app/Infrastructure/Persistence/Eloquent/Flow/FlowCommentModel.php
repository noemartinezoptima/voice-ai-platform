<?php

namespace App\Infrastructure\Persistence\Eloquent\Flow;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $flow_id
 * @property string $tenant_id
 * @property int $user_id
 * @property string $body
 * @property string|null $parent_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class FlowCommentModel extends Model
{
    use HasUuids;

    protected $table = 'flow_comments';

    protected $fillable = [
        'flow_id',
        'tenant_id',
        'user_id',
        'body',
        'parent_id',
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

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** @return HasMany<FlowCommentModel, $this> */
    public function replies(): HasMany
    {
        return $this->hasMany(FlowCommentModel::class, 'parent_id');
    }

    /** @return BelongsTo<FlowCommentModel, $this> */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(FlowCommentModel::class, 'parent_id');
    }
}
