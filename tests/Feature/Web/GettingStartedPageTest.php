<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GettingStartedPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = TenantFactory::new()->create([
            'settings' => [],
        ]);

        $this->user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email_verified_at' => now(),
        ]);
    }

    public function test_redirects_to_dashboard_when_onboarding_completed(): void
    {
        $tenant = TenantModel::find($this->user->tenant_id);
        $tenant->update(['settings' => ['onboarding_completed' => true]]);

        $this->actingAs($this->user)
            ->get('/getting-started')
            ->assertRedirect(route('dashboard'));
    }

    public function test_shows_wizard_when_not_completed(): void
    {
        $this->actingAs($this->user)
            ->get('/getting-started')
            ->assertOk();
    }

    public function test_complete_marks_onboarding_done(): void
    {
        $this->actingAs($this->user)
            ->post('/getting-started/completed')
            ->assertRedirect(route('dashboard'));

        $tenant = TenantModel::find($this->user->tenant_id);
        $tenant->refresh();
        $this->assertTrue($tenant->settings['onboarding_completed'] ?? false);
    }

    public function test_requires_authentication(): void
    {
        $this->get('/getting-started')
            ->assertRedirect('/login');
    }
}
