<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Flow\FlowCommentModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\UserNotificationModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email_verified_at' => now(),
        ]);
    }

    public function test_index_renders_notifications_page(): void
    {
        UserNotificationModel::send($this->user->id, 'system', 'Test notification', 'Body text');

        $this->actingAs($this->user)
            ->get('/notifications')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Notifications/Index'));
    }

    public function test_index_shows_empty_state(): void
    {
        $this->actingAs($this->user)
            ->get('/notifications')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Notifications/Index'));
    }

    public function test_unread_returns_count_and_items(): void
    {
        UserNotificationModel::send($this->user->id, 'comment', 'New comment', 'Someone commented');

        $response = $this->actingAs($this->user)
            ->getJson('/notifications/unread');

        $response->assertOk()
            ->assertJsonPath('count', 1)
            ->assertJsonCount(1, 'items');
    }

    public function test_mark_as_read_updates_read_at(): void
    {
        $notif = UserNotificationModel::send($this->user->id, 'system', 'Mark me read');

        $this->actingAs($this->user)
            ->postJson("/notifications/{$notif->id}/read")
            ->assertOk();

        $this->assertNotNull($notif->fresh()->read_at);
    }

    public function test_mark_all_read_marks_all_unread(): void
    {
        UserNotificationModel::send($this->user->id, 'system', 'One');
        UserNotificationModel::send($this->user->id, 'comment', 'Two');

        $this->actingAs($this->user)
            ->post('/notifications/mark-all-read')
            ->assertRedirect('/notifications');

        $unread = UserNotificationModel::where('user_id', $this->user->id)->whereNull('read_at')->count();
        $this->assertEquals(0, $unread);
    }

    public function test_comment_replies_generate_notification(): void
    {
        $flow = FlowModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Flow',
            'config' => ['start_step' => 's1', 'steps' => []],
        ]);

        $comment = FlowCommentModel::create([
            'flow_id' => $flow->id,
            'tenant_id' => $this->user->tenant_id,
            'user_id' => $this->user->id,
            'body' => 'Original comment',
        ]);

        $replier = User::factory()->create([
            'tenant_id' => $this->user->tenant_id,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($replier)
            ->postJson("/flows/{$flow->id}/comments", [
                'body' => 'Reply to you',
                'parent_id' => $comment->id,
            ]);

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $this->user->id,
            'type' => 'comment',
        ]);
    }

    public function test_read_notifications_do_not_count_as_unread(): void
    {
        UserNotificationModel::send($this->user->id, 'system', 'Read one');
        UserNotificationModel::send($this->user->id, 'comment', 'Unread one');

        $first = UserNotificationModel::first();
        $first->update(['read_at' => now()]);

        $response = $this->actingAs($this->user)
            ->getJson('/notifications/unread');

        $response->assertJsonPath('count', 1);
    }
}
