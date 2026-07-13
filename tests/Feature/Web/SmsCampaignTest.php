<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Sms\SmsCampaignModel;
use App\Jobs\SendSmsCampaign;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class SmsCampaignTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = TenantFactory::new()->create([
            'settings' => [
                'twilio_phone_number' => '+15551234567',
                'twilio_account_sid' => 'ACtest',
                'twilio_auth_token' => 'test-token',
            ],
        ]);
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/sms/campaigns')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)->get('/sms/campaigns')->assertOk();
    }

    public function test_index_lists_campaigns(): void
    {
        SmsCampaignModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Welcome Campaign',
            'message' => 'Welcome to our service!',
            'recipients' => ['+1111', '+2222'],
            'total_count' => 2,
        ]);

        $this->actingAs($this->user)
            ->get('/sms/campaigns')
            ->assertOk()
            ->assertSee('Welcome Campaign');
    }

    public function test_index_scoped_to_tenant(): void
    {
        SmsCampaignModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'My Campaign',
            'message' => 'My message',
            'recipients' => ['+1111'],
        ]);

        $otherTenant = TenantFactory::new()->create();
        SmsCampaignModel::create([
            'tenant_id' => $otherTenant->id,
            'name' => 'Their Campaign',
            'message' => 'Their message',
            'recipients' => ['+2222'],
        ]);

        $response = $this->actingAs($this->user)->get('/sms/campaigns');

        $response->assertDontSee('Their Campaign');
    }

    public function test_store_creates_draft_campaign(): void
    {
        $this->actingAs($this->user)
            ->post('/sms/campaigns', [
                'name' => 'Test Campaign',
                'message' => 'Hello from campaign',
                'recipients' => "+12345678900\n+19876543210",
            ])
            ->assertRedirect(route('sms.campaigns.index'));

        $this->assertDatabaseHas('sms_campaigns', [
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Campaign',
            'message' => 'Hello from campaign',
            'status' => 'draft',
            'total_count' => 2,
        ]);

        $campaign = SmsCampaignModel::first();
        $this->assertCount(2, $campaign->recipients);
    }

    public function test_store_handles_comma_separated_recipients(): void
    {
        $this->actingAs($this->user)
            ->post('/sms/campaigns', [
                'name' => 'CSV Campaign',
                'message' => 'Hello',
                'recipients' => '+1111, +2222, +3333',
            ])
            ->assertRedirect(route('sms.campaigns.index'));

        $campaign = SmsCampaignModel::first();
        $this->assertCount(3, $campaign->recipients);
    }

    public function test_store_validates_required_fields(): void
    {
        $this->actingAs($this->user)
            ->post('/sms/campaigns', [])
            ->assertSessionHasErrors(['name', 'message', 'recipients']);
    }

    public function test_send_dispatches_job(): void
    {
        Queue::fake();

        $campaign = SmsCampaignModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Send Test',
            'message' => 'Sending...',
            'recipients' => ['+1111'],
            'total_count' => 1,
            'status' => 'draft',
        ]);

        $this->actingAs($this->user)
            ->post("/sms/campaigns/{$campaign->id}/send")
            ->assertRedirect(route('sms.campaigns.index'));

        Queue::assertPushed(SendSmsCampaign::class);

        $this->assertDatabaseHas('sms_campaigns', [
            'id' => $campaign->id,
            'status' => 'sending',
        ]);
    }

    public function test_send_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $campaign = SmsCampaignModel::create([
            'tenant_id' => $otherTenant->id,
            'name' => 'Their Campaign',
            'message' => 'Nope',
            'recipients' => ['+1111'],
        ]);

        $this->actingAs($this->user)
            ->post("/sms/campaigns/{$campaign->id}/send")
            ->assertNotFound();
    }

    public function test_cannot_send_completed_campaign(): void
    {
        $campaign = SmsCampaignModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Done',
            'message' => 'Done',
            'recipients' => ['+1111'],
            'status' => 'completed',
        ]);

        $this->actingAs($this->user)
            ->post("/sms/campaigns/{$campaign->id}/send")
            ->assertRedirect()
            ->assertSessionHas('error');
    }

    public function test_destroy_deletes_draft_campaign(): void
    {
        $campaign = SmsCampaignModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Delete Me',
            'message' => 'Bye',
            'recipients' => ['+1111'],
            'status' => 'draft',
        ]);

        $this->actingAs($this->user)
            ->delete("/sms/campaigns/{$campaign->id}")
            ->assertRedirect(route('sms.campaigns.index'));

        $this->assertDatabaseMissing('sms_campaigns', ['id' => $campaign->id]);
    }

    public function test_cannot_delete_non_draft_campaign(): void
    {
        $campaign = SmsCampaignModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Sending',
            'message' => 'Sending',
            'recipients' => ['+1111'],
            'status' => 'sending',
        ]);

        $this->actingAs($this->user)
            ->delete("/sms/campaigns/{$campaign->id}")
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('sms_campaigns', ['id' => $campaign->id]);
    }

    public function test_destroy_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $campaign = SmsCampaignModel::create([
            'tenant_id' => $otherTenant->id,
            'name' => 'Their Campaign',
            'message' => 'Nope',
            'recipients' => ['+1111'],
        ]);

        $this->actingAs($this->user)
            ->delete("/sms/campaigns/{$campaign->id}")
            ->assertNotFound();
    }
}
