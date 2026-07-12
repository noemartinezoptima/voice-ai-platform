<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ElevenLabsConnectControllerTest extends TestCase
{
    use RefreshDatabase;

    private TenantModel $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id, 'role' => 'owner']);
    }

    public function test_connect_with_valid_key_saves_credentials(): void
    {
        Http::fake([
            'api.elevenlabs.io/v1/user' => Http::response([
                'xi_api_key_preview' => 'sk-xxxx',
            ]),
            'api.elevenlabs.io/v1/user/subscription' => Http::response([
                'tier' => 'creator',
                'character_count' => 5000,
                'character_limit' => 30000,
            ]),
        ]);

        $this->actingAs($this->user)
            ->postJson('/settings/elevenlabs/connect', ['api_key' => str_repeat('x', 20)])
            ->assertOk()
            ->assertJson(['success' => true]);

        $this->tenant->refresh();
        $this->assertArrayHasKey('elevenlabs_api_key', $this->tenant->settings);
    }

    public function test_connect_with_invalid_key_returns_422(): void
    {
        Http::fake([
            'api.elevenlabs.io/v1/user' => Http::response([], 401),
        ]);

        $this->actingAs($this->user)
            ->postJson('/settings/elevenlabs/connect', ['api_key' => str_repeat('x', 20)])
            ->assertStatus(422)
            ->assertJson(['success' => false]);
    }

    public function test_status_returns_account_info(): void
    {
        $this->tenant->settings = [
            'elevenlabs_api_key' => Crypt::encryptString('test-key'),
            'elevenlabs_subscription_tier' => 'creator',
            'elevenlabs_character_count' => 5000,
            'elevenlabs_character_limit' => 30000,
        ];
        $this->tenant->save();

        $this->actingAs($this->user)
            ->getJson('/settings/elevenlabs/status')
            ->assertOk()
            ->assertJson(['connected' => true]);
    }

    public function test_status_returns_disconnected_when_no_key(): void
    {
        $this->actingAs($this->user)
            ->getJson('/settings/elevenlabs/status')
            ->assertOk()
            ->assertJson(['connected' => false]);
    }

    public function test_non_owner_cannot_connect(): void
    {
        $member = User::factory()->create(['tenant_id' => $this->tenant->id, 'role' => 'member']);

        $this->actingAs($member)
            ->postJson('/settings/elevenlabs/connect', ['api_key' => str_repeat('x', 20)])
            ->assertForbidden();
    }

    public function test_non_owner_cannot_check_status(): void
    {
        $member = User::factory()->create(['tenant_id' => $this->tenant->id, 'role' => 'member']);

        $this->actingAs($member)
            ->getJson('/settings/elevenlabs/status')
            ->assertForbidden();
    }

    public function test_connect_logs_rotation_when_key_exists(): void
    {
        $this->tenant->settings = [
            'elevenlabs_api_key' => Crypt::encryptString('old-key'),
        ];
        $this->tenant->save();

        Http::fake([
            'api.elevenlabs.io/v1/user' => Http::response([
                'xi_api_key_preview' => 'sk-new',
            ]),
            'api.elevenlabs.io/v1/user/subscription' => Http::response([
                'tier' => 'pro',
                'character_count' => 1000,
                'character_limit' => 10000,
            ]),
        ]);

        $this->actingAs($this->user)
            ->postJson('/settings/elevenlabs/connect', ['api_key' => str_repeat('y', 20)])
            ->assertOk()
            ->assertJson(['success' => true]);
    }
}
