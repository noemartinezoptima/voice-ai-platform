<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class DataDeletionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_delete_tenant_data(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);

        DB::table('calls')->insert([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenant->id,
            'call_sid' => 'CA'.str_repeat('0', 32),
            'from_number' => '+1234',
            'to_number' => '+5678',
            'status' => 'completed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->actingAs($user)->deleteJson('/api/tenant/data');

        $response->assertOk();
        $response->assertJsonStructure(['message', 'deleted_calls', 'deleted_recordings']);

        $this->assertEquals(0, DB::table('calls')->where('tenant_id', $tenant->id)->count());
    }

    public function test_non_owner_cannot_delete_data(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'member']);

        $response = $this->actingAs($user)->deleteJson('/api/tenant/data');

        $response->assertForbidden();
    }

    public function test_deletes_recordings_referenced_by_calls(): void
    {
        $recordingsRoot = sys_get_temp_dir().'/recordings-'.uniqid();
        Config::set('filesystems.disks.recordings.root', $recordingsRoot);

        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);
        $call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'recording_path' => $tenant->id.'/recording-to-delete.enc',
        ]);

        Storage::disk('recordings')->makeDirectory($tenant->id);
        Storage::disk('recordings')->put($call->recording_path, 'encrypted-content');

        $response = $this->actingAs($user)->deleteJson('/api/tenant/data');

        $response->assertOk();
        $this->assertFalse(Storage::disk('recordings')->exists($call->recording_path));
        $this->assertEquals(1, $response->json('deleted_calls'));
        $this->assertEquals(1, $response->json('deleted_recordings'));

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($recordingsRoot, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($iterator as $file) {
            $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname());
        }

        rmdir($recordingsRoot);
    }
}
