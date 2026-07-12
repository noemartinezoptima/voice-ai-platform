<?php

namespace Tests\Feature\Commands;

use Carbon\Carbon;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PurgeExpiredDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_purges_calls_older_than_retention(): void
    {
        $tenant = TenantFactory::new()->create();
        $tenant->data_protection = ['retention_days' => 30];
        $tenant->save();
        $tenantId = $tenant->id;

        DB::table('calls')->insert([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'call_sid' => 'CA'.str_repeat('0', 32),
            'from_number' => '+1234',
            'to_number' => '+5678',
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(60),
            'updated_at' => Carbon::now()->subDays(60),
        ]);

        DB::table('calls')->insert([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'call_sid' => 'CA'.str_repeat('1', 32),
            'from_number' => '+1234',
            'to_number' => '+5678',
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(10),
            'updated_at' => Carbon::now()->subDays(10),
        ]);

        $this->artisan('data:purge-expired')
            ->assertExitCode(0);

        $remaining = DB::table('calls')->where('tenant_id', $tenantId)->count();
        $this->assertEquals(1, $remaining);
    }

    public function test_purge_skips_tenants_with_no_data_protection(): void
    {
        $tenant = TenantFactory::new()->create();
        $tenant->data_protection = null;
        $tenant->save();

        DB::table('calls')->insert([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenant->id,
            'call_sid' => 'CA'.str_repeat('2', 32),
            'from_number' => '+1234',
            'to_number' => '+5678',
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(999),
            'updated_at' => Carbon::now()->subDays(999),
        ]);

        $this->artisan('data:purge-expired')
            ->assertExitCode(0);

        $remaining = DB::table('calls')->where('tenant_id', $tenant->id)->count();
        $this->assertEquals(1, $remaining);
    }

    public function test_purge_deletes_recordings_referenced_by_calls(): void
    {
        $recordingsRoot = sys_get_temp_dir().'/recordings-'.uniqid();
        Config::set('filesystems.disks.recordings.root', $recordingsRoot);

        $tenant = TenantFactory::new()->create();
        $tenant->data_protection = ['retention_days' => 30];
        $tenant->save();

        $call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'created_at' => Carbon::now()->subDays(60),
            'updated_at' => Carbon::now()->subDays(60),
            'recording_path' => $tenant->id.'/old-recording.enc',
        ]);

        Storage::disk('recordings')->makeDirectory($tenant->id);
        Storage::disk('recordings')->put($call->recording_path, 'encrypted-content');

        $this->artisan('data:purge-expired')
            ->assertExitCode(0);

        $this->assertEquals(0, DB::table('calls')->where('tenant_id', $tenant->id)->count());
        $this->assertFalse(Storage::disk('recordings')->exists($call->recording_path));

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
