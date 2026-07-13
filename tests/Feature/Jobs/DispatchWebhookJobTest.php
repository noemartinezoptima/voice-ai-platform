<?php

namespace Tests\Feature\Jobs;

use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDeliveryModel;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use App\Jobs\DispatchWebhookJob;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DispatchWebhookJobTest extends TestCase
{
    use RefreshDatabase;

    private string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->tenantId = $tenant->id;
    }

    public function test_dispatches_post_to_webhook_url(): void
    {
        Http::fake();

        $webhook = WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/webhook',
            'events' => ['call.completed'],
            'is_active' => true,
        ]);

        $job = new DispatchWebhookJob($webhook, ['event' => 'call.completed', 'data' => ['call_sid' => 'CA123']], 'call.completed');
        $job->handle();

        Http::assertSent(function ($request) {
            return $request->url() === 'https://example.com/webhook'
                && $request->method() === 'POST'
                && $request->header('Content-Type')[0] === 'application/json'
                && $request->header('User-Agent')[0] === 'VoiceAI-Webhook/1.0'
                && $request['event'] === 'call.completed';
        });
    }

    public function test_sends_payload(): void
    {
        Http::fake();

        $webhook = WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/hook',
            'events' => ['call.initiated'],
            'is_active' => true,
        ]);

        $payload = ['event' => 'call.initiated', 'data' => ['from' => '+15551111111']];
        $job = new DispatchWebhookJob($webhook, $payload, 'call.initiated');
        $job->handle();

        Http::assertSent(function ($request) {
            return $request['data']['from'] === '+15551111111';
        });
    }

    public function test_has_ten_second_timeout(): void
    {
        $webhook = WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/hook',
            'events' => ['call.completed'],
            'is_active' => true,
        ]);

        $job = new DispatchWebhookJob($webhook, [], 'call.completed');
        $this->assertSame(10, $job->timeout);
    }

    public function test_successful_delivery_creates_record(): void
    {
        Http::fake([
            'https://example.com/hook' => Http::response('ok', 200),
        ]);

        $webhook = WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/hook',
            'events' => ['call.completed'],
            'is_active' => true,
        ]);

        $job = new DispatchWebhookJob($webhook, ['event' => 'call.completed', 'data' => []], 'call.completed');
        $job->handle();

        $this->assertDatabaseHas('webhook_deliveries', [
            'webhook_destination_id' => $webhook->id,
            'event' => 'call.completed',
            'status' => 'success',
            'response_code' => 200,
            'attempt' => 1,
        ]);
    }

    public function test_failed_delivery_retries(): void
    {
        Http::fake([
            'https://example.com/hook' => Http::response('server error', 500),
        ]);

        $webhook = WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/hook',
            'events' => ['call.completed'],
            'is_active' => true,
        ]);

        $job = new DispatchWebhookJob($webhook, ['event' => 'call.completed', 'data' => []], 'call.completed');
        $job->handle();

        $this->assertDatabaseHas('webhook_deliveries', [
            'webhook_destination_id' => $webhook->id,
            'event' => 'call.completed',
            'status' => 'failed',
            'response_code' => 500,
        ]);

        $delivery = WebhookDeliveryModel::where('webhook_destination_id', $webhook->id)->first();
        $this->assertNotNull($delivery->next_attempt_at);
    }

    public function test_dead_delivery_after_max_retries(): void
    {
        $webhook = WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/hook',
            'events' => ['call.completed'],
            'is_active' => true,
        ]);

        $job = new DispatchWebhookJob($webhook, ['event' => 'call.completed', 'data' => []], 'call.completed');
        $job->failed(new \RuntimeException('Connection timeout'));

        $this->assertDatabaseHas('webhook_deliveries', [
            'webhook_destination_id' => $webhook->id,
            'event' => 'call.completed',
            'status' => 'dead',
            'response_code' => 0,
        ]);

        $delivery = WebhookDeliveryModel::where('webhook_destination_id', $webhook->id)->first();
        $this->assertStringContainsString('Connection timeout', $delivery->response_body);
    }

    public function test_backoff_increases_with_attempts(): void
    {
        $webhook = WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/hook',
            'events' => ['call.completed'],
            'is_active' => true,
        ]);

        $job = new DispatchWebhookJob($webhook, [], 'call.completed');

        $this->assertSame([10, 60, 300], $job->backoff);
    }
}
