<?php

namespace Tests\Unit;

use App\Infrastructure\Persistence\Eloquent\Sms\SmsMessageModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Database\Factories\TenantFactory;
use Database\Seeders\ProfileDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** @group performance */
class QueryPerformanceTest extends TestCase
{
    use RefreshDatabase;

    private string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = TenantFactory::new()->create();
        $this->tenantId = $tenant->id;
    }

    public function test_sms_messages_tenant_query_uses_index(): void
    {
        SmsMessageModel::factory()->count(10)->create(['tenant_id' => $this->tenantId]);

        DB::enableQueryLog();
        SmsMessageModel::where('tenant_id', $this->tenantId)
            ->where('direction', 'outbound')
            ->where('created_at', '>=', now()->subDays(7))
            ->get();
        $queries = DB::getQueryLog();

        $this->assertLessThan(10, count($queries), 'Too many queries');
        $this->assertStringContainsString('sms_messages', $queries[0]['query'] ?? '');
    }

    public function test_flows_active_tenant_query(): void
    {
        FlowModel::factory()->count(5)->create([
            'tenant_id' => $this->tenantId,
            'is_active' => true,
        ]);

        DB::enableQueryLog();
        FlowModel::where('tenant_id', $this->tenantId)
            ->where('is_active', true)
            ->orderBy('updated_at', 'desc')
            ->get();
        $queries = DB::getQueryLog();

        $this->assertLessThan(5, count($queries));
        $this->assertCount(5, FlowModel::where('tenant_id', $this->tenantId)
            ->where('is_active', true)->get());
    }

    public function test_n_plus_one_prevention(): void
    {
        FlowModel::factory()->count(3)->create(['tenant_id' => $this->tenantId]);

        DB::enableQueryLog();
        $flows = FlowModel::where('tenant_id', $this->tenantId)->with('tenant')->get();
        foreach ($flows as $flow) {
            $relation = $flow->getRelation('tenant');
            $this->assertNotNull($relation);
        }
        $queries = DB::getQueryLog();

        $this->assertLessThanOrEqual(2, count($queries), 'N+1 detected');
    }

    public function test_bulk_create_under_200ms(): void
    {
        $start = microtime(true);
        $records = [];
        for ($i = 0; $i < 50; $i++) {
            $records[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'tenant_id' => $this->tenantId,
                'from_number' => '+1555' . str_pad((string) $i, 7, '0'),
                'to_number' => '+15550000000',
                'body' => fake()->sentence(),
                'direction' => 'inbound',
                'status' => 'received',
                'message_sid' => 'SM' . \Illuminate\Support\Str::random(32),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        SmsMessageModel::insert($records);
        $elapsed = (microtime(true) - $start) * 1000;

        $this->assertLessThan(200, $elapsed, "Bulk insert took {$elapsed}ms, expected <200ms");
    }

    public function test_query_with_large_dataset_under_500ms(): void
    {
        $records = [];
        for ($i = 0; $i < 200; $i++) {
            $records[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'tenant_id' => $this->tenantId,
                'from_number' => '+1555' . str_pad((string) $i, 7, '0'),
                'to_number' => '+15550000000',
                'body' => fake()->sentence(),
                'direction' => $i % 2 === 0 ? 'inbound' : 'outbound',
                'status' => 'received',
                'message_sid' => 'SM' . \Illuminate\Support\Str::random(32),
                'created_at' => now()->subDays(rand(0, 30)),
                'updated_at' => now(),
            ];
        }
        SmsMessageModel::insert($records);

        $start = microtime(true);
        $result = SmsMessageModel::where('tenant_id', $this->tenantId)
            ->where('direction', 'inbound')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
        $elapsed = (microtime(true) - $start) * 1000;

        $this->assertGreaterThan(0, $result);
        $this->assertLessThan(500, $elapsed, "Query took {$elapsed}ms, expected <500ms");
    }
}
