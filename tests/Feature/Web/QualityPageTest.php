<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Call\CallQualityScoreModel;
use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Models\User;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QualityPageTest extends TestCase
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
        $this->get('/quality')->assertRedirect('/login');
    }

    public function test_index_renders_with_stats(): void
    {
        $flow = FlowModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Support Flow',
            'config' => [],
        ]);

        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'flow_id' => $flow->id,
            'from_number' => '+15551234567',
            'to_number' => '+15559876543',
            'status' => 'completed',
            'duration_seconds' => 120,
        ]);

        CallQualityScoreModel::create([
            'call_id' => $call->id,
            'tenant_id' => $this->user->tenant_id,
            'total_score' => 85,
            'politeness_score' => 80,
            'resolution_score' => 90,
            'duration_score' => 85,
        ]);

        $response = $this->actingAs($this->user)->get('/quality');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Quality/Index')
            ->where('totalScored', 1)
            ->where('avgScore', fn ($v) => $v > 0)
            ->etc()
        );
    }

    public function test_show_displays_score_breakdown(): void
    {
        $flow = FlowModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Sales Flow',
            'config' => [],
        ]);

        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'flow_id' => $flow->id,
            'from_number' => '+15551234567',
            'to_number' => '+15559876543',
            'status' => 'completed',
            'duration_seconds' => 180,
        ]);

        CallQualityScoreModel::create([
            'call_id' => $call->id,
            'tenant_id' => $this->user->tenant_id,
            'total_score' => 72,
            'politeness_score' => 65,
            'resolution_score' => 80,
            'duration_score' => 71,
        ]);

        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'user',
            'text' => 'Thank you for your help today!',
        ]);

        $response = $this->actingAs($this->user)->get("/quality/{$call->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Quality/Show')
            ->where('score.total_score', 72)
            ->where('score.politeness_score', 65)
            ->where('score.resolution_score', 80)
            ->where('score.duration_score', 71)
            ->etc()
        );
    }

    public function test_empty_state_when_no_scores(): void
    {
        $response = $this->actingAs($this->user)->get('/quality');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Quality/Index')
            ->where('totalScored', 0)
            ->etc()
        );
    }
}
