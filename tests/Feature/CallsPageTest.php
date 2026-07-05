<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CallsPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_calls_index_requires_authentication(): void
    {
        $this->get('/calls')->assertRedirect('/login');
    }

    public function test_calls_index_renders(): void
    {
        $this->actingAs($this->user)
            ->get('/calls')
            ->assertOk();
    }

    public function test_calls_index_shows_calls(): void
    {
        CallModelFactory::new()->count(3)->create(['tenant_id' => $this->user->tenant_id]);

        $response = $this->actingAs($this->user)->get('/calls');

        $response->assertOk();
    }

    public function test_calls_index_scoped_to_tenant(): void
    {
        $myTenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $myTenant->id]);

        CallModelFactory::new()->create(['tenant_id' => $myTenant->id, 'from_number' => '+1111']);
        $otherTenant = TenantFactory::new()->create();
        CallModelFactory::new()->create(['tenant_id' => $otherTenant->id, 'from_number' => '+2222']);

        $response = $this->actingAs($this->user)->get('/calls');

        $response->assertOk();
        $response->assertSee('+1111');
        $response->assertDontSee('+2222');
    }

    public function test_calls_index_filters_by_status(): void
    {
        CallModelFactory::new()->create(['tenant_id' => $this->user->tenant_id, 'status' => 'completed', 'from_number' => '+1111']);
        CallModelFactory::new()->create(['tenant_id' => $this->user->tenant_id, 'status' => 'failed', 'from_number' => '+2222']);

        $response = $this->actingAs($this->user)->get('/calls?status=completed');

        $response->assertOk();
        $response->assertSee('+1111');
        $response->assertDontSee('+2222');
    }

    public function test_calls_index_searches_by_number(): void
    {
        CallModelFactory::new()->create(['tenant_id' => $this->user->tenant_id, 'from_number' => '+15551234567']);
        CallModelFactory::new()->create(['tenant_id' => $this->user->tenant_id, 'from_number' => '+19998887777']);

        $response = $this->actingAs($this->user)->get('/calls?search=555');

        $response->assertOk();
        $response->assertSee('+15551234567');
        $response->assertDontSee('+19998887777');
    }

    public function test_calls_show_renders(): void
    {
        $call = CallModelFactory::new()->create(['tenant_id' => $this->user->tenant_id]);

        $this->actingAs($this->user)
            ->get("/calls/{$call->id}")
            ->assertOk();
    }

    public function test_calls_show_requires_authentication(): void
    {
        $call = CallModelFactory::new()->create();

        $this->get("/calls/{$call->id}")->assertRedirect('/login');
    }

    public function test_calls_show_returns_404_for_other_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $call = CallModelFactory::new()->create(['tenant_id' => $otherTenant->id]);

        $this->actingAs($this->user)
            ->get("/calls/{$call->id}")
            ->assertNotFound();
    }

    public function test_calls_show_returns_404_for_missing(): void
    {
        $this->actingAs($this->user)
            ->get('/calls/nonexistent-id')
            ->assertNotFound();
    }
}
