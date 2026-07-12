<?php

namespace App\Infrastructure\Persistence\Eloquent\Knowledge;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

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
    use HasUuids, LogsActivity;

    protected $table = 'documents';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

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

    /** @return BelongsTo<TenantModel, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class, 'tenant_id');
    }
}
