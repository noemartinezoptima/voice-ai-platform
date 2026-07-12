<?php

namespace App\Infrastructure\Persistence\Eloquent\Tenant;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Knowledge\DocumentModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;
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
        'encryption_key',
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

    public function getElevenLabsApiKeyAttribute(): ?string
    {
        $key = $this->settings['elevenlabs_api_key'] ?? null;
        if ($key === null) {
            return null;
        }
        try {
            return Crypt::decryptString($key);
        } catch (\Throwable) {
            return null;
        }
    }

    public function setElevenLabsApiKey(?string $value): void
    {
        $settings = $this->settings ?? [];
        if ($value !== null && $value !== '') {
            $settings['elevenlabs_api_key'] = Crypt::encryptString($value);
        } else {
            unset($settings['elevenlabs_api_key']);
        }
        $this->settings = $settings;
    }

    /** @return HasMany<User, $this> */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'tenant_id');
    }

    /** @return HasMany<FlowModel, $this> */
    public function flows(): HasMany
    {
        return $this->hasMany(FlowModel::class, 'tenant_id');
    }

    /** @return HasMany<CallModel, $this> */
    public function calls(): HasMany
    {
        return $this->hasMany(CallModel::class, 'tenant_id');
    }

    /** @return HasMany<DocumentModel, $this> */
    public function documents(): HasMany
    {
        return $this->hasMany(DocumentModel::class, 'tenant_id');
    }
}
