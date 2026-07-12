<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrivacyPageTest extends TestCase
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

    public function test_privacy_page_loads(): void
    {
        $this->actingAs($this->user)
            ->get('/settings/privacy')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Settings/Privacy/Index')
                ->has('summary')
                ->has('dataProtection')
                ->has('consentLogs')
            );
    }

    public function test_unauthenticated_redirects(): void
    {
        $this->get('/settings/privacy')
            ->assertRedirect('login');
    }
}
