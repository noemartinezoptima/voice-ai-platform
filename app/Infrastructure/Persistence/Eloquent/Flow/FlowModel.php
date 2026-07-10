<?php

namespace App\Infrastructure\Persistence\Eloquent\Flow;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string $name
 * @property string|null $description
 * @property string|null $phone_number
 * @property array<string, mixed> $config
 * @property bool $is_active
 * @property int $version
 */
class FlowModel extends Model
{
    use HasUuids, LogsActivity;

    protected $table = 'flows';

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
        'description',
        'phone_number',
        'config',
        'is_active',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'is_active' => 'boolean',
            'version' => 'integer',
        ];
    }
}
