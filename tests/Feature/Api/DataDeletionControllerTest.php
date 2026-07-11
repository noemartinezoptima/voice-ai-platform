<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
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
}
