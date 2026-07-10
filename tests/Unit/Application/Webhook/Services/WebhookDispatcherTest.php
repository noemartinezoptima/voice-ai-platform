<?php

namespace Tests\Unit\Application\Webhook\Services;

use App\Application\Webhook\Services\WebhookDispatcher;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use App\Jobs\DispatchWebhookJob;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class WebhookDispatcherTest extends TestCase
{
    use RefreshDatabase;

    private WebhookDispatcher $dispatcher;

    private string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
        $tenant = TenantFactory::new()->create();
        $this->tenantId = $tenant->id;
        $this->dispatcher = new WebhookDispatcher;
    }

    public function test_dispatches_job_for_matching_event(): void
    {
        WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/webhook',
            'events' => ['call.completed'],
            'is_active' => true,
        ]);

        $this->dispatcher->dispatch('call.completed', ['call_sid' => 'CA123']);

        Queue::assertPushed(DispatchWebhookJob::class, 1);
    }

    public function test_does_not_dispatch_for_non_matching_event(): void
    {
        WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/webhook',
            'events' => ['call.initiated'],
            'is_active' => true,
        ]);

        $this->dispatcher->dispatch('call.completed', []);

        Queue::assertNotPushed(DispatchWebhookJob::class);
    }

    public function test_does_not_dispatch_for_inactive_webhook(): void
    {
        WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/webhook',
            'events' => ['call.completed'],
            'is_active' => false,
        ]);

        $this->dispatcher->dispatch('call.completed', []);

        Queue::assertNotPushed(DispatchWebhookJob::class);
    }

    public function test_dispatches_to_all_matching_webhooks(): void
    {
        WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://first.com/webhook',
            'events' => ['call.completed'],
            'is_active' => true,
        ]);
        WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://second.com/webhook',
            'events' => ['call.completed', 'call.failed'],
            'is_active' => true,
        ]);

        $this->dispatcher->dispatch('call.completed', []);

        Queue::assertPushed(DispatchWebhookJob::class, 2);
    }
}
