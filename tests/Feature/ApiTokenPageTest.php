<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTokenPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/api-tokens')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)
            ->get('/api-tokens')
            ->assertOk();
    }

    public function test_store_creates_token(): void
    {
        $this->actingAs($this->user)->post('/api-tokens', [
            'name' => 'Test Token',
        ])->assertRedirect(route('api-tokens.index'));

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $this->user->id,
            'name' => 'Test Token',
        ]);
    }

    public function test_store_validates_name(): void
    {
        $this->actingAs($this->user)
            ->post('/api-tokens', ['name' => ''])
            ->assertSessionHasErrors('name');
    }

    public function test_destroy_revokes_token(): void
    {
        $token = $this->user->createToken('To Delete');

        $this->actingAs($this->user)
            ->delete("/api-tokens/{$token->accessToken->id}")
            ->assertRedirect(route('api-tokens.index'));

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token->accessToken->id]);
    }

    public function test_destroy_scoped_to_user(): void
    {
        $other = User::factory()->create(['tenant_id' => TenantFactory::new()->create()->id]);
        $token = $other->createToken('Other Token');

        $this->actingAs($this->user)
            ->delete("/api-tokens/{$token->accessToken->id}")
            ->assertRedirect(route('api-tokens.index'));

        $this->assertDatabaseHas('personal_access_tokens', ['id' => $token->accessToken->id]);
    }
}
