<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        Permission::firstOrCreate(['name' => 'settings.manage', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
    }

    public function test_index_requires_authorization(): void
    {
        $this->actingAs($this->user)
            ->get('/settings/roles')
            ->assertForbidden();
    }

    public function test_index_shows_roles_and_permissions(): void
    {
        $this->user->givePermissionTo('settings.manage');

        $adminRole = Role::where('name', 'admin')->first();
        $adminRole->syncPermissions(['settings.manage']);

        $this->actingAs($this->user)
            ->get('/settings/roles')
            ->assertOk()
            ->assertSee('admin');
    }

    public function test_update_role_permissions(): void
    {
        $this->user->givePermissionTo('settings.manage');

        $adminRole = Role::where('name', 'admin')->first();
        $this->assertNotNull($adminRole);

        $this->actingAs($this->user)
            ->patch("/settings/roles/{$adminRole->id}", [
                'permissions' => ['settings.manage'],
            ])
            ->assertRedirect(route('settings.roles'))
            ->assertSessionHas('success');

        $adminRole->refresh();
        $this->assertTrue($adminRole->hasPermissionTo('settings.manage'));
    }

    public function test_non_admin_cannot_update(): void
    {
        $user = $this->user;
        $user->assignRole('member');

        $adminRole = Role::where('name', 'admin')->first();
        $this->assertNotNull($adminRole);

        $this->actingAs($user)
            ->patch("/settings/roles/{$adminRole->id}", [
                'permissions' => ['settings.manage'],
            ])
            ->assertForbidden();
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/settings/roles')->assertRedirect('/login');
    }

    public function test_update_requires_authentication(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $this->assertNotNull($adminRole);

        $this->patch("/settings/roles/{$adminRole->id}", [
            'permissions' => ['settings.manage'],
        ])->assertRedirect('/login');
    }

    public function test_update_rejects_invalid_permissions(): void
    {
        $this->user->givePermissionTo('settings.manage');

        $adminRole = Role::where('name', 'admin')->first();

        $this->actingAs($this->user)
            ->patch("/settings/roles/{$adminRole->id}", [
                'permissions' => ['nonexistent.permission'],
            ])
            ->assertSessionHasErrors('permissions.0');
    }

    public function test_update_validates_permissions_required(): void
    {
        $this->user->givePermissionTo('settings.manage');

        $adminRole = Role::where('name', 'admin')->first();

        $this->actingAs($this->user)
            ->patch("/settings/roles/{$adminRole->id}", [])
            ->assertSessionHasErrors('permissions');
    }
}
