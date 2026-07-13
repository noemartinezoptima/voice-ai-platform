<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use App\Models\User;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsPageTest extends TestCase
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
        $this->get('/analytics')->assertRedirect('/login');
    }

    public function test_index_renders_with_data(): void
    {
        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'from_number' => '+15551234567',
            'started_at' => now(),
        ]);

        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'user',
            'text' => 'Thank you so much, this service is great and amazing!',
        ]);

        $response = $this->actingAs($this->user)->get('/analytics');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Analytics/Index')
            ->where('totalTranscripts', 1)
            ->etc()
        );
    }

    public function test_sentiment_distribution_is_correct(): void
    {
        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'from_number' => '+15551234567',
            'started_at' => now(),
        ]);

        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'user',
            'text' => 'great amazing wonderful excellent happy thank you',
        ]);

        $response = $this->actingAs($this->user)->get('/analytics');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Analytics/Index')
            ->has('sentimentDistribution', fn ($dist) => $dist
                ->where('positive', 1)
                ->where('negative', 0)
                ->etc()
            )
            ->where('avgSentiment', fn ($v) => $v > 0)
            ->etc()
        );
    }

    public function test_sentiment_detects_negative_text(): void
    {
        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'from_number' => '+15551234567',
            'started_at' => now(),
        ]);

        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'user',
            'text' => 'terrible awful horrible useless poor bad issue error fail',
        ]);

        $response = $this->actingAs($this->user)->get('/analytics');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Analytics/Index')
            ->has('sentimentDistribution', fn ($dist) => $dist
                ->where('negative', 1)
                ->where('positive', 0)
                ->etc()
            )
            ->where('avgSentiment', fn ($v) => $v < 0)
            ->etc()
        );
    }

    public function test_export_downloads_csv(): void
    {
        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'from_number' => '+15551234567',
            'started_at' => now(),
        ]);

        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'user',
            'text' => 'Thank you for your wonderful service!',
        ]);

        $response = $this->actingAs($this->user)->get('/analytics/export/csv');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
        $this->assertStringStartsWith(
            'attachment; filename="conversation-analytics-',
            (string) $response->headers->get('Content-Disposition')
        );
        $content = $response->getContent();
        $this->assertStringContainsString('Date', $content);
        $this->assertStringContainsString('Total Transcripts', $content);
        $this->assertStringContainsString('Avg Sentiment', $content);
        $this->assertStringContainsString('Top Topic', $content);
    }

    public function test_empty_state_when_no_transcripts(): void
    {
        $response = $this->actingAs($this->user)->get('/analytics');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Analytics/Index')
            ->where('totalTranscripts', 0)
            ->etc()
        );
    }
}
