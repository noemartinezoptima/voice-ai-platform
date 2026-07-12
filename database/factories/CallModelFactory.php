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
}
