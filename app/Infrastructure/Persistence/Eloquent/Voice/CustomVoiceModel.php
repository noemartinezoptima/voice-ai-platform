<?php

namespace App\Infrastructure\Persistence\Eloquent\Voice;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string $elevenlabs_voice_id
 * @property string $name
 * @property string|null $preview_url
 * @property int $sample_count
 * @property string|null $description
 * @property array<string, mixed>|null $labels
 * @property bool $is_default
 * @property bool $requires_verification
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class CustomVoiceModel extends Model
{
    use HasUuids, LogsActivity;

    protected $table = 'custom_voices';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'tenant_id',
        'elevenlabs_voice_id',
        'name',
        'preview_url',
        'sample_count',
        'description',
        'labels',
        'is_default',
        'requires_verification',
    ];

    protected function casts(): array
    {
        return [
            'labels' => 'array',
            'is_default' => 'boolean',
            'requires_verification' => 'boolean',
            'sample_count' => 'integer',
        ];
    }

    /** @return BelongsTo<TenantModel, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class, 'tenant_id');
    }
}
