<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CallApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_list_calls_returns_empty(): void
    {
        $response = $this->withToken($this->token)->getJson('/api/v1/calls');

        $response->assertOk();
        $response->assertJsonCount(0);
    }

    public function test_show_call_returns_404(): void
    {
        $response = $this->withToken($this->token)->getJson('/api/v1/calls/'.Str::uuid()->toString());

        $response->assertNotFound();
    }
}
