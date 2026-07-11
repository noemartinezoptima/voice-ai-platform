<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TwilioOAuthControllerTest extends TestCase
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

    public function test_callback_stores_credentials_on_valid_exchange(): void
    {
        Http::fake([
            'oauth.twilio.com/v2/token' => Http::response([
                'access_token' => 'at_xxx',
                'refresh_token' => 'rt_xxx',
                'expires_in' => 3600,
                'token_type' => 'Bearer',
            ]),
            'api.twilio.com/2010-04-01/Accounts/me.json' => Http::response([
                'sid' => 'AC1234567890',
            ]),
        ]);

        $state = Crypt::encryptString(json_encode([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'created_at' => now()->timestamp,
        ]));

        $this->actingAs($this->user)
            ->get(route('twilio.oauth.callback', ['code' => 'auth_code_xxx', 'state' => $state]))
            ->assertRedirect(route('settings.tenant'))
            ->assertSessionHas('success');

        $this->tenant->refresh();
        $this->assertTrue($this->tenant->settings['twilio_oauth_enabled']);
        $this->assertArrayHasKey('twilio_oauth', $this->tenant->settings);
    }

    public function test_callback_with_invalid_state_redirects_with_error(): void
    {
        $this->actingAs($this->user)
            ->get(route('twilio.oauth.callback', ['code' => 'x', 'state' => 'invalid']))
            ->assertRedirect(route('settings.tenant'))
            ->assertSessionHas('error');
    }

    public function test_callback_with_failed_token_exchange_redirects_with_error(): void
    {
        Http::fake([
            'oauth.twilio.com/v2/token' => Http::response(['error' => 'invalid_grant'], 400),
        ]);

        $state = Crypt::encryptString(json_encode([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'created_at' => now()->timestamp,
        ]));

        $this->actingAs($this->user)
            ->get(route('twilio.oauth.callback', ['code' => 'bad', 'state' => $state]))
            ->assertSessionHas('error');
    }

    public function test_disconnect_clears_credentials(): void
    {
        Http::fake();
        $this->tenant->settings = [
            'twilio_oauth_enabled' => true,
            'twilio_oauth' => [
                'access_token' => Crypt::encryptString('at_xxx'),
                'refresh_token' => Crypt::encryptString('rt_xxx'),
                'expires_at' => now()->addHour()->timestamp,
                'account_sid' => 'AC123',
            ],
        ];
        $this->tenant->save();

        $this->actingAs($this->user)
            ->post(route('twilio.oauth.disconnect'))
            ->assertRedirect(route('settings.tenant'));

        $this->tenant->refresh();
        $this->assertFalse($this->tenant->settings['twilio_oauth_enabled'] ?? false);
    }

    public function test_non_owner_cannot_connect(): void
    {
        $member = User::factory()->create(['tenant_id' => $this->tenant->id, 'role' => 'member']);
        $state = Crypt::encryptString(json_encode([
            'tenant_id' => $this->tenant->id,
            'user_id' => $member->id,
            'created_at' => now()->timestamp,
        ]));

        $this->actingAs($member)
            ->get(route('twilio.oauth.callback', ['code' => 'x', 'state' => $state]))
            ->assertForbidden();
    }
}
