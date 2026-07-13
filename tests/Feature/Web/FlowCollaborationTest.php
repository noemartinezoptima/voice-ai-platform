<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Flow\FlowCommentModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowVersionModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlowCollaborationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private FlowModel $flow;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->flow = FlowModel::factory()->create([
            'tenant_id' => $tenant->id,
            'config' => [
                'start_step' => 's1',
                'steps' => [
                    's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hello'], 'next' => 'hangup'],
                    'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                ],
            ],
        ]);
    }

    public function test_version_is_created_on_config_change(): void
    {
        $newConfig = [
            'start_step' => 'greet',
            'steps' => [
                'greet' => ['id' => 'greet', 'type' => 'say', 'config' => ['text' => 'Welcome'], 'next' => 'hangup'],
                'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
            ],
        ];

        $this->actingAs($this->user)
            ->patch("/flows/{$this->flow->id}", [
                'name' => $this->flow->name,
                'description' => $this->flow->description,
                'is_active' => $this->flow->is_active,
                'config' => json_encode($newConfig),
                'change_description' => 'Updated greeting',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('flow_versions', [
            'flow_id' => $this->flow->id,
            'version' => 1,
            'change_description' => 'Updated greeting',
        ]);

        $version = FlowVersionModel::where('flow_id', $this->flow->id)->first();
        $this->assertNotNull($version);
        $this->assertArrayHasKey('start_step', $version->config);
        $this->assertEquals('s1', $version->config['start_step']);
    }

    public function test_version_history_is_displayed(): void
    {
        FlowVersionModel::create([
            'flow_id' => $this->flow->id,
            'user_id' => $this->user->id,
            'version' => 1,
            'config' => ['start_step' => 'old', 'steps' => []],
            'change_description' => 'First version',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/flows/{$this->flow->id}/versions");

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['change_description' => 'First version']);
    }

    public function test_restore_reverts_to_previous_version(): void
    {
        $oldConfig = [
            'start_step' => 'old_s1',
            'steps' => [
                'old_s1' => ['id' => 'old_s1', 'type' => 'say', 'config' => ['text' => 'Old hello'], 'next' => 'old_hangup'],
                'old_hangup' => ['id' => 'old_hangup', 'type' => 'hangup'],
            ],
        ];

        $version = FlowVersionModel::create([
            'flow_id' => $this->flow->id,
            'user_id' => $this->user->id,
            'version' => 1,
            'config' => $oldConfig,
            'change_description' => 'Initial version',
        ]);

        $response = $this->actingAs($this->user)
            ->post("/flows/{$this->flow->id}/versions/{$version->id}/restore");

        $response->assertRedirect();

        $this->flow->refresh();
        $this->assertEquals(2, $this->flow->version);
        $this->assertEquals('old_s1', $this->flow->config['start_step']);
    }

    public function test_comment_can_be_added(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/flows/{$this->flow->id}/comments", [
                'body' => 'This flow needs improvement',
            ]);

        $response->assertCreated()
            ->assertJsonFragment(['body' => 'This flow needs improvement']);

        $this->assertDatabaseHas('flow_comments', [
            'flow_id' => $this->flow->id,
            'user_id' => $this->user->id,
            'body' => 'This flow needs improvement',
        ]);
    }

    public function test_comment_thread_reply(): void
    {
        $parent = FlowCommentModel::create([
            'flow_id' => $this->flow->id,
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'body' => 'Parent comment',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/flows/{$this->flow->id}/comments", [
                'body' => 'A reply',
                'parent_id' => $parent->id,
            ]);

        $response->assertCreated()
            ->assertJsonFragment(['body' => 'A reply']);

        $this->assertDatabaseHas('flow_comments', [
            'flow_id' => $this->flow->id,
            'parent_id' => $parent->id,
            'body' => 'A reply',
        ]);
    }

    public function test_comments_are_displayed(): void
    {
        FlowCommentModel::create([
            'flow_id' => $this->flow->id,
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'body' => 'First comment',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/flows/{$this->flow->id}/comments");

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['body' => 'First comment']);
    }
}
