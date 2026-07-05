<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'carlos@acmecorp.com'],
            [
                'name' => 'Carlos Mendoza',
                'password' => bcrypt('password'),
                'tenant_id' => '00000000-0000-0000-0000-000000000001',
                'role' => 'owner',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'ana@acmecorp.com'],
            [
                'name' => 'Ana López',
                'password' => bcrypt('password'),
                'tenant_id' => '00000000-0000-0000-0000-000000000001',
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'pedro@acmecorp.com'],
            [
                'name' => 'Pedro García',
                'password' => bcrypt('password'),
                'tenant_id' => '00000000-0000-0000-0000-000000000001',
                'role' => 'member',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'john@devtest.io'],
            [
                'name' => 'John Developer',
                'password' => bcrypt('password'),
                'tenant_id' => '00000000-0000-0000-0000-000000000002',
                'role' => 'owner',
                'email_verified_at' => now(),
            ]
        );
    }
}
