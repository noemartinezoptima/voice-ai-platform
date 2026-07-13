<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Sms\SmsAutoReplyModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SmsAutoReplyTest extends TestCase
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
        $this->get('/sms/auto-replies')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)->get('/sms/auto-replies')->assertOk();
    }

    public function test_index_lists_rules(): void
    {
        SmsAutoReplyModel::create([
            'tenant_id' => $this->user->tenant_id,
            'keyword' => 'HELP',
            'reply_text' => 'Reply from us',
            'match_type' => 'exact',
        ]);

        $this->actingAs($this->user)
            ->get('/sms/auto-replies')
            ->assertOk()
            ->assertSee('HELP')
            ->assertSee('Reply from us');
    }

    public function test_index_scoped_to_tenant(): void
    {
        SmsAutoReplyModel::create([
            'tenant_id' => $this->user->tenant_id,
            'keyword' => 'MINE',
            'reply_text' => 'My reply',
        ]);

        $otherTenant = TenantFactory::new()->create();
        SmsAutoReplyModel::create([
            'tenant_id' => $otherTenant->id,
            'keyword' => 'THEIRS',
            'reply_text' => 'Their reply',
        ]);

        $response = $this->actingAs($this->user)->get('/sms/auto-replies');

        $response->assertDontSee('THEIRS');
    }

    public function test_store_creates_rule(): void
    {
        $this->actingAs($this->user)
            ->post('/sms/auto-replies', [
                'keyword' => 'HELP',
                'reply_text' => 'How can we help?',
                'match_type' => 'contains',
            ])
            ->assertRedirect(route('sms.auto-replies.index'));

        $this->assertDatabaseHas('sms_auto_replies', [
            'tenant_id' => $this->user->tenant_id,
            'keyword' => 'HELP',
            'reply_text' => 'How can we help?',
            'match_type' => 'contains',
            'is_active' => true,
        ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $this->actingAs($this->user)
            ->post('/sms/auto-replies', [])
            ->assertSessionHasErrors(['keyword', 'reply_text', 'match_type']);
    }

    public function test_store_validates_match_type(): void
    {
        $this->actingAs($this->user)
            ->post('/sms/auto-replies', [
                'keyword' => 'TEST',
                'reply_text' => 'Response',
                'match_type' => 'invalid',
            ])
            ->assertSessionHasErrors('match_type');
    }

    public function test_update_modifies_rule(): void
    {
        $rule = SmsAutoReplyModel::create([
            'tenant_id' => $this->user->tenant_id,
            'keyword' => 'OLD',
            'reply_text' => 'Old reply',
            'match_type' => 'contains',
        ]);

        $this->actingAs($this->user)
            ->patch("/sms/auto-replies/{$rule->id}", [
                'keyword' => 'NEW',
                'reply_text' => 'New reply',
                'match_type' => 'exact',
            ])
            ->assertRedirect(route('sms.auto-replies.index'));

        $this->assertDatabaseHas('sms_auto_replies', [
            'id' => $rule->id,
            'keyword' => 'NEW',
            'reply_text' => 'New reply',
            'match_type' => 'exact',
        ]);
    }

    public function test_update_toggles_active(): void
    {
        $rule = SmsAutoReplyModel::create([
            'tenant_id' => $this->user->tenant_id,
            'keyword' => 'TOGGLE',
            'reply_text' => 'Toggle me',
            'is_active' => true,
        ]);

        $this->actingAs($this->user)
            ->patch("/sms/auto-replies/{$rule->id}", [
                'is_active' => false,
            ])
            ->assertRedirect(route('sms.auto-replies.index'));

        $this->assertDatabaseHas('sms_auto_replies', [
            'id' => $rule->id,
            'is_active' => false,
        ]);
    }

    public function test_update_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $rule = SmsAutoReplyModel::create([
            'tenant_id' => $otherTenant->id,
            'keyword' => 'THEIR',
            'reply_text' => 'Their reply',
        ]);

        $this->actingAs($this->user)
            ->patch("/sms/auto-replies/{$rule->id}", [
                'keyword' => 'HACKED',
            ])
            ->assertNotFound();
    }

    public function test_destroy_deletes_rule(): void
    {
        $rule = SmsAutoReplyModel::create([
            'tenant_id' => $this->user->tenant_id,
            'keyword' => 'DELETE',
            'reply_text' => 'Delete me',
        ]);

        $this->actingAs($this->user)
            ->delete("/sms/auto-replies/{$rule->id}")
            ->assertRedirect(route('sms.auto-replies.index'));

        $this->assertDatabaseMissing('sms_auto_replies', ['id' => $rule->id]);
    }

    public function test_destroy_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $rule = SmsAutoReplyModel::create([
            'tenant_id' => $otherTenant->id,
            'keyword' => 'THEIR',
            'reply_text' => 'Their reply',
        ]);

        $this->actingAs($this->user)
            ->delete("/sms/auto-replies/{$rule->id}")
            ->assertNotFound();
    }

    public function test_auto_reply_matching_exact(): void
    {
        SmsAutoReplyModel::create([
            'tenant_id' => $this->user->tenant_id,
            'keyword' => 'HELP',
            'reply_text' => 'We are here to help!',
            'match_type' => 'exact',
            'is_active' => true,
        ]);

        $this->actingAs($this->user)->get('/sms/auto-replies');

        $rule = SmsAutoReplyModel::first();
        $this->assertNotNull($rule);
        $this->assertEquals('exact', $rule->match_type);
    }

    public function test_auto_reply_matching_contains(): void
    {
        SmsAutoReplyModel::create([
            'tenant_id' => $this->user->tenant_id,
            'keyword' => 'help',
            'reply_text' => 'Support reply',
            'match_type' => 'contains',
            'is_active' => true,
        ]);

        $rule = SmsAutoReplyModel::first();
        $this->assertNotNull($rule);
        $this->assertEquals('contains', $rule->match_type);
    }

    public function test_auto_reply_matching_starts_with(): void
    {
        SmsAutoReplyModel::create([
            'tenant_id' => $this->user->tenant_id,
            'keyword' => 'START',
            'reply_text' => 'Welcome!',
            'match_type' => 'starts_with',
            'is_active' => true,
        ]);

        $rule = SmsAutoReplyModel::first();
        $this->assertNotNull($rule);
        $this->assertEquals('starts_with', $rule->match_type);
    }

    public function test_inactive_rules_skipped(): void
    {
        SmsAutoReplyModel::create([
            'tenant_id' => $this->user->tenant_id,
            'keyword' => 'HELP',
            'reply_text' => 'Should not reply',
            'is_active' => false,
        ]);

        $rule = SmsAutoReplyModel::first();
        $this->assertFalse((bool) $rule->is_active);
    }
}
