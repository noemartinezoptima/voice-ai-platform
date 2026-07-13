<?php

namespace Tests\Feature\Commands;

use App\Infrastructure\Persistence\Eloquent\Call\CallQualityScoreModel;
use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScoreCompletedCallsTest extends TestCase
{
    use RefreshDatabase;

    public function test_scores_completed_calls(): void
    {
        $tenant = TenantFactory::new()->create();

        $call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'status' => 'completed',
            'duration_seconds' => 120,
        ]);

        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'user',
            'text' => 'Thank you, that was great and helpful!',
        ]);

        $this->artisan('calls:score-completed')
            ->assertSuccessful();

        $this->assertDatabaseHas('call_quality_scores', [
            'call_id' => $call->id,
            'tenant_id' => $tenant->id,
        ]);
    }

    public function test_skips_already_scored(): void
    {
        $tenant = TenantFactory::new()->create();

        $call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'status' => 'completed',
            'duration_seconds' => 120,
        ]);

        CallQualityScoreModel::create([
            'call_id' => $call->id,
            'tenant_id' => $tenant->id,
            'total_score' => 50,
            'politeness_score' => 50,
            'resolution_score' => 50,
            'duration_score' => 50,
        ]);

        $this->artisan('calls:score-completed')
            ->assertSuccessful();

        $this->assertEquals(1, CallQualityScoreModel::count());
    }

    public function test_handles_no_transcripts(): void
    {
        $tenant = TenantFactory::new()->create();

        CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'status' => 'completed',
            'duration_seconds' => 60,
        ]);

        $this->artisan('calls:score-completed')
            ->assertSuccessful();

        $this->assertEquals(1, CallQualityScoreModel::count());
    }
}
