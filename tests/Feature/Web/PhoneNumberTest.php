<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PhoneNumberTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = TenantFactory::new()->create([
            'settings' => [
                'twilio_account_sid' => 'AC12345',
                'twilio_auth_token' => 'test-token',
            ],
        ]);

        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->user->givePermissionTo('settings.manage');
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/settings/phone-numbers')->assertRedirect('/login');
    }

    public function test_index_requires_permission(): void
    {
        $noPermUser = User::factory()->create([
            'tenant_id' => $this->user->tenant_id,
        ]);

        $this->actingAs($noPermUser)
            ->get('/settings/phone-numbers')
            ->assertForbidden();
    }

    public function test_index_renders(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response([
                'incoming_phone_numbers' => [
                    [
                        'sid' => 'PN123',
                        'phone_number' => '+12025551234',
                        'friendly_name' => 'Main Line',
                        'capabilities' => ['voice' => true, 'sms' => true],
                    ],
                ],
            ]),
        ]);

        $this->actingAs($this->user)->get('/settings/phone-numbers')->assertOk();
    }

    public function test_index_shows_owned_numbers(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response([
                'incoming_phone_numbers' => [
                    [
                        'sid' => 'PN123',
                        'phone_number' => '+12025551234',
                        'friendly_name' => 'Main Line',
                        'capabilities' => ['voice' => true, 'sms' => true],
                    ],
                    [
                        'sid' => 'PN456',
                        'phone_number' => '+13105559876',
                        'friendly_name' => 'Sales Line',
                        'capabilities' => ['voice' => true, 'sms' => false],
                    ],
                ],
            ]),
        ]);

        $response = $this->actingAs($this->user)->get('/settings/phone-numbers');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Settings/PhoneNumbers/Index')
                ->where('connected', true)
        );
    }

    public function test_index_shows_flows_with_numbers(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response([
                'incoming_phone_numbers' => [],
            ]),
        ]);

        FlowModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Support Flow',
            'phone_number' => '+12025551234',
            'config' => [],
            'is_active' => true,
            'version' => 1,
        ]);

        $response = $this->actingAs($this->user)->get('/settings/phone-numbers');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->has('flows', 1)
                ->where('flows.0.name', 'Support Flow')
                ->where('flows.0.phone_number', '+12025551234')
        );
    }

    public function test_index_shows_alert_when_no_credentials(): void
    {
        Config::set('twilio.account_sid', null);
        Config::set('twilio.auth_token', null);

        $tenant = TenantModel::find($this->user->tenant_id);
        $tenant->settings = [];
        $tenant->save();

        $response = $this->actingAs($this->user)->get('/settings/phone-numbers');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->where('connected', false)
        );
    }

    public function test_search_requires_authentication(): void
    {
        $this->get('/settings/phone-numbers/search')->assertRedirect('/login');
    }

    public function test_search_returns_available_numbers(): void
    {
        Http::fake([
            'api.twilio.com/*/AvailablePhoneNumbers/US/Local*' => Http::response([
                'available_phone_numbers' => [
                    [
                        'phone_number' => '+12025559999',
                        'locality' => 'Washington',
                        'region' => 'DC',
                    ],
                ],
            ]),
        ]);

        $response = $this->actingAs($this->user)
            ->get('/settings/phone-numbers/search?country=US&area_code=202');

        $response->assertOk();
        $response->assertJson([
            'numbers' => [
                [
                    'phone_number' => '+12025559999',
                    'locality' => 'Washington',
                    'region' => 'DC',
                ],
            ],
        ]);
    }

    public function test_search_validates_country(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/settings/phone-numbers/search?country=XX');

        $response->assertSessionHasErrors('country');
    }

    public function test_buy_requires_authentication(): void
    {
        $this->post('/settings/phone-numbers/buy', [])->assertRedirect('/login');
    }

    public function test_buy_requires_phone_number(): void
    {
        $this->actingAs($this->user)
            ->post('/settings/phone-numbers/buy', [])
            ->assertSessionHasErrors('phone_number');
    }

    public function test_buy_purchases_number(): void
    {
        Http::fake([
            'api.twilio.com/*/IncomingPhoneNumbers.json' => Http::response([
                'sid' => 'PN789',
                'phone_number' => '+12025559999',
                'friendly_name' => '+12025559999',
            ]),
        ]);

        $response = $this->actingAs($this->user)
            ->post('/settings/phone-numbers/buy', [
                'phone_number' => '+12025559999',
            ]);

        $response->assertRedirect('/settings/phone-numbers');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('tenants', [
            'id' => $this->user->tenant_id,
        ]);
    }

    public function test_release_requires_authentication(): void
    {
        $this->delete('/settings/phone-numbers/release', [])->assertRedirect('/login');
    }

    public function test_release_requires_sid(): void
    {
        $this->actingAs($this->user)
            ->delete('/settings/phone-numbers/release', [])
            ->assertSessionHasErrors('sid');
    }

    public function test_release_removes_number(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response([], 204),
        ]);

        $response = $this->actingAs($this->user)
            ->delete('/settings/phone-numbers/release', [
                'sid' => 'PN123',
                'phone_number' => '+12025551234',
            ]);

        $response->assertRedirect('/settings/phone-numbers');
        $response->assertSessionHas('success');
    }

    public function test_release_clears_flow_assignments(): void
    {
        $flow = FlowModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Support Flow',
            'phone_number' => '+12025551234',
            'config' => [],
            'is_active' => true,
            'version' => 1,
        ]);

        Http::fake([
            'api.twilio.com/*' => Http::response([], 204),
        ]);

        $this->actingAs($this->user)
            ->delete('/settings/phone-numbers/release', [
                'sid' => 'PN123',
                'phone_number' => '+12025551234',
            ]);

        $this->assertDatabaseHas('flows', [
            'id' => $flow->id,
            'phone_number' => null,
        ]);
    }
}
