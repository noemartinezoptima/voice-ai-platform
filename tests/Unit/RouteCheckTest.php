<?php

namespace Tests\Unit;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RouteCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_routes_do_not_return_500(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'routecheck@test.com',
            'email_verified_at' => now(),
        ]);

        $flow = \Database\Factories\FlowModelFactory::new()->create([
            'tenant_id' => $tenant->id,
        ]);
        $call = \Database\Factories\CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'flow_id' => $flow->id,
        ]);
        $webhook = \Database\Factories\WebhookDestinationModelFactory::new()->create([
            'tenant_id' => $tenant->id,
        ]);

        $routes = [
            '/dashboard', '/sms', '/calls', '/flows', '/transcripts', '/quality', '/monitor',
            '/settings/tenant', '/settings/voice', '/settings/voices', '/api-tokens',
            '/team', '/analytics', '/billing', '/settings/agents', '/flows/create',
            '/sms/auto-replies', '/sms/campaigns', '/settings/webhooks',
            '/settings/webhooks/deliveries', '/settings/documents', '/settings/errors',
            '/settings/phone-numbers', '/settings/roles', '/settings/system',
            '/settings/activity', '/notifications', '/docs',
        ];

        $errors = [];
        foreach ($routes as $r) {
            $resp = $this->actingAs($user)->get($r);
            if ($resp->getStatusCode() >= 500) {
                $errors[] = "{$r} returned {$resp->getStatusCode()}: " . substr(strip_tags($resp->getContent()), 0, 200);
            }
        }

        $resp = $this->actingAs($user)->get("/flows/{$flow->id}/edit");
        if ($resp->getStatusCode() >= 500) {
            $errors[] = "GET /flows/{$flow->id}/edit returned {$resp->getStatusCode()}";
        }

        $resp = $this->actingAs($user)->get("/calls/{$call->id}");
        if ($resp->getStatusCode() >= 500) {
            $errors[] = "GET /calls/{$call->id} returned {$resp->getStatusCode()}";
        }

        $resp = $this->actingAs($user)->post("/flows/{$flow->id}/test", ['to' => '+15551234567']);
        if ($resp->getStatusCode() >= 500) {
            $errors[] = "POST /flows/{$flow->id}/test returned {$resp->getStatusCode()}: " . substr(strip_tags($resp->getContent()), 0, 200);
        }

        $resp = $this->actingAs($user)->get("/flows/{$flow->id}/simulate");
        if ($resp->getStatusCode() >= 500) {
            $errors[] = "GET /flows/{$flow->id}/simulate returned {$resp->getStatusCode()}";
        }

        $resp = $this->actingAs($user)->post("/calls/{$call->id}/retry");
        if ($resp->getStatusCode() >= 500) {
            $errors[] = "POST /calls/{$call->id}/retry returned {$resp->getStatusCode()}";
        }

        $this->assertEmpty($errors, "500 errors detected:\n" . implode("\n", $errors));
    }
}
