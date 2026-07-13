<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Sms\SmsCampaignModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class SmsCampaignModelFactory extends Factory
{
    protected $model = SmsCampaignModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'name' => fake()->words(3, true),
            'message' => fake()->sentence(),
            'recipients' => [fake()->phoneNumber(), fake()->phoneNumber(), fake()->phoneNumber()],
            'status' => 'draft',
            'sent_count' => 0,
            'total_count' => 0,
        ];
    }
}
