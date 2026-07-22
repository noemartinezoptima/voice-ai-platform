<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlowApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_list_flows(): void
    {
        FlowModelFactory::new()->count(3)->create(['tenant_id' => $this->user->tenant_id]);

        $response = $this->withToken($this->token)->getJson('/api/v1/flows');

        $response->assertOk();
        $response->assertJsonCount(3);
    }

    public function test_list_flows_scoped_to_tenant(): void
    {
        FlowModelFactory::new()->create(['tenant_id' => $this->user->tenant_id]);
        $otherTenant = TenantFactory::new()->create();
        FlowModelFactory::new()->create(['tenant_id' => $otherTenant->id]);

        $response = $this->withToken($this->token)->getJson('/api/v1/flows');

        $response->assertOk();
        $response->assertJsonCount(1);
    }

    public function test_create_flow(): void
    {
        $payload = [
            'name' => 'My Flow',
            'description' => 'Test flow',
            'phone_number' => '+12345678901',
            'config' => [
                'start_step' => 's1',
                'steps' => [
                    's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hello'], 'next' => 'hangup'],
                    'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                ],
            ],
        ];

        $response = $this->withToken($this->token)->postJson('/api/v1/flows', $payload);

        $response->assertCreated();
        $response->assertJsonFragment(['name' => 'My Flow']);
    }

    public function test_create_flow_validates_required_fields(): void
    {
        $response = $this->withToken($this->token)->postJson('/api/v1/flows', []);

        $response->assertJsonValidationErrors(['name', 'config']);
    }

    public function test_show_flow(): void
    {
        $flow = FlowModelFactory::new()->create(['tenant_id' => $this->user->tenant_id]);

        $response = $this->withToken($this->token)->getJson("/api/v1/flows/{$flow->id}");

        $response->assertOk();
        $response->assertJsonFragment(['id' => $flow->id]);
    }

    public function test_show_flow_returns_404_for_other_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $flow = FlowModelFactory::new()->create(['tenant_id' => $otherTenant->id]);

        $response = $this->withToken($this->token)->getJson("/api/v1/flows/{$flow->id}");

        $response->assertNotFound();
    }

    public function test_update_flow(): void
    {
        $flow = FlowModelFactory::new()->create(['tenant_id' => $this->user->tenant_id]);

        $response = $this->withToken($this->token)->putJson("/api/v1/flows/{$flow->id}", [
            'name' => 'Updated Flow',
        ]);

        $response->assertOk();
        $response->assertJsonFragment(['name' => 'Updated Flow']);
    }
}
