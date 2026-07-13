<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\ErrorEventModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorMonitoringTest extends TestCase
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

    public function test_index_requires_authorization(): void
    {
        $this->get('/settings/errors')->assertRedirect('/login');
    }

    public function test_index_renders_with_stats(): void
    {
        ErrorEventModel::create([
            'hash' => hash('sha256', 'Exception:file.php:10'),
            'class' => 'Exception',
            'file' => 'file.php',
            'line' => 10,
            'message' => 'Test error',
            'occurrence_count' => 5,
            'last_seen_at' => now(),
            'first_seen_at' => now()->subDay(),
        ]);

        ErrorEventModel::create([
            'hash' => hash('sha256', 'RuntimeException:file2.php:20'),
            'class' => 'RuntimeException',
            'file' => 'file2.php',
            'line' => 20,
            'message' => 'Resolved error',
            'occurrence_count' => 2,
            'last_seen_at' => now(),
            'first_seen_at' => now()->subDay(),
            'resolved_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->get('/settings/errors');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Settings/Errors/Index')
                ->has('stats')
                ->has('errors.data', 1)
        );
    }

    public function test_view_error_details(): void
    {
        $hash = hash('sha256', 'Exception:file.php:10');
        ErrorEventModel::create([
            'hash' => $hash,
            'class' => 'Exception',
            'file' => 'file.php',
            'line' => 10,
            'message' => 'Test error',
            'occurrence_count' => 5,
            'last_seen_at' => now(),
            'first_seen_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->user)->get("/settings/errors/{$hash}");

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Settings/Errors/Show')
                ->where('error.hash', $hash)
        );
    }

    public function test_resolve_marks_as_resolved(): void
    {
        $hash = hash('sha256', 'Exception:file.php:10');
        ErrorEventModel::create([
            'hash' => $hash,
            'class' => 'Exception',
            'file' => 'file.php',
            'line' => 10,
            'message' => 'Test error',
            'occurrence_count' => 5,
            'last_seen_at' => now(),
            'first_seen_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->user)->patch("/settings/errors/{$hash}/resolve");

        $response->assertRedirect('/settings/errors');
        $this->assertNotNull(ErrorEventModel::where('hash', $hash)->first()->resolved_at);
    }

    public function test_index_filters_by_status(): void
    {
        ErrorEventModel::create([
            'hash' => hash('sha256', 'Exception:file.php:10'),
            'class' => 'Exception',
            'file' => 'file.php',
            'line' => 10,
            'message' => 'Unresolved',
            'occurrence_count' => 1,
            'last_seen_at' => now(),
            'first_seen_at' => now(),
        ]);

        ErrorEventModel::create([
            'hash' => hash('sha256', 'RuntimeException:file2.php:20'),
            'class' => 'RuntimeException',
            'file' => 'file2.php',
            'line' => 20,
            'message' => 'Resolved',
            'occurrence_count' => 1,
            'last_seen_at' => now(),
            'first_seen_at' => now(),
            'resolved_at' => now(),
        ]);

        $unresolved = $this->actingAs($this->user)->get('/settings/errors?filter=unresolved');
        $unresolved->assertInertia(fn ($page) => $page->has('errors.data', 1));

        $resolved = $this->actingAs($this->user)->get('/settings/errors?filter=resolved');
        $resolved->assertInertia(fn ($page) => $page->has('errors.data', 1));

        $all = $this->actingAs($this->user)->get('/settings/errors?filter=all');
        $all->assertInertia(fn ($page) => $page->has('errors.data', 2));
    }

    public function test_record_upserts_by_hash(): void
    {
        $exception = new \RuntimeException('Test runtime error');

        $first = ErrorEventModel::record($exception);
        $this->assertEquals(1, $first->occurrence_count);

        $second = ErrorEventModel::record($exception);
        $this->assertEquals(2, $second->occurrence_count);
        $this->assertEquals($first->id, $second->id);
    }
}
