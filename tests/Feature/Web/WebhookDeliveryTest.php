<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDeliveryModel;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Database\Factories\WebhookDestinationModelFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookDeliveryTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private WebhookDestinationModel $destination;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email_verified_at' => now(),
        ]);
        $this->destination = WebhookDestinationModelFactory::new()->create([
            'tenant_id' => $tenant->id,
        ]);
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/settings/webhooks/deliveries')->assertRedirect('/login');
    }

    public function test_index_renders_empty_state(): void
    {
        $this->actingAs($this->user)
            ->get('/settings/webhooks/deliveries')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('WebhookDeliveries/Index'));
    }

    public function test_index_lists_deliveries(): void
    {
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
        ]);

        $this->actingAs($this->user)
            ->get('/settings/webhooks/deliveries')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('deliveries.data', 1));
    }

    public function test_index_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $otherDestination = WebhookDestinationModelFactory::new()->create(['tenant_id' => $otherTenant->id]);
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $otherDestination->id,
        ]);

        $this->actingAs($this->user)
            ->get('/settings/webhooks/deliveries')
            ->assertInertia(fn ($page) => $page->has('deliveries.data', 0));
    }

    public function test_filters_by_status(): void
    {
        WebhookDeliveryModel::factory()->count(2)->create([
            'webhook_destination_id' => $this->destination->id,
            'status' => 'success',
        ]);
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
            'status' => 'failed',
        ]);

        $this->actingAs($this->user)
            ->get('/settings/webhooks/deliveries?status=failed')
            ->assertInertia(fn ($page) => $page->has('deliveries.data', 1));
    }

    public function test_filters_by_event(): void
    {
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
            'event' => 'call.completed',
        ]);
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
            'event' => 'call.started',
        ]);

        $this->actingAs($this->user)
            ->get('/settings/webhooks/deliveries?event=call.started')
            ->assertInertia(fn ($page) => $page->has('deliveries.data', 1));
    }

    public function test_show_returns_delivery_json(): void
    {
        $delivery = WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
        ]);

        $this->actingAs($this->user)
            ->getJson("/settings/webhooks/deliveries/{$delivery->id}")
            ->assertOk()
            ->assertJsonPath('id', $delivery->id)
            ->assertJsonStructure(['id', 'status', 'event', 'payload', 'webhook_destination']);
    }

    public function test_show_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $otherDestination = WebhookDestinationModelFactory::new()->create(['tenant_id' => $otherTenant->id]);
        $delivery = WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $otherDestination->id,
        ]);

        $this->actingAs($this->user)
            ->getJson("/settings/webhooks/deliveries/{$delivery->id}")
            ->assertNotFound();
    }

    public function test_index_shows_stats(): void
    {
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
            'status' => 'success',
        ]);
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
            'status' => 'failed',
        ]);
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
            'status' => 'pending',
        ]);

        $this->actingAs($this->user)
            ->get('/settings/webhooks/deliveries')
            ->assertInertia(fn ($page) => $page
                ->has('stats')
                ->where('stats.total', 3)
            );
    }
}
