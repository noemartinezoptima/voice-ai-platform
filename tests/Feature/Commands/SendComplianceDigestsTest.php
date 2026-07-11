<?php

namespace Tests\Feature\Commands;

use App\Mail\ComplianceDigest;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SendComplianceDigestsTest extends TestCase
{
    use RefreshDatabase;

    public function test_sends_digest_to_owners(): void
    {
        Mail::fake();

        $tenant = TenantFactory::new()->create();
        $tenant->data_protection = ['retention_days' => 90];
        $tenant->save();

        User::factory()->create([
            'tenant_id' => $tenant->id,
            'role' => 'owner',
            'email_verified_at' => now(),
        ]);

        $this->artisan('compliance:digest')
            ->assertExitCode(0);

        Mail::assertQueued(ComplianceDigest::class);
    }

    public function test_skips_tenants_without_owners(): void
    {
        Mail::fake();

        $tenant = TenantFactory::new()->create();

        $this->artisan('compliance:digest')
            ->assertExitCode(0);

        Mail::assertNothingQueued();
    }
}
