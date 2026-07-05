<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        TenantModel::firstOrCreate(
            ['id' => '00000000-0000-0000-0000-000000000001'],
            [
                'name' => 'Acme Corp',
                'slug' => 'acme-corp',
                'settings' => [
                    'timezone' => 'America/Mexico_City',
                    'language' => 'es',
                    'notifications' => ['email' => true, 'slack' => false],
                ],
                'is_active' => true,
            ]
        );

        TenantModel::firstOrCreate(
            ['id' => '00000000-0000-0000-0000-000000000002'],
            [
                'name' => 'DevTest Labs',
                'slug' => 'devtest',
                'settings' => [
                    'timezone' => 'UTC',
                    'language' => 'en',
                    'notifications' => ['email' => true],
                ],
                'is_active' => true,
            ]
        );
    }
}
