<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use Carbon\Carbon;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class CheckTokenExpiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_expired_token_returns_401(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $accessToken = PersonalAccessToken::findToken($token);
        $accessToken?->update(['expires_at' => Carbon::yesterday()]);

        $response = $this->withToken($token)->getJson('/api/v1/flows');

        $response->assertUnauthorized();
    }

    public function test_valid_token_with_no_expiry_returns_200(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/flows');

        $response->assertOk();
    }

    public function test_valid_token_with_future_expiry_returns_200(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $accessToken = PersonalAccessToken::findToken($token);
        $accessToken?->update(['expires_at' => Carbon::tomorrow()]);

        $response = $this->withToken($token)->getJson('/api/v1/flows');

        $response->assertOk();
    }
}
