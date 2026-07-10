<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VoiceSettingsPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_edit_requires_authentication(): void
    {
        $this->get('/settings/voice')->assertRedirect('/login');
    }

    public function test_edit_renders(): void
    {
        $this->actingAs($this->user)->get('/settings/voice')->assertOk();
    }

    public function test_edit_shows_default_values(): void
    {
        $response = $this->actingAs($this->user)->get('/settings/voice');

        $response->assertOk();
    }

    public function test_update_saves_settings(): void
    {
        $this->actingAs($this->user)
            ->patch('/settings/voice', [
                'default_tts_provider' => 'elevenlabs',
                'default_language' => 'es',
                'elevenlabs_voice_id' => 'voice-123',
                'tts_speed' => 1.2,
                'voice_stability' => 0.7,
                'voice_similarity_boost' => 0.8,
            ])
            ->assertRedirect('/settings/voice')
            ->assertSessionHas('success');
    }

    public function test_update_validates_tts_provider(): void
    {
        $this->actingAs($this->user)
            ->patch('/settings/voice', ['default_tts_provider' => 'invalid'])
            ->assertSessionHasErrors('default_tts_provider');
    }

    public function test_update_validates_language(): void
    {
        $this->actingAs($this->user)
            ->patch('/settings/voice', ['default_language' => 'invalid'])
            ->assertSessionHasErrors('default_language');
    }

    public function test_update_validates_speed_range(): void
    {
        $this->actingAs($this->user)
            ->patch('/settings/voice', ['tts_speed' => 5.0])
            ->assertSessionHasErrors('tts_speed');
    }

    public function test_update_validates_stability_range(): void
    {
        $this->actingAs($this->user)
            ->patch('/settings/voice', ['voice_stability' => -1])
            ->assertSessionHasErrors('voice_stability');
    }

    public function test_update_requires_authentication(): void
    {
        $this->patch('/settings/voice', [])->assertRedirect('/login');
    }
}
