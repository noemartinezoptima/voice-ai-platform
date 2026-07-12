<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataProtectionControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private TenantModel $tenant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->user->givePermissionTo('settings.manage');
    }

    public function test_edit_requires_authorization(): void
    {
        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);

        $this->actingAs($user)
            ->get('/settings/data-protection')
            ->assertForbidden();
    }

    public function test_edit_requires_authentication(): void
    {
        $this->get('/settings/data-protection')->assertRedirect('/login');
    }

    public function test_edit_shows_form(): void
    {
        $this->actingAs($this->user)
            ->get('/settings/data-protection')
            ->assertOk();
    }

    public function test_update_saves_data_protection_settings(): void
    {
        $this->actingAs($this->user)
            ->patch('/settings/data-protection', [
                'consent_required' => true,
                'retention_days' => 60,
                'consent_message' => 'Custom consent text',
                'consent_recordings' => true,
                'consent_transcripts' => false,
            ])
            ->assertRedirect(route('settings.data-protection'))
            ->assertSessionHas('success');

        $this->tenant->refresh();
        $this->assertEquals([
            'consent_required' => true,
            'retention_days' => 60,
            'consent_message' => 'Custom consent text',
            'consent_recordings' => true,
            'consent_transcripts' => false,
        ], $this->tenant->data_protection);
    }

    public function test_update_uses_defaults_for_missing_fields(): void
    {
        $this->actingAs($this->user)
            ->patch('/settings/data-protection', [
                'retention_days' => 30,
            ])
            ->assertRedirect(route('settings.data-protection'))
            ->assertSessionHas('success');

        $this->tenant->refresh();
        $dp = $this->tenant->data_protection;
        $this->assertEquals(30, $dp['retention_days']);
        $this->assertFalse($dp['consent_required']);
    }

    public function test_update_validates_retention_days(): void
    {
        $this->actingAs($this->user)
            ->patch('/settings/data-protection', [
                'retention_days' => 999,
            ])
            ->assertSessionHasErrors('retention_days');
    }

    public function test_update_requires_consent_message_when_consent_enabled(): void
    {
        $this->actingAs($this->user)
            ->patch('/settings/data-protection', [
                'consent_required' => true,
                'retention_days' => 30,
                'consent_message' => '',
            ])
            ->assertSessionHasErrors('consent_message');
    }

    public function test_update_requires_authentication(): void
    {
        $this->patch('/settings/data-protection', [
            'retention_days' => 30,
        ])->assertRedirect('/login');
    }
}
