<?php

namespace Database\Seeders;

use Database\Factories\SmsMessageModelFactory;
use Illuminate\Database\Seeder;

class SmsMessageSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('Creating SMS messages...');

        for ($i = 0; $i < 10; $i++) {
            SmsMessageModelFactory::new()
                ->withTenantId('00000000-0000-0000-0000-000000000001')
                ->create();
        }

        for ($i = 0; $i < 10; $i++) {
            SmsMessageModelFactory::new()
                ->withTenantId('00000000-0000-0000-0000-000000000001')
                ->outbound()
                ->create();
        }

        for ($i = 0; $i < 5; $i++) {
            SmsMessageModelFactory::new()
                ->withTenantId('00000000-0000-0000-0000-000000000001')
                ->whatsapp()
                ->create();
        }

        for ($i = 0; $i < 5; $i++) {
            SmsMessageModelFactory::new()
                ->withTenantId('00000000-0000-0000-0000-000000000001')
                ->whatsapp()
                ->outbound()
                ->create();
        }
    }
}
