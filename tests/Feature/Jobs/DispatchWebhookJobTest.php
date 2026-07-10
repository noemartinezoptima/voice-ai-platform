<?php

namespace Tests\Feature\Jobs;

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

        $job = new DispatchWebhookJob($webhook, ['event' => 'call.completed', 'data' => ['call_sid' => 'CA123']]);
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
        $job = new DispatchWebhookJob($webhook, $payload);
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

        $job = new DispatchWebhookJob($webhook, []);
        $this->assertSame(10, $job->timeout);
    }
}
