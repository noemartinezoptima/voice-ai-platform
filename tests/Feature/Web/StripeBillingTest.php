<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeBillingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private TenantModel $tenant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenant = TenantFactory::new()->create(['plan' => 'free']);
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->user->givePermissionTo(['billing.view', 'billing.manage']);
    }

    public function test_billing_index_shows_checkout_param(): void
    {
        $response = $this->actingAs($this->user)->get('/billing?checkout=success');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Billing/Index')
                ->where('checkout', 'success')
            );
    }

    public function test_checkout_requires_authentication(): void
    {
        $this->post('/billing/checkout', ['plan' => 'pro'])
            ->assertRedirect('/login');
    }

    public function test_checkout_validates_plan(): void
    {
        config(['stripe.prices.pro_monthly' => 'price_test_123']);
        config(['stripe.prices.enterprise_monthly' => 'price_test_456']);

        $this->actingAs($this->user)
            ->post('/billing/checkout', ['plan' => 'free'])
            ->assertSessionHasErrors('plan');
    }

    public function test_portal_requires_authentication(): void
    {
        $this->post('/billing/portal')
            ->assertRedirect('/login');
    }

    public function test_plan_limit_enforced_on_free_plan(): void
    {
        $this->user->givePermissionTo('flows.manage');
        FlowModelFactory::new()->count(3)->create([
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);

        $this->actingAs($this->user)
            ->post('/flows', ['name' => 'Blocked Flow'])
            ->assertRedirect(route('flows.index'))
            ->assertSessionHas('error');
    }

    public function test_plan_limit_allows_within_limit(): void
    {
        $this->user->givePermissionTo('flows.manage');
        FlowModelFactory::new()->count(1)->create([
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);

        $this->actingAs($this->user)
            ->post('/flows', ['name' => 'New Flow'])
            ->assertRedirect(route('flows.index'));

        $this->assertDatabaseHas('flows', [
            'tenant_id' => $this->tenant->id,
            'name' => 'New Flow',
        ]);
    }

    public function test_pro_plan_has_higher_limit(): void
    {
        $this->user->givePermissionTo('flows.manage');
        $this->tenant->update(['plan' => 'pro']);

        FlowModelFactory::new()->count(5)->create([
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);

        $this->actingAs($this->user)
            ->post('/flows', ['name' => 'Sixth Flow'])
            ->assertRedirect(route('flows.index'));

        $this->assertDatabaseHas('flows', [
            'tenant_id' => $this->tenant->id,
            'name' => 'Sixth Flow',
        ]);
    }

    public function test_webhook_updates_subscription_status(): void
    {
        $priceId = 'price_monthly_pro';
        config(['stripe.prices.pro_monthly' => $priceId]);

        $this->tenant->update(['stripe_id' => 'cus_test123']);

        $payload = $this->subscriptionUpdatedPayload(
            customerId: 'cus_test123',
            priceId: $priceId,
            status: 'active',
        );

        $this->postJson('/stripe/webhook', $payload)
            ->assertStatus(200);

        $this->tenant->refresh();
        $this->assertEquals('pro', $this->tenant->plan);
    }

    public function test_webhook_deletes_subscription_resets_plan(): void
    {
        $this->tenant->update(['plan' => 'pro', 'stripe_id' => 'cus_deleted']);

        $payload = $this->subscriptionDeletedPayload('cus_deleted');

        $this->postJson('/stripe/webhook', $payload)
            ->assertStatus(200);

        $this->tenant->refresh();
        $this->assertEquals('free', $this->tenant->plan);
    }

    public function test_webhook_past_due_does_not_change_plan(): void
    {
        $priceId = 'price_pro_monthly';
        config(['stripe.prices.pro_monthly' => $priceId]);
        $this->tenant->update(['plan' => 'pro', 'stripe_id' => 'cus_pastdue']);

        $payload = $this->subscriptionUpdatedPayload(
            customerId: 'cus_pastdue',
            priceId: $priceId,
            status: 'past_due',
        );

        $this->postJson('/stripe/webhook', $payload)
            ->assertStatus(200);

        $this->tenant->refresh();
        $this->assertEquals('pro', $this->tenant->plan);
    }

    public function test_free_plan_limits_inactive_flows_not_counted(): void
    {
        $this->user->givePermissionTo('flows.manage');
        FlowModelFactory::new()->count(2)->create([
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
        ]);
        FlowModelFactory::new()->create([
            'tenant_id' => $this->tenant->id,
            'is_active' => false,
        ]);

        $this->actingAs($this->user)
            ->post('/flows', ['name' => 'Third Active Flow'])
            ->assertRedirect(route('flows.index'));

        $this->assertDatabaseHas('flows', [
            'tenant_id' => $this->tenant->id,
            'name' => 'Third Active Flow',
        ]);
    }

    /** @return array<string, mixed> */
    private function subscriptionUpdatedPayload(string $customerId, string $priceId, string $status): array
    {
        return [
            'type' => 'customer.subscription.updated',
            'data' => [
                'object' => [
                    'id' => 'sub_test123',
                    'customer' => $customerId,
                    'status' => $status,
                    'items' => [
                        'data' => [
                            [
                                'id' => 'si_test123',
                                'price' => [
                                    'id' => $priceId,
                                    'product' => 'prod_test',
                                ],
                                'quantity' => 1,
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    private function subscriptionDeletedPayload(string $customerId): array
    {
        return [
            'type' => 'customer.subscription.deleted',
            'data' => [
                'object' => [
                    'id' => 'sub_deleted',
                    'customer' => $customerId,
                ],
            ],
        ];
    }
}
