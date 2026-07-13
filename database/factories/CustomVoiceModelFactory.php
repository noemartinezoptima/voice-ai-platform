<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Voice\CustomVoiceModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomVoiceModelFactory extends Factory
{
    protected $model = CustomVoiceModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'elevenlabs_voice_id' => fake()->uuid(),
            'name' => fake()->words(2, true),
            'preview_url' => null,
            'sample_count' => 3,
            'description' => fake()->sentence(),
            'labels' => null,
            'is_default' => false,
            'requires_verification' => false,
        ];
    }

    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }
}
