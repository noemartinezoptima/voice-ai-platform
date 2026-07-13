<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\UserPermissionOverrideModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PermissionOverrideTest extends TestCase
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

        Permission::firstOrCreate(['name' => 'settings.manage', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'flows.manage', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
    }

    public function test_admin_can_grant_permission_override(): void
    {
        $admin = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'admin',
        ]);
        $admin->assignRole('admin');

        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);
        $member->assignRole('member');

        $this->actingAs($admin)
            ->patch("/team/{$member->id}/permissions", [
                'overrides' => [
                    ['permission' => 'settings.manage', 'granted' => true],
                ],
            ])
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->assertDatabaseHas('user_permission_overrides', [
            'user_id' => $member->id,
            'permission' => 'settings.manage',
            'granted' => true,
        ]);

        $this->assertTrue($member->fresh()->hasPermissionTo('settings.manage'));
    }

    public function test_admin_can_revoke_permission_override(): void
    {
        $admin = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'admin',
        ]);
        $admin->assignRole('admin');

        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);
        $member->assignRole('member');
        $member->givePermissionTo('settings.manage');

        $this->actingAs($admin)
            ->patch("/team/{$member->id}/permissions", [
                'overrides' => [
                    ['permission' => 'settings.manage', 'granted' => false],
                ],
            ])
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->assertFalse($member->fresh()->hasPermissionTo('settings.manage'));
    }

    public function test_override_takes_effect(): void
    {
        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);
        $member->assignRole('member');

        UserPermissionOverrideModel::create([
            'user_id' => $member->id,
            'permission' => 'flows.manage',
            'granted' => true,
        ]);

        $this->assertTrue($member->fresh()->hasPermissionTo('flows.manage'));
    }

    public function test_member_cannot_edit_overrides(): void
    {
        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);
        $member->assignRole('member');

        $other = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);
        $other->assignRole('member');

        $this->actingAs($member)
            ->patch("/team/{$other->id}/permissions", [
                'overrides' => [
                    ['permission' => 'settings.manage', 'granted' => true],
                ],
            ])
            ->assertForbidden();
    }

    public function test_permissions_endpoint_returns_data(): void
    {
        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);
        $member->assignRole('member');

        UserPermissionOverrideModel::create([
            'user_id' => $member->id,
            'permission' => 'settings.manage',
            'granted' => true,
        ]);

        $this->actingAs($this->owner)
            ->get("/team/{$member->id}/permissions")
            ->assertOk()
            ->assertJsonStructure([
                'user' => ['id', 'name'],
                'overrides' => [['permission', 'granted']],
                'availablePermissions',
            ]);
    }

    public function test_cannot_override_across_tenants(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $otherUser = User::factory()->create([
            'tenant_id' => $otherTenant->id,
            'role' => 'member',
        ]);
        $otherUser->assignRole('member');

        $this->actingAs($this->owner)
            ->patch("/team/{$otherUser->id}/permissions", [
                'overrides' => [
                    ['permission' => 'settings.manage', 'granted' => true],
                ],
            ])
            ->assertForbidden();
    }

    public function test_permissions_requires_authentication(): void
    {
        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);

        $this->get("/team/{$member->id}/permissions")
            ->assertRedirect('/login');

        $this->patch("/team/{$member->id}/permissions", [])
            ->assertRedirect('/login');
    }
}
