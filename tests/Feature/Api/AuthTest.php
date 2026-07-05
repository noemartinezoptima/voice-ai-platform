<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_request_gets_401(): void
    {
        $response = $this->getJson('/api/v1/flows');

        $response->assertUnauthorized();
    }

    public function test_authenticated_request_succeeds(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/flows');

        $response->assertOk();
    }
}
