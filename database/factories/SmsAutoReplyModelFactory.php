<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Sms\SmsAutoReplyModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class SmsAutoReplyModelFactory extends Factory
{
    protected $model = SmsAutoReplyModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'keyword' => fake()->word(),
            'reply_text' => fake()->sentence(),
            'is_active' => true,
            'match_type' => 'contains',
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
