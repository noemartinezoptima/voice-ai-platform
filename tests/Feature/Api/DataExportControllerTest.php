<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataExportControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_export_tenant_data(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'owner']);

        $response = $this->actingAs($user)->getJson('/api/tenant/data/export');

        $response->assertOk();
        $response->assertJsonStructure([
            'exported_at',
            'tenant' => ['name', 'plan', 'created_at'],
            'calls',
            'flows',
            'users',
        ]);
    }

    public function test_non_owner_cannot_export_data(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'member']);

        $response = $this->actingAs($user)->getJson('/api/tenant/data/export');

        $response->assertForbidden();
    }
}
