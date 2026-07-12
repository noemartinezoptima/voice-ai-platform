<?php

namespace App\Infrastructure\Persistence\Eloquent\ElevenLabs;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string $name
 * @property string $elevenlabs_agent_id
 * @property array<string, mixed>|null $config
 * @property bool $is_active
 */
class ElevenLabsAgentModel extends Model
{
    use HasUuids;

    protected $table = 'elevenlabs_agents';

    protected $fillable = [
        'tenant_id',
        'name',
        'elevenlabs_agent_id',
        'config',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<TenantModel, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(TenantModel::class, 'tenant_id');
    }
}
