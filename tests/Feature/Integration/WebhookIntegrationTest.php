<?php

namespace Tests\Feature\Integration;

use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDeliveryModel;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use App\Jobs\DispatchWebhookJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** @group integration */
class WebhookIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = \Database\Factories\TenantFactory::new()->create();
        $this->tenantId = $tenant->id;
    }

    private string $tenantId;

    public function test_dispatch_webhook_succeeds_with_http_fake(): void
    {
        Http::fake(['https://example.com/webhook' => Http::response(['ok' => true], 200)]);

        $webhook = WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/webhook',
            'events' => ['call.completed'],
        ]);

        $payload = ['event' => 'call.completed', 'data' => ['call_sid' => 'CA123']];

        DispatchWebhookJob::dispatchSync($webhook, $payload, 'call.completed');

        $delivery = WebhookDeliveryModel::where('webhook_destination_id', $webhook->id)->first();
        $this->assertNotNull($delivery);
        $this->assertEquals('success', $delivery->status);
        $this->assertEquals(200, $delivery->response_code);
    }

    public function test_webhook_delivery_records_failure(): void
    {
        Http::fake(['https://example.com/broken' => Http::response([], 500)]);

        $webhook = WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/broken',
            'events' => ['call.completed'],
        ]);

        $payload = ['event' => 'call.completed', 'data' => []];
        DispatchWebhookJob::dispatchSync($webhook, $payload, 'call.completed');

        $delivery = WebhookDeliveryModel::where('webhook_destination_id', $webhook->id)->first();
        $this->assertNotNull($delivery);
        $this->assertEquals('failed', $delivery->status);
        $this->assertEquals(500, $delivery->response_code);
    }

    public function test_webhook_includes_hmac_signature(): void
    {
        Http::fake();

        $webhook = WebhookDestinationModel::create([
            'tenant_id' => $this->tenantId,
            'url' => 'https://example.com/signed',
            'events' => ['call.completed'],
            'settings' => ['signing_secret' => 'secret123'],
        ]);

        $payload = ['event' => 'call.completed', 'data' => []];
        DispatchWebhookJob::dispatchSync($webhook, $payload, 'call.completed');

        Http::assertSentCount(1);
    }
}
