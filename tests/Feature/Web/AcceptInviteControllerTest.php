<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Team\TenantInvitationModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcceptInviteControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->tenantId = $tenant->id;
        $this->user = User::factory()->create(['tenant_id' => $this->tenantId, 'role' => 'owner']);
    }

    public function test_accepts_invite_for_logged_in_user(): void
    {
        $invitedUser = User::factory()->create(['tenant_id' => null, 'email' => 'invited@example.com']);
        $invitation = TenantInvitationModel::create([
            'tenant_id' => $this->tenantId,
            'email' => 'invited@example.com',
            'role' => 'member',
            'token' => 'test-token-123',
        ]);

        $response = $this->actingAs($invitedUser)
            ->get('/invite/test-token-123');

        $response->assertRedirect('/dashboard');
        $response->assertSessionHas('success');

        $invitedUser->refresh();
        $this->assertEquals($this->tenantId, $invitedUser->tenant_id);
        $this->assertEquals('member', $invitedUser->role);

        $invitation->refresh();
        $this->assertNotNull($invitation->accepted_at);
    }

    public function test_accepts_invite_for_existing_user_by_email(): void
    {
        $existingUser = User::factory()->create(['tenant_id' => null, 'email' => 'existing@example.com']);
        $invitation = TenantInvitationModel::create([
            'tenant_id' => $this->tenantId,
            'email' => 'existing@example.com',
            'role' => 'admin',
            'token' => 'test-token-456',
        ]);

        $response = $this->get('/invite/test-token-456');

        $response->assertRedirect();

        $existingUser->refresh();
        $this->assertEquals($this->tenantId, $existingUser->tenant_id);

        $invitation->refresh();
        $this->assertNotNull($invitation->accepted_at);
    }

    public function test_redirects_to_register_for_new_user(): void
    {
        $invitation = TenantInvitationModel::create([
            'tenant_id' => $this->tenantId,
            'email' => 'newuser@example.com',
            'role' => 'member',
            'token' => 'test-token-789',
        ]);

        $response = $this->get('/invite/test-token-789');

        $response->assertRedirect(route('register', ['email' => 'newuser@example.com', 'token' => 'test-token-789']));
    }

    public function test_invalid_token_returns_404(): void
    {
        $this->get('/invite/invalid-token')->assertNotFound();
    }

    public function test_already_accepted_invite_returns_404(): void
    {
        TenantInvitationModel::create([
            'tenant_id' => $this->tenantId,
            'email' => 'already@example.com',
            'role' => 'member',
            'token' => 'used-token',
            'accepted_at' => now(),
        ]);

        $this->get('/invite/used-token')->assertNotFound();
    }
}
