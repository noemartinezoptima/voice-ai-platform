<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamPageTest extends TestCase
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
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/team')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->owner)
            ->get('/team')
            ->assertOk();
    }

    public function test_invite_creates_invitation(): void
    {
        $this->actingAs($this->owner)->post('/team/invite', [
            'email' => 'new@example.com',
            'role' => 'member',
        ])->assertRedirect();

        $this->assertDatabaseHas('tenant_invitations', [
            'tenant_id' => $this->tenantId,
            'email' => 'new@example.com',
            'role' => 'member',
        ]);
    }

    public function test_invite_rejects_existing_member(): void
    {
        User::factory()->create([
            'tenant_id' => $this->tenantId,
            'email' => 'existing@example.com',
            'role' => 'member',
        ]);

        $this->actingAs($this->owner)
            ->post('/team/invite', ['email' => 'existing@example.com', 'role' => 'member'])
            ->assertSessionHasErrors('email');
    }

    public function test_invite_rejects_duplicate_pending(): void
    {
        $this->actingAs($this->owner)->post('/team/invite', [
            'email' => 'invited@example.com',
            'role' => 'member',
        ]);

        $this->actingAs($this->owner)
            ->post('/team/invite', ['email' => 'invited@example.com', 'role' => 'member'])
            ->assertSessionHasErrors('email');
    }

    public function test_member_cannot_invite(): void
    {
        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);

        $this->actingAs($member)
            ->post('/team/invite', ['email' => 'new@example.com', 'role' => 'member'])
            ->assertForbidden();
    }

    public function test_owner_can_update_role(): void
    {
        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);

        $this->actingAs($this->owner)
            ->patch("/team/{$member->id}/role", ['role' => 'admin'])
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $member->id,
            'role' => 'admin',
        ]);
    }

    public function test_owner_can_remove_member(): void
    {
        $member = User::factory()->create([
            'tenant_id' => $this->tenantId,
            'role' => 'member',
        ]);

        $this->actingAs($this->owner)
            ->delete("/team/{$member->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $member->id,
            'tenant_id' => null,
        ]);
    }

    public function test_owner_cannot_remove_self(): void
    {
        $this->actingAs($this->owner)
            ->delete("/team/{$this->owner->id}")
            ->assertForbidden();
    }

    public function test_cannot_manage_other_tenant_member(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $otherUser = User::factory()->create([
            'tenant_id' => $otherTenant->id,
            'role' => 'member',
        ]);

        $this->actingAs($this->owner)
            ->delete("/team/{$otherUser->id}")
            ->assertForbidden();
    }
}
