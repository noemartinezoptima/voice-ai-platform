<?php

namespace Tests\Feature;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantSettingsPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->user->givePermissionTo('settings.manage');
    }

    public function test_edit_requires_authentication(): void
    {
        $this->get('/settings/tenant')->assertRedirect('/login');
    }

    public function test_edit_renders(): void
    {
        $this->actingAs($this->user)
            ->get('/settings/tenant')
            ->assertOk();
    }

    public function test_update_saves_settings(): void
    {
        $this->actingAs($this->user)->patch('/settings/tenant', [
            'name' => 'Acme Corp',
            'slug' => 'acme-corp',
            'timezone' => 'US/Eastern',
            'default_language' => 'es',
        ])->assertRedirect(route('settings.tenant'));

        $this->assertDatabaseHas('tenants', [
            'id' => $this->user->tenant_id,
            'name' => 'Acme Corp',
            'slug' => 'acme-corp',
        ]);
    }

    public function test_update_validates_name(): void
    {
        $this->actingAs($this->user)
            ->patch('/settings/tenant', ['name' => ''])
            ->assertSessionHasErrors('name');
    }

    public function test_update_validates_slug_unique(): void
    {
        $other = TenantFactory::new()->create(['slug' => 'taken']);

        $this->actingAs($this->user)
            ->patch('/settings/tenant', ['slug' => 'taken'])
            ->assertSessionHasErrors('slug');
    }

    public function test_update_saves_twilio_settings(): void
    {
        $this->actingAs($this->user)->patch('/settings/tenant', [
            'name' => 'Acme Corp',
            'slug' => 'acme-corp',
            'twilio_account_sid' => 'AC12345678901234567890123456789012',
            'twilio_auth_token' => 'auth_token_123',
            'twilio_phone_number' => '+15551234567',
        ])->assertRedirect(route('settings.tenant'));

        $model = TenantModel::find($this->user->tenant_id);
        $settings = $model->settings;

        $this->assertEquals('AC12345678901234567890123456789012', $settings['twilio_account_sid']);
        $this->assertEquals('auth_token_123', $settings['twilio_auth_token']);
        $this->assertEquals('+15551234567', $settings['twilio_phone_number']);
    }

    public function test_update_saves_elevenlabs_settings(): void
    {
        $this->actingAs($this->user)->patch('/settings/tenant', [
            'name' => 'Acme Corp',
            'slug' => 'acme-corp',
            'elevenlabs_api_key' => 'eleven_key_abc',
            'elevenlabs_default_voice_id' => 'voice_abc_123',
        ])->assertRedirect(route('settings.tenant'));

        $model = TenantModel::find($this->user->tenant_id);
        $settings = $model->settings;

        $this->assertEquals('eleven_key_abc', $settings['elevenlabs_api_key']);
        $this->assertEquals('voice_abc_123', $settings['elevenlabs_default_voice_id']);
    }

    public function test_update_keeps_masked_secrets(): void
    {
        $model = TenantModel::find($this->user->tenant_id);
        $model->settings = array_merge($model->settings ?? [], [
            'twilio_auth_token' => 'secret_token',
            'elevenlabs_api_key' => 'secret_key',
        ]);
        $model->save();

        $this->actingAs($this->user)->patch('/settings/tenant', [
            'name' => 'Acme Corp',
            'slug' => 'acme-corp',
            'twilio_auth_token' => '********',
            'elevenlabs_api_key' => '********',
        ])->assertRedirect(route('settings.tenant'));

        $model->refresh();

        $this->assertEquals('secret_token', $model->settings['twilio_auth_token']);
        $this->assertEquals('secret_key', $model->settings['elevenlabs_api_key']);
    }
}
