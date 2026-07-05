<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class ApiTokenSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'john@devtest.io')->first();

        if ($user) {
            $user->createToken('dev-client', ['read', 'write']);
        }

        $owner = User::where('email', 'carlos@acmecorp.com')->first();

        if ($owner) {
            $owner->createToken('production-integration', ['read', 'write', 'delete']);
            $owner->createToken('monitoring-service', ['read']);
        }
    }
}
