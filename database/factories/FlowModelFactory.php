<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FlowModel>
 */
class FlowModelFactory extends Factory
{
    protected $model = FlowModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'phone_number' => null,
            'config' => [
                'start_step' => 's1',
                'steps' => [
                    's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hello from AI Voice Platform'], 'next' => 'hangup'],
                    'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                ],
            ],
            'is_active' => true,
            'version' => 1,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function withPhone(string $phone): static
    {
        return $this->state(fn (array $attributes) => [
            'phone_number' => $phone,
        ]);
    }
}
