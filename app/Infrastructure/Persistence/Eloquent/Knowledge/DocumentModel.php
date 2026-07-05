<?php

namespace App\Infrastructure\Persistence\Eloquent\Knowledge;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string $name
 * @property string $resource_type
 * @property string $mime_type
 * @property string $path
 * @property string $status
 * @property string|null $error
 * @property array<string, mixed>|null $metadata
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class DocumentModel extends Model
{
    use HasUuids;

    protected $table = 'documents';

    protected $fillable = [
        'tenant_id',
        'name',
        'resource_type',
        'mime_type',
        'path',
        'status',
        'error',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }
}
