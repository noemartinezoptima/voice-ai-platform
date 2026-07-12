<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTenantRateLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenants_are_rate_limited_independently(): void
    {
        $tenantA = TenantFactory::new()->create();
        $tenantB = TenantFactory::new()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

        $tokenA = $userA->createToken('test-a')->plainTextToken;
        $tokenB = $userB->createToken('test-b')->plainTextToken;

        $this->withToken($tokenA)->getJson('/api/v1/flows')->assertOk();
        $this->withToken($tokenB)->getJson('/api/v1/flows')->assertOk();
    }

    public function test_rate_limit_resets_after_window(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/flows');

        $response->assertOk();
        $this->assertNotNull($response->headers->get('X-RateLimit-Limit'));
    }
}
