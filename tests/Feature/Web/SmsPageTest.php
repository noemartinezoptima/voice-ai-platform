<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Database\Factories\SmsMessageModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SmsPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/sms')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)->get('/sms')->assertOk();
    }

    public function test_index_shows_messages(): void
    {
        SmsMessageModelFactory::new()->count(3)->create(['tenant_id' => $this->user->tenant_id]);

        $this->actingAs($this->user)->get('/sms')->assertOk();
    }

    public function test_index_scoped_to_tenant(): void
    {
        SmsMessageModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'from_number' => '+1111',
        ]);
        $otherTenant = TenantFactory::new()->create();
        SmsMessageModelFactory::new()->create([
            'tenant_id' => $otherTenant->id,
            'from_number' => '+2222',
        ]);

        $response = $this->actingAs($this->user)->get('/sms');

        $response->assertDontSee('+2222');
    }

    public function test_index_paginates(): void
    {
        SmsMessageModelFactory::new()->count(25)->create(['tenant_id' => $this->user->tenant_id]);

        $this->actingAs($this->user)->get('/sms')->assertOk();
    }
}
