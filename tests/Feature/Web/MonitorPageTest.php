<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Database\Factories\CallModelFactory;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MonitorPageTest extends TestCase
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
        $this->get('/monitor')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)->get('/monitor')->assertOk();
    }

    public function test_index_shows_active_calls(): void
    {
        CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'status' => 'in_progress',
            'from_number' => '+15551234567',
        ]);

        $this->actingAs($this->user)
            ->get('/monitor')
            ->assertOk()
            ->assertSee('+15551234567');
    }

    public function test_index_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        CallModelFactory::new()->create([
            'tenant_id' => $otherTenant->id,
            'status' => 'in_progress',
            'from_number' => '+2222',
        ]);

        $response = $this->actingAs($this->user)->get('/monitor');

        $response->assertOk();
        $response->assertDontSee('+2222');
    }

    public function test_index_excludes_completed_calls(): void
    {
        CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'status' => 'completed',
            'from_number' => '+15551234567',
        ]);

        $this->actingAs($this->user)
            ->get('/monitor')
            ->assertOk()
            ->assertDontSee('+15551234567');
    }

    public function test_active_endpoint_returns_json(): void
    {
        CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'status' => 'ringing',
            'from_number' => '+15559876543',
        ]);

        $response = $this->actingAs($this->user)->getJson('/monitor/active');

        $response->assertOk();
        $response->assertJsonStructure(['calls']);
        $response->assertJsonCount(1, 'calls');
    }

    public function test_active_endpoint_scoped_to_tenant(): void
    {
        CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'status' => 'initiated',
            'from_number' => '+1111',
        ]);
        $otherTenant = TenantFactory::new()->create();
        CallModelFactory::new()->create([
            'tenant_id' => $otherTenant->id,
            'status' => 'ringing',
            'from_number' => '+2222',
        ]);

        $response = $this->actingAs($this->user)->getJson('/monitor/active');

        $response->assertJsonCount(1, 'calls');
        $response->assertJsonPath('calls.0.from_number', '+1111');
    }

    public function test_active_endpoint_empty_when_no_calls(): void
    {
        $response = $this->actingAs($this->user)->getJson('/monitor/active');

        $response->assertOk();
        $response->assertJsonCount(0, 'calls');
        $response->assertJson(['calls' => []]);
    }

    public function test_active_requires_authentication(): void
    {
        $this->getJson('/monitor/active')->assertRedirect('/login');
    }

    public function test_index_shows_flow_name(): void
    {
        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Support Bot',
        ]);
        CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'status' => 'in_progress',
            'flow_id' => $flow->id,
        ]);

        $this->actingAs($this->user)
            ->get('/monitor')
            ->assertOk()
            ->assertSee('Support Bot');
    }

    public function test_active_endpoint_includes_flow_name(): void
    {
        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Onboarding',
        ]);
        CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'status' => 'in_progress',
            'flow_id' => $flow->id,
        ]);

        $response = $this->actingAs($this->user)->getJson('/monitor/active');

        $response->assertJsonPath('calls.0.flow_name', 'Onboarding');
    }
}
