<?php

namespace Tests\Unit;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(): User
    {
        $tenant = TenantFactory::new()->create();

        return User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'search@test.com',
            'email_verified_at' => now(),
        ]);
    }

    public function test_unauthenticated_user_redirects_to_login(): void
    {
        $resp = $this->get('/search?q=test');

        $resp->assertRedirect(route('login'));
    }

    public function test_empty_query_returns_empty_data(): void
    {
        $resp = $this->actingAs($this->createUser())->get('/search');

        $resp->assertOk();
        $resp->assertJson(['data' => []]);
    }

    public function test_short_query_returns_empty_data(): void
    {
        $resp = $this->actingAs($this->createUser())->get('/search?q=x');

        $resp->assertOk();
        $resp->assertJson(['data' => []]);
    }

    public function test_search_returns_proper_data_structure(): void
    {
        $resp = $this->actingAs($this->createUser())->get('/search?q=+15551234567');

        $resp->assertOk();
        $resp->assertJsonStructure([
            'data' => [
                '*' => [
                    'type',
                    'id',
                    'title',
                    'subtitle',
                    'status',
                    'url',
                ],
            ],
        ]);
    }
}
