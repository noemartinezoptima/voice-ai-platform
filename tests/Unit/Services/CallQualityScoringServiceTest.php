<?php

namespace Tests\Unit\Services;

use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use App\Services\CallQualityScoringService;
use App\Services\ConversationAnalyticsService;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CallQualityScoringServiceTest extends TestCase
{
    use RefreshDatabase;

    private CallQualityScoringService $scorer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->scorer = new CallQualityScoringService(new ConversationAnalyticsService);
    }

    public function test_polite_call_scores_high(): void
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
            'text' => 'Thank you so much! That was great and amazing. You were wonderful and helpful. I appreciate it!',
        ]);

        $scores = $this->scorer->scoreCall($call);

        $this->assertGreaterThan(70, $scores['total_score']);
        $this->assertGreaterThan(60, $scores['politeness_score']);
    }

    public function test_failed_call_scores_low(): void
    {
        $tenant = TenantFactory::new()->create();

        $call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'status' => 'failed',
            'duration_seconds' => 30,
        ]);

        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'user',
            'text' => 'This is terrible and awful. I am so frustrated and angry!',
        ]);

        $scores = $this->scorer->scoreCall($call);

        $this->assertLessThan(50, $scores['total_score']);
        $this->assertEquals(10, $scores['resolution_score']);
        $this->assertLessThan(40, $scores['politeness_score']);
    }

    public function test_short_call_penalized(): void
    {
        $tenant = TenantFactory::new()->create();

        $call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'status' => 'completed',
            'duration_seconds' => 10,
        ]);

        $scores = $this->scorer->scoreCall($call);

        $this->assertEquals(30, $scores['duration_score']);
    }
}
