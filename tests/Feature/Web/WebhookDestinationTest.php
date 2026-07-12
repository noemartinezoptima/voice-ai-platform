<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Database\Factories\TenantFactory;
use Database\Factories\WebhookDestinationModelFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookDestinationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->user->givePermissionTo('webhooks.manage');
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/settings/webhooks')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)->get('/settings/webhooks')->assertOk();
    }

    public function test_store_creates_webhook(): void
    {
        $this->actingAs($this->user)->post('/settings/webhooks', [
            'url' => 'https://example.com/hook',
            'events' => ['call.completed'],
            'description' => 'Test webhook',
        ])->assertRedirect('/settings/webhooks');

        $this->assertDatabaseHas('webhook_destinations', [
            'tenant_id' => $this->user->tenant_id,
            'url' => 'https://example.com/hook',
        ]);
    }

    public function test_store_validates_events(): void
    {
        $this->actingAs($this->user)->post('/settings/webhooks', [
            'url' => 'https://example.com/hook',
            'events' => ['invalid.event'],
        ])->assertSessionHasErrors('events.0');
    }

    public function test_update_modifies_webhook(): void
    {
        $webhook = WebhookDestinationModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
        ]);

        $this->actingAs($this->user)->patch("/settings/webhooks/{$webhook->id}", [
            'url' => 'https://updated.com/hook',
            'events' => ['call.failed'],
            'is_active' => false,
            'description' => 'Updated',
        ])->assertRedirect('/settings/webhooks');

        $this->assertDatabaseHas('webhook_destinations', [
            'id' => $webhook->id,
            'url' => 'https://updated.com/hook',
            'is_active' => false,
        ]);
    }

    public function test_destroy_removes_webhook(): void
    {
        $webhook = WebhookDestinationModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
        ]);

        $this->actingAs($this->user)->delete("/settings/webhooks/{$webhook->id}")
            ->assertRedirect('/settings/webhooks');

        $this->assertDatabaseMissing('webhook_destinations', ['id' => $webhook->id]);
    }

    public function test_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $webhook = WebhookDestinationModelFactory::new()->create(['tenant_id' => $otherTenant->id]);

        $this->actingAs($this->user)
            ->delete("/settings/webhooks/{$webhook->id}")
            ->assertNotFound();
    }
}
