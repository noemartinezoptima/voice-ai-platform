<?php

namespace App\Infrastructure\Persistence\Eloquent\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property string $id
 * @property string $name
 * @property string $slug
 * @property array<string, mixed>|null $settings
 * @property bool $is_active
 * @property string $plan
 * @property string|null $stripe_customer_id
 */
class TenantModel extends Model
{
    use HasUuids, LogsActivity;

    protected $table = 'tenants';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'slug', 'settings', 'plan'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'name',
        'slug',
        'settings',
        'is_active',
        'plan',
        'stripe_customer_id',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'is_active' => 'boolean',
            'plan' => 'string',
        ];
    }

    /** @return array<string, mixed> */
    public function getDataProtectionAttribute(mixed $value): array
    {
        return array_merge([
            'consent_required' => false,
            'retention_days' => 90,
            'consent_message' => 'This call may be recorded for quality and training purposes. By continuing, you consent to recording.',
            'consent_recordings' => true,
            'consent_transcripts' => true,
        ], is_array($value) ? $value : (json_decode($value ?? '{}', true) ?: []));
    }
}
