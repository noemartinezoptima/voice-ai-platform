<?php

namespace App\Infrastructure\Persistence\Eloquent\ElevenLabs;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

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
}
