<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class ActivityLogPageTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private User $member;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->owner = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);
        $this->member = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'member']);
    }

    public function test_owner_can_view_activity_log(): void
    {
        Activity::create(['description' => 'Test event', 'log_name' => 'default']);

        $this->actingAs($this->owner)
            ->get('/settings/activity')
            ->assertOk()
            ->assertSee('Test event');
    }

    public function test_member_cannot_view_activity_log(): void
    {
        $this->actingAs($this->member)
            ->get('/settings/activity')
            ->assertForbidden();
    }

    public function test_guest_redirected_to_login(): void
    {
        $this->get('/settings/activity')
            ->assertRedirect('/login');
    }

    public function test_displays_activity_entries(): void
    {
        Activity::create([
            'description' => 'Test flow created',
            'log_name' => 'flow',
            'event' => 'created',
            'causer_id' => $this->owner->id,
            'causer_type' => User::class,
        ]);

        $this->actingAs($this->owner)
            ->get('/settings/activity')
            ->assertSee('Test flow created');
    }

    public function test_filters_by_log_name(): void
    {
        Activity::create(['description' => 'Login event', 'log_name' => 'security']);
        Activity::create(['description' => 'Plan change', 'log_name' => 'billing']);

        $response = $this->actingAs($this->owner)
            ->get('/settings/activity?log_name=security');

        $response->assertSee('Login event');
        $response->assertDontSee('Plan change');
    }

    public function test_empty_state_when_no_activities(): void
    {
        Activity::query()->delete();

        $this->actingAs($this->owner)
            ->get('/settings/activity')
            ->assertOk();
    }

    public function test_filters_by_search(): void
    {
        Activity::query()->delete();
        Activity::create(['description' => 'Token revoked', 'log_name' => 'default']);

        $response = $this->actingAs($this->owner)
            ->get('/settings/activity?search=Token');

        $response->assertOk();
        $response->assertSee('Token revoked');
    }
}
