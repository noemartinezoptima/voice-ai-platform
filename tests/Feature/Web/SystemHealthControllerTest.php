<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SystemHealthControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->user->givePermissionTo('settings.manage');
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/settings/system')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)->get('/settings/system')->assertOk();
    }

    public function test_index_contains_health_data(): void
    {
        $response = $this->actingAs($this->user)->get('/settings/system');

        $response->assertInertia(fn ($page) => $page
            ->component('Settings/System/Index')
            ->has('health')
            ->has('failedJobs')
            ->has('queueDepth')
            ->has('errorRate')
            ->has('lastChecked')
        );
    }

    public function test_poll_requires_authentication(): void
    {
        $this->getJson('/settings/system/poll')->assertRedirect();
    }

    public function test_poll_returns_json(): void
    {
        $response = $this->actingAs($this->user)->getJson('/settings/system/poll');

        $response->assertOk()
            ->assertJsonStructure([
                'health' => ['score', 'database', 'redis', 'cache', 'twilio'],
                'failedJobs',
                'queueDepth',
                'errorRate',
                'lastChecked',
            ]);
    }

    public function test_poll_health_database_is_ok(): void
    {
        $response = $this->actingAs($this->user)->getJson('/settings/system/poll');

        $response->assertOk();
        $this->assertEquals('ok', $response->json('health.database.status'));
    }
}
