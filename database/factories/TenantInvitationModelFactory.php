<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Team\TenantInvitationModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TenantInvitationModelFactory extends Factory
{
    protected $model = TenantInvitationModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'email' => fake()->email(),
            'role' => 'member',
            'token' => Str::random(64),
        ];
    }
}
