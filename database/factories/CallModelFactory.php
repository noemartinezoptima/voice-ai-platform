<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class CallModelFactory extends Factory
{
    protected $model = CallModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'call_sid' => 'CA'.$this->faker->regexify('[A-Za-z0-9]{32}'),
            'from_number' => $this->faker->phoneNumber(),
            'to_number' => $this->faker->phoneNumber(),
            'direction' => 'inbound',
            'status' => 'completed',
            'duration_seconds' => $this->faker->numberBetween(10, 600),
            'context' => ['foo' => 'bar'],
            'started_at' => now()->subHours(rand(1, 48)),
        ];
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'error' => 'Call failed',
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
        ]);
    }

    public function outbound(): static
    {
        return $this->state(fn (array $attributes) => [
            'direction' => 'outbound',
        ]);
    }

    public function retried(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }
}
