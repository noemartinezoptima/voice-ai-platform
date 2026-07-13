<?php

namespace Tests\Feature\Commands;

use App\Infrastructure\Persistence\Eloquent\Call\ScheduledCallModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExecuteScheduledCallsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'app.url' => 'https://app.test',
            'twilio.account_sid' => 'ACtest',
            'twilio.auth_token' => 'test-token',
        ]);
    }

    public function test_executes_due_calls(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response(['sid' => 'CAfake123'], 201),
        ]);

        $tenant = TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15551234567'],
        ]);

        $flow = FlowModel::create([
            'tenant_id' => $tenant->id,
            'name' => 'Test Flow',
            'config' => [],
            'phone_number' => '+15559876543',
        ]);

        ScheduledCallModel::create([
            'tenant_id' => $tenant->id,
            'flow_id' => $flow->id,
            'phone_number' => '+1234567890',
            'scheduled_at' => now()->subMinute(),
            'frequency' => 'once',
            'timezone' => 'UTC',
            'status' => 'pending',
        ]);

        $this->artisan('calls:execute-scheduled')->assertExitCode(0);

        $this->assertDatabaseHas('scheduled_calls', [
            'phone_number' => '+1234567890',
            'status' => 'completed',
        ]);

        Http::assertSent(function ($request) {
            return str_contains((string) $request->url(), 'api.twilio.com')
                && $request['To'] === '+1234567890'
                && $request['From'] === '+15559876543';
        });
    }

    public function test_creates_next_recurrence(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response(['sid' => 'CAfake456'], 201),
        ]);

        $tenant = TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15551234567'],
        ]);

        $flow = FlowModel::create([
            'tenant_id' => $tenant->id,
            'name' => 'Test Flow',
            'config' => [],
        ]);

        ScheduledCallModel::create([
            'tenant_id' => $tenant->id,
            'flow_id' => $flow->id,
            'phone_number' => '+1234567890',
            'scheduled_at' => now()->subMinute(),
            'frequency' => 'daily',
            'timezone' => 'UTC',
            'status' => 'pending',
        ]);

        $this->artisan('calls:execute-scheduled')->assertExitCode(0);

        $this->assertDatabaseHas('scheduled_calls', [
            'phone_number' => '+1234567890',
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('scheduled_calls', [
            'phone_number' => '+1234567890',
            'status' => 'pending',
            'frequency' => 'daily',
        ]);

        $this->assertEquals(2, ScheduledCallModel::count());
    }

    public function test_handles_twilio_failure(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response(['message' => 'Invalid phone number'], 400),
        ]);

        $tenant = TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15551234567'],
        ]);

        $flow = FlowModel::create([
            'tenant_id' => $tenant->id,
            'name' => 'Test Flow',
            'config' => [],
        ]);

        ScheduledCallModel::create([
            'tenant_id' => $tenant->id,
            'flow_id' => $flow->id,
            'phone_number' => '+1234567890',
            'scheduled_at' => now()->subMinute(),
            'frequency' => 'once',
            'timezone' => 'UTC',
            'status' => 'pending',
        ]);

        $this->artisan('calls:execute-scheduled')->assertExitCode(0);

        $this->assertDatabaseHas('scheduled_calls', [
            'phone_number' => '+1234567890',
            'status' => 'failed',
        ]);
    }

    public function test_skips_future_calls(): void
    {
        Http::fake();

        $tenant = TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15551234567'],
        ]);

        $flow = FlowModel::create([
            'tenant_id' => $tenant->id,
            'name' => 'Test Flow',
            'config' => [],
        ]);

        ScheduledCallModel::create([
            'tenant_id' => $tenant->id,
            'flow_id' => $flow->id,
            'phone_number' => '+1234567890',
            'scheduled_at' => now()->addHour(),
            'frequency' => 'once',
            'timezone' => 'UTC',
            'status' => 'pending',
        ]);

        $this->artisan('calls:execute-scheduled')->assertExitCode(0);

        $this->assertDatabaseHas('scheduled_calls', [
            'phone_number' => '+1234567890',
            'status' => 'pending',
        ]);

        Http::assertNothingSent();
    }

    public function test_does_not_recur_for_once_frequency(): void
    {
        Http::fake([
            'api.twilio.com/*' => Http::response(['sid' => 'CAfake789'], 201),
        ]);

        $tenant = TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15551234567'],
        ]);

        $flow = FlowModel::create([
            'tenant_id' => $tenant->id,
            'name' => 'Test Flow',
            'config' => [],
        ]);

        ScheduledCallModel::create([
            'tenant_id' => $tenant->id,
            'flow_id' => $flow->id,
            'phone_number' => '+1234567890',
            'scheduled_at' => now()->subMinute(),
            'frequency' => 'once',
            'timezone' => 'UTC',
            'status' => 'pending',
        ]);

        $this->artisan('calls:execute-scheduled')->assertExitCode(0);

        $this->assertEquals(1, ScheduledCallModel::count());
    }
}
