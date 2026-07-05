<?php

namespace App\Infrastructure\Persistence\Eloquent\Knowledge;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

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
}
