<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDeliveryModel;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use App\Jobs\DispatchWebhookJob;
use App\Models\User;
use Database\Factories\TenantFactory;
use Database\Factories\WebhookDestinationModelFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
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

    public function test_filters_by_destination(): void
    {
        $otherDest = WebhookDestinationModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
        ]);
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
        ]);
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $otherDest->id,
        ]);

        $this->actingAs($this->user)
            ->get('/settings/webhooks/deliveries?destination_id='.$this->destination->id)
            ->assertInertia(fn ($page) => $page->has('deliveries.data', 1));
    }

    public function test_filters_by_search(): void
    {
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
            'event' => 'call.completed',
        ]);
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
            'event' => 'flow.error',
        ]);

        $this->actingAs($this->user)
            ->get('/settings/webhooks/deliveries?search=flow')
            ->assertInertia(fn ($page) => $page->has('deliveries.data', 1));
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
                ->where('stats.successful', 1)
                ->where('stats.failed', 1)
                ->where('stats.pending', 1)
            );
    }

    public function test_success_rate_calculated_correctly(): void
    {
        WebhookDeliveryModel::factory()->count(3)->create([
            'webhook_destination_id' => $this->destination->id,
            'status' => 'success',
        ]);
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
            'status' => 'failed',
        ]);

        $this->actingAs($this->user)
            ->get('/settings/webhooks/deliveries')
            ->assertInertia(fn ($page) => $page
                ->where('successRate', 75)
            );
    }

    public function test_stats_scoped_to_tenant(): void
    {
        WebhookDeliveryModel::factory()->create([
            'webhook_destination_id' => $this->destination->id,
            'status' => 'success',
        ]);

        $otherTenant = TenantFactory::new()->create();
        $otherDest = WebhookDestinationModelFactory::new()->create(['tenant_id' => $otherTenant->id]);
        WebhookDeliveryModel::factory()->count(5)->create([
            'webhook_destination_id' => $otherDest->id,
            'status' => 'success',
        ]);

        $this->actingAs($this->user)
            ->get('/settings/webhooks/deliveries')
            ->assertInertia(fn ($page) => $page
                ->where('stats.total', 1)
            );
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

    public function test_retry_dispatches_job_for_failed_delivery(): void
    {
        Queue::fake();

        $delivery = WebhookDeliveryModel::factory()->failed()->create([
            'webhook_destination_id' => $this->destination->id,
        ]);

        $this->actingAs($this->user)
            ->post("/settings/webhooks/deliveries/{$delivery->id}/retry")
            ->assertRedirect();

        Queue::assertPushed(DispatchWebhookJob::class);
    }

    public function test_retry_rejects_non_failed_delivery(): void
    {
        Queue::fake();

        $delivery = WebhookDeliveryModel::factory()->success()->create([
            'webhook_destination_id' => $this->destination->id,
        ]);

        $this->actingAs($this->user)
            ->post("/settings/webhooks/deliveries/{$delivery->id}/retry")
            ->assertRedirect()
            ->assertSessionHas('error');

        Queue::assertNotPushed(DispatchWebhookJob::class);
    }

    public function test_retry_scoped_to_tenant(): void
    {
        Queue::fake();

        $otherTenant = TenantFactory::new()->create();
        $otherDest = WebhookDestinationModelFactory::new()->create(['tenant_id' => $otherTenant->id]);
        $delivery = WebhookDeliveryModel::factory()->failed()->create([
            'webhook_destination_id' => $otherDest->id,
        ]);

        $this->actingAs($this->user)
            ->post("/settings/webhooks/deliveries/{$delivery->id}/retry")
            ->assertNotFound();

        Queue::assertNotPushed(DispatchWebhookJob::class);
    }

    public function test_retry_requires_authentication(): void
    {
        $this->post('/settings/webhooks/deliveries/999/retry')->assertRedirect('/login');
    }
}
