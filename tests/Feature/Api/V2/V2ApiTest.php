<?php

namespace Tests\Feature\Api\V2;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class V2ApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id, 'email_verified_at' => now()]);
    }

    public function test_v2_call_search_returns_results(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $flow = FlowModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Flow',
            'config' => ['start_step' => 's1', 'steps' => []],
        ]);

        CallModel::create([
            'tenant_id' => $this->user->tenant_id,
            'flow_id' => $flow->id,
            'call_sid' => 'CA123',
            'from_number' => '+15551234567',
            'to_number' => '+15559876543',
            'status' => 'completed',
        ]);

        $response = $this->withToken($token)
            ->getJson('/api/v2/calls/search?q=+15551234567');

        $response->assertOk()
            ->assertJsonPath('data.0.from_number', '+15551234567');
    }

    public function test_v2_call_search_requires_auth(): void
    {
        $this->getJson('/api/v2/calls/search')->assertUnauthorized();
    }

    public function test_v2_analytics_summary_returns_data(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v2/analytics/summary');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['total_calls', 'completed_calls', 'success_rate', 'avg_duration_seconds', 'total_transcripts', 'avg_quality_score'],
            ]);
    }

    public function test_v2_transcript_search_filters_by_role(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v2/transcripts/search?role=caller');

        $response->assertOk();
    }

    public function test_v2_call_quality_returns_404_for_unscored(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v2/calls/00000000-0000-0000-0000-000000000000/quality');

        $response->assertNotFound();
    }
}
