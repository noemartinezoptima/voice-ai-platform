<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Database\Factories\SmsMessageModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SmsPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create([
            'settings' => [
                'twilio_phone_number' => '+15551234567',
                'whatsapp_phone_number' => '+15551234567',
                'twilio_account_sid' => 'ACtest',
                'twilio_auth_token' => 'test-token',
            ],
        ]);
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/sms')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)->get('/sms')->assertOk();
    }

    public function test_index_shows_messages(): void
    {
        SmsMessageModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'from_number' => '+15551234567',
            'body' => 'Hello from SMS test',
        ]);

        $this->actingAs($this->user)
            ->get('/sms')
            ->assertOk()
            ->assertSee('Hello from SMS test');
    }

    public function test_index_shows_whatsapp_messages(): void
    {
        SmsMessageModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'from_number' => '+15559876543',
            'body' => 'Hello from WhatsApp',
            'channel' => 'whatsapp',
        ]);

        $this->actingAs($this->user)
            ->get('/sms')
            ->assertOk()
            ->assertSee('Hello from WhatsApp')
            ->assertSee('WhatsApp');
    }

    public function test_index_scoped_to_tenant(): void
    {
        SmsMessageModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'from_number' => '+1111',
        ]);
        $otherTenant = TenantFactory::new()->create();
        SmsMessageModelFactory::new()->create([
            'tenant_id' => $otherTenant->id,
            'from_number' => '+2222',
        ]);

        $response = $this->actingAs($this->user)->get('/sms');

        $response->assertDontSee('+2222');
    }

    public function test_index_paginates(): void
    {
        SmsMessageModelFactory::new()->count(25)->create(['tenant_id' => $this->user->tenant_id]);

        $this->actingAs($this->user)
            ->get('/sms')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Sms/Index')
                ->has('messages')
            );
    }

    public function test_send_requires_authentication(): void
    {
        $this->post('/sms/send', [
            'to' => '+12345678900',
            'body' => 'Test',
            'channel' => 'sms',
        ])->assertRedirect('/login');
    }

    public function test_send_requires_valid_channel(): void
    {
        $this->actingAs($this->user)
            ->post('/sms/send', [
                'to' => '+12345678900',
                'body' => 'Test',
                'channel' => 'invalid',
            ])
            ->assertSessionHasErrors('channel');
    }

    public function test_send_requires_body_max_length(): void
    {
        $this->actingAs($this->user)
            ->post('/sms/send', [
                'to' => '+12345678900',
                'body' => str_repeat('x', 1601),
                'channel' => 'sms',
            ])
            ->assertSessionHasErrors('body');
    }

    public function test_send_creates_outbound_sms_record(): void
    {
        $this->actingAs($this->user)
            ->post('/sms/send', [
                'to' => '+12345678900',
                'body' => 'Hello via SMS',
                'channel' => 'sms',
            ])
            ->assertRedirect(route('sms.index'));

        $this->assertDatabaseHas('sms_messages', [
            'tenant_id' => $this->user->tenant_id,
            'to_number' => '+12345678900',
            'body' => 'Hello via SMS',
            'channel' => 'sms',
            'direction' => 'outbound',
        ]);
    }

    public function test_send_creates_outbound_whatsapp_record(): void
    {
        $this->actingAs($this->user)
            ->post('/sms/send', [
                'to' => '+12345678900',
                'body' => 'Hello via WhatsApp',
                'channel' => 'whatsapp',
            ])
            ->assertRedirect(route('sms.index'));

        $this->assertDatabaseHas('sms_messages', [
            'tenant_id' => $this->user->tenant_id,
            'to_number' => '+12345678900',
            'body' => 'Hello via WhatsApp',
            'channel' => 'whatsapp',
            'direction' => 'outbound',
        ]);
    }
}
