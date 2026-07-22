<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDeliveryModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class WebhookDeliveryModelFactory extends Factory
{
    protected $model = WebhookDeliveryModel::class;

    public function definition(): array
    {
        return [
            'webhook_destination_id' => WebhookDestinationModelFactory::new(),
            'event' => $this->faker->randomElement(['call.completed', 'call.started', 'sms.inbound', 'flow.error']),
            'payload' => ['key' => 'value'],
            'status' => $this->faker->randomElement(['success', 'failed', 'pending']),
            'response_code' => $this->faker->randomElement([200, 201, 400, 500, null]),
            'response_body' => $this->faker->optional()->text(200),
            'attempt' => 1,
            'next_attempt_at' => null,
        ];
    }

    public function success(): static
    {
        return $this->state(fn () => [
            'status' => 'success',
            'response_code' => 200,
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn () => [
            'status' => 'failed',
            'response_code' => 500,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => 'pending',
            'response_code' => null,
            'response_body' => null,
        ]);
    }
}
