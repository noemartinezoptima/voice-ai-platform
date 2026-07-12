<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Call\CallLogModel;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class CallLogModelFactory extends Factory
{
    protected $model = CallLogModel::class;

    public function definition(): array
    {
        return [
            'call_id' => CallModel::factory(),
            'step_type' => $this->faker->randomElement(['say', 'ask', 'llm', 'webhook', 'transfer', 'hangup', 'condition', 'knowledge']),
            'step_id' => $this->faker->uuid(),
            'input' => $this->faker->sentence(),
            'output' => $this->faker->sentence(),
            'metadata' => [],
            'duration_ms' => $this->faker->numberBetween(50, 5000),
        ];
    }
}
