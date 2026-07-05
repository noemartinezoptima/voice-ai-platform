<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_create_tenant(): void
    {
        $response = $this->withToken($this->token)->postJson('/api/v1/tenants', [
            'name' => 'New Corp',
            'slug' => 'new-corp',
        ]);

        $response->assertCreated();
        $response->assertJsonFragment(['name' => 'New Corp']);
    }

    public function test_create_tenant_validates_unique_slug(): void
    {
        TenantFactory::new()->create(['slug' => 'existing']);

        $response = $this->withToken($this->token)->postJson('/api/v1/tenants', [
            'name' => 'Test',
            'slug' => 'existing',
        ]);

        $response->assertJsonValidationErrors(['slug']);
    }

    public function test_show_tenant(): void
    {
        $tenant = TenantFactory::new()->create();

        $response = $this->withToken($this->token)->getJson("/api/v1/tenants/{$tenant->id}");

        $response->assertOk();
        $response->assertJsonFragment(['id' => $tenant->id]);
    }

    public function test_update_tenant(): void
    {
        $tenant = TenantFactory::new()->create();

        $response = $this->withToken($this->token)->putJson("/api/v1/tenants/{$tenant->id}", [
            'name' => 'Updated Corp',
        ]);

        $response->assertOk();
        $response->assertJsonFragment(['name' => 'Updated Corp']);
    }

    public function test_delete_tenant_returns_501(): void
    {
        $tenant = TenantFactory::new()->create();

        $response = $this->withToken($this->token)->deleteJson("/api/v1/tenants/{$tenant->id}");

        $response->assertStatus(501);
    }
}
