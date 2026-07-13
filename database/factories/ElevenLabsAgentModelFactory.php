<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\ElevenLabs\ElevenLabsAgentModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class ElevenLabsAgentModelFactory extends Factory
{
    protected $model = ElevenLabsAgentModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'elevenlabs_agent_id' => fake()->uuid(),
            'name' => fake()->words(2, true),
            'is_active' => true,
            'config' => [
                'prompt' => [
                    'system' => 'You are a helpful voice assistant.',
                    'temperature' => 0.7,
                    'max_tokens' => 500,
                ],
            ],
        ];
    }
}
