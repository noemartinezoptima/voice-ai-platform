<?php

namespace App\Infrastructure\Persistence\Eloquent\Knowledge;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $document_id
 * @property string $tenant_id
 * @property int $chunk_index
 * @property string $content
 * @property string|null $embedding
 * @property array<string, mixed>|null $metadata
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ChunkModel extends Model
{
    use HasUuids;

    protected $table = 'knowledge_chunks';

    protected $fillable = [
        'document_id',
        'tenant_id',
        'chunk_index',
        'content',
        'embedding',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    /** @return BelongsTo<TenantModel, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class, 'tenant_id');
    }
}
