<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Sms\SmsMessageModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class SmsMessageModelFactory extends Factory
{
    protected $model = SmsMessageModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'from_number' => $this->faker->phoneNumber(),
            'to_number' => $this->faker->phoneNumber(),
            'body' => $this->faker->sentence(),
            'channel' => 'sms',
            'direction' => 'inbound',
            'status' => 'received',
        ];
    }
}
