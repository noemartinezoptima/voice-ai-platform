<?php

namespace Database\Seeders;

use Database\Factories\CallModelFactory;
use Database\Factories\FlowModelFactory;
use Database\Factories\SmsMessageModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Database\Seeder;

class ProfileDataSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = TenantFactory::new()->count(5)->create();

        foreach ($tenants as $tenant) {
            FlowModelFactory::new()->count(10)->create([
                'tenant_id' => $tenant->id,
            ]);

            SmsMessageModelFactory::new()->count(500)->create([
                'tenant_id' => $tenant->id,
            ]);

            if (class_exists(CallModelFactory::class)) {
                CallModelFactory::new()->count(200)->create([
                    'tenant_id' => $tenant->id,
                ]);
            }
        }

        $this->command?->info(sprintf(
            'Profiling data seeded: %d tenants, %d flows, %d SMS, %d calls',
            5,
            5 * 10,
            5 * 500,
            5 * 200,
        ));
    }
}
