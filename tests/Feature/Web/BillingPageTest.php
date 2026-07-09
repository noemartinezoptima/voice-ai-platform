<?php

namespace Tests\Feature\Web;

use App\Models\User;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/billing')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)->get('/billing')->assertOk();
    }

    public function test_index_shows_current_plan(): void
    {
        $response = $this->actingAs($this->user)->get('/billing');
        $response->assertSee('Free');
    }

    public function test_update_plan(): void
    {
        $this->actingAs($this->user)
            ->patch('/billing/plan', ['plan' => 'pro'])
            ->assertRedirect('/billing');

        /** @var TenantModel $tenant */
        $tenant = TenantModel::find($this->user->tenant_id);
        $this->assertEquals('pro', $tenant->plan);
    }

    public function test_update_plan_validates(): void
    {
        $this->actingAs($this->user)
            ->patch('/billing/plan', ['plan' => 'invalid'])
            ->assertSessionHasErrors('plan');
    }

    public function test_update_plan_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create(['plan' => 'free']);
        $otherUser = User::factory()->create(['tenant_id' => $otherTenant->id]);

        $this->actingAs($otherUser)
            ->patch('/billing/plan', ['plan' => 'enterprise'])
            ->assertRedirect('/billing');

        $otherTenant->refresh();
        $this->assertEquals('enterprise', $otherTenant->plan);
    }
}
