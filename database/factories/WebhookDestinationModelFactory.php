<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class WebhookDestinationModelFactory extends Factory
{
    protected $model = WebhookDestinationModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'url' => $this->faker->url(),
            'events' => ['call.completed'],
            'description' => $this->faker->sentence(),
            'is_active' => true,
        ];
    }
}
