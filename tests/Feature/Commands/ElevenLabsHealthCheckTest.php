<?php

namespace Tests\Feature\Commands;

use App\Models\User;
use App\Notifications\ElevenLabsKeyInvalid;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ElevenLabsHealthCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_check_updates_character_counts(): void
    {
        $tenant = TenantFactory::new()->create();
        $tenant->settings = [
            'elevenlabs_api_key' => Crypt::encryptString('valid-key'),
        ];
        $tenant->save();

        Http::fake([
            'api.elevenlabs.io/v1/voices' => Http::response(['voices' => []]),
            'api.elevenlabs.io/v1/user' => Http::response(['ok' => true]),
            'api.elevenlabs.io/v1/user/subscription' => Http::response([
                'tier' => 'pro',
                'character_count' => 10000,
                'character_limit' => 50000,
            ]),
        ]);

        $this->artisan('elevenlabs:health-check')->assertExitCode(0);

        $tenant->refresh();
        $this->assertEquals(10000, $tenant->settings['elevenlabs_character_count']);
        $this->assertEquals('pro', $tenant->settings['elevenlabs_subscription_tier']);
    }

    public function test_health_check_marks_restricted_key_healthy(): void
    {
        $tenant = TenantFactory::new()->create();
        $tenant->settings = [
            'elevenlabs_api_key' => Crypt::encryptString('restricted-key'),
        ];
        $tenant->save();

        Http::fake([
            'api.elevenlabs.io/v1/voices' => Http::response(['voices' => []]),
            'api.elevenlabs.io/v1/user' => Http::response([], 401),
        ]);

        $this->artisan('elevenlabs:health-check')->assertExitCode(0);

        $tenant->refresh();
        $this->assertNull($tenant->settings['elevenlabs_health_status'] ?? null);
    }

    public function test_health_check_invalid_key_sends_notification(): void
    {
        Notification::fake();
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);
        $tenant->settings = [
            'elevenlabs_api_key' => Crypt::encryptString('invalid-key'),
        ];
        $tenant->save();

        Http::fake([
            'api.elevenlabs.io/v1/voices' => Http::response([], 401),
        ]);

        $this->artisan('elevenlabs:health-check')->assertExitCode(0);

        Notification::assertSentTo($user, ElevenLabsKeyInvalid::class);

        $tenant->refresh();
        $this->assertEquals('invalid', $tenant->settings['elevenlabs_health_status']);
    }

    public function test_health_check_no_tenants_is_noop(): void
    {
        $this->artisan('elevenlabs:health-check')->assertExitCode(0);
    }
}
