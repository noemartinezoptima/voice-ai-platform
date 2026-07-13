<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImpersonationTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->tenantId = $tenant->id;

        $this->owner = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'owner',
        ]);
        $this->owner->assignRole('owner');
    }

    public function test_owner_can_impersonate_member(): void
    {
        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);
        $member->assignRole('member');

        $this->actingAs($this->owner)
            ->post("/admin/impersonate/{$member->id}")
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('success');

        $this->assertEquals($member->id, auth()->id());
        $this->assertTrue(session()->has('impersonator_id'));
        $this->assertEquals($this->owner->id, session('impersonator_id'));
    }

    public function test_member_cannot_impersonate(): void
    {
        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);
        $member->assignRole('member');

        $this->actingAs($member)
            ->post("/admin/impersonate/{$this->owner->id}")
            ->assertForbidden();
    }

    public function test_cannot_impersonate_owner(): void
    {
        $admin = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'admin',
        ]);
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->post("/admin/impersonate/{$this->owner->id}")
            ->assertForbidden();
    }

    public function test_stop_impersonation_returns_to_original_user(): void
    {
        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);
        $member->assignRole('member');

        session(['impersonator_id' => $this->owner->id]);
        session(['impersonator_tenant_id' => $this->tenantId]);

        $this->actingAs($member)
            ->post('/admin/stop-impersonating')
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('success');

        $this->assertEquals($this->owner->id, auth()->id());
        $this->assertFalse(session()->has('impersonator_id'));
    }

    public function test_impersonation_is_logged(): void
    {
        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);
        $member->assignRole('member');

        $this->actingAs($this->owner)
            ->post("/admin/impersonate/{$member->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('activity_log', [
            'log_name' => 'security',
        ]);
    }

    public function test_cannot_impersonate_across_tenants(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $otherUser = User::factory()->create([
            'tenant_id' => $otherTenant->id,
            'role' => 'member',
        ]);
        $otherUser->assignRole('member');

        $this->actingAs($this->owner)
            ->post("/admin/impersonate/{$otherUser->id}")
            ->assertForbidden();
    }

    public function test_stop_impersonation_requires_active_impersonation(): void
    {
        $this->actingAs($this->owner)
            ->post('/admin/stop-impersonating')
            ->assertForbidden();
    }
}
