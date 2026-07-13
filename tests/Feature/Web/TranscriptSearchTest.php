<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use App\Models\User;
use Database\Factories\CallModelFactory;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TranscriptSearchTest extends TestCase
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
        $this->get('/transcripts')->assertRedirect('/login');
    }

    public function test_index_renders_search_page(): void
    {
        $this->actingAs($this->user)
            ->get('/transcripts')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Transcripts/Index'));
    }

    public function test_search_finds_results(): void
    {
        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'from_number' => '+15551234567',
            'to_number' => '+15559876543',
        ]);

        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'caller',
            'text' => 'Hello, I need help with my order',
        ]);

        $this->actingAs($this->user)
            ->get('/transcripts?q=order')
            ->assertOk()
            ->assertSee('Hello, I need help with my order');
    }

    public function test_search_filters_by_role(): void
    {
        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
        ]);

        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'caller',
            'text' => 'Caller message',
        ]);

        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'assistant',
            'text' => 'Assistant response',
        ]);

        $this->actingAs($this->user)
            ->get('/transcripts?role=caller')
            ->assertOk()
            ->assertSee('Caller message')
            ->assertDontSee('Assistant response');
    }

    public function test_search_excludes_other_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $otherCall = CallModelFactory::new()->create([
            'tenant_id' => $otherTenant->id,
        ]);
        TranscriptModel::create([
            'call_id' => $otherCall->id,
            'role' => 'caller',
            'text' => 'Top secret data',
        ]);

        $ownCall = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
        ]);
        TranscriptModel::create([
            'call_id' => $ownCall->id,
            'role' => 'caller',
            'text' => 'My own data',
        ]);

        $this->actingAs($this->user)
            ->get('/transcripts')
            ->assertOk()
            ->assertSee('My own data')
            ->assertDontSee('Top secret data');
    }

    public function test_search_shows_call_info(): void
    {
        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Support Bot',
        ]);
        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'flow_id' => $flow->id,
            'from_number' => '+15551234567',
            'to_number' => '+15559876543',
        ]);
        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'assistant',
            'text' => 'How can I help you?',
        ]);

        $this->actingAs($this->user)
            ->get('/transcripts')
            ->assertOk()
            ->assertSee('+15551234567')
            ->assertSee('+15559876543')
            ->assertSee('Support Bot');
    }

    public function test_index_shows_stats(): void
    {
        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
        ]);
        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'caller',
            'text' => 'Line one',
        ]);
        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'assistant',
            'text' => 'Line two',
        ]);

        $response = $this->actingAs($this->user)
            ->get('/transcripts')
            ->assertOk();

        $page = $response->inertiaProps();
        $this->assertEquals(2, $page['stats']['total_transcripts']);
        $this->assertEquals(1, $page['stats']['calls_with_transcripts']);
    }

    public function test_export_requires_authentication(): void
    {
        $this->get('/transcripts/export/csv')->assertRedirect('/login');
    }

    public function test_export_downloads_csv(): void
    {
        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'from_number' => '+15551234567',
            'to_number' => '+15559876543',
            'call_sid' => 'CA123456',
        ]);
        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'caller',
            'text' => 'Text with comma, and quotes',
            'confidence' => 0.95,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/transcripts/export/csv');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
        $response->assertHeader('Content-Disposition');

        $content = $response->getContent();
        $this->assertStringContainsString('CallSid', $content);
        $this->assertStringContainsString('CA123456', $content);
        $this->assertStringContainsString('0.95', $content);
    }

    public function test_search_case_insensitive(): void
    {
        $call = CallModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
        ]);
        TranscriptModel::create([
            'call_id' => $call->id,
            'role' => 'caller',
            'text' => 'UPPERCASE TEXT',
        ]);

        $this->actingAs($this->user)
            ->get('/transcripts?q=uppercase')
            ->assertOk()
            ->assertSee('UPPERCASE TEXT');
    }
}
