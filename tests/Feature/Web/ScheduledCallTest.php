<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Call\ScheduledCallModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduledCallTest extends TestCase
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
        $this->get('/calls/scheduled')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)
            ->get('/calls/scheduled')
            ->assertInertia(fn ($page) => $page
                ->component('Calls/Scheduled/Index')
            );
    }

    public function test_store_creates_scheduled_call(): void
    {
        $flow = FlowModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Flow',
            'config' => [],
            'phone_number' => '+15551234567',
        ]);

        $this->actingAs($this->user)
            ->post('/calls/scheduled', [
                'flow_id' => $flow->id,
                'phone_number' => '+1234567890',
                'scheduled_at' => now()->addDay()->toDateTimeString(),
                'frequency' => 'once',
                'timezone' => 'UTC',
            ])
            ->assertRedirect(route('calls.scheduled'));

        $this->assertDatabaseHas('scheduled_calls', [
            'tenant_id' => $this->user->tenant_id,
            'flow_id' => $flow->id,
            'phone_number' => '+1234567890',
            'status' => 'pending',
            'frequency' => 'once',
        ]);
    }

    public function test_cancel_updates_status(): void
    {
        $flow = FlowModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Flow',
            'config' => [],
        ]);

        $call = ScheduledCallModel::create([
            'tenant_id' => $this->user->tenant_id,
            'flow_id' => $flow->id,
            'phone_number' => '+1234567890',
            'scheduled_at' => now()->addDay(),
            'frequency' => 'once',
            'timezone' => 'UTC',
            'status' => 'pending',
        ]);

        $this->actingAs($this->user)
            ->patch("/calls/scheduled/{$call->id}/cancel")
            ->assertRedirect(route('calls.scheduled'));

        $this->assertDatabaseHas('scheduled_calls', [
            'id' => $call->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_destroy_deletes_record(): void
    {
        $flow = FlowModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Flow',
            'config' => [],
        ]);

        $call = ScheduledCallModel::create([
            'tenant_id' => $this->user->tenant_id,
            'flow_id' => $flow->id,
            'phone_number' => '+1234567890',
            'scheduled_at' => now()->addDay(),
            'frequency' => 'once',
            'timezone' => 'UTC',
            'status' => 'cancelled',
        ]);

        $this->actingAs($this->user)
            ->delete("/calls/scheduled/{$call->id}")
            ->assertRedirect(route('calls.scheduled'));

        $this->assertDatabaseMissing('scheduled_calls', ['id' => $call->id]);
    }

    public function test_store_validates_required_fields(): void
    {
        $this->actingAs($this->user)
            ->post('/calls/scheduled', [])
            ->assertSessionHasErrors(['flow_id', 'phone_number', 'scheduled_at', 'frequency', 'timezone']);
    }

    public function test_cancel_rejects_completed_call(): void
    {
        $flow = FlowModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Flow',
            'config' => [],
        ]);

        $call = ScheduledCallModel::create([
            'tenant_id' => $this->user->tenant_id,
            'flow_id' => $flow->id,
            'phone_number' => '+1234567890',
            'scheduled_at' => now()->subDay(),
            'frequency' => 'once',
            'timezone' => 'UTC',
            'status' => 'completed',
        ]);

        $this->actingAs($this->user)
            ->patch("/calls/scheduled/{$call->id}/cancel")
            ->assertStatus(422);
    }

    public function test_destroy_rejects_in_progress_call(): void
    {
        $flow = FlowModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Flow',
            'config' => [],
        ]);

        $call = ScheduledCallModel::create([
            'tenant_id' => $this->user->tenant_id,
            'flow_id' => $flow->id,
            'phone_number' => '+1234567890',
            'scheduled_at' => now()->subDay(),
            'frequency' => 'once',
            'timezone' => 'UTC',
            'status' => 'in_progress',
        ]);

        $this->actingAs($this->user)
            ->delete("/calls/scheduled/{$call->id}")
            ->assertStatus(422);
    }

    public function test_calls_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $flow = FlowModel::create([
            'tenant_id' => $otherTenant->id,
            'name' => 'Other Flow',
            'config' => [],
        ]);

        $call = ScheduledCallModel::create([
            'tenant_id' => $otherTenant->id,
            'flow_id' => $flow->id,
            'phone_number' => '+1234567890',
            'scheduled_at' => now()->addDay(),
            'frequency' => 'once',
            'timezone' => 'UTC',
            'status' => 'pending',
        ]);

        $this->actingAs($this->user)
            ->patch("/calls/scheduled/{$call->id}/cancel")
            ->assertNotFound();
    }
}
