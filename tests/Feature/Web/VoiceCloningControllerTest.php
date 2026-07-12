<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Infrastructure\Persistence\Eloquent\Voice\CustomVoiceModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class VoiceCloningControllerTest extends TestCase
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
        $this->get('/settings/voices')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)->get('/settings/voices')->assertOk();
    }

    public function test_index_shows_voices_list(): void
    {
        CustomVoiceModel::create([
            'tenant_id' => $this->user->tenant_id,
            'elevenlabs_voice_id' => 'voice_abc123',
            'name' => 'My Voice',
            'sample_count' => 3,
        ]);

        CustomVoiceModel::create([
            'tenant_id' => $this->user->tenant_id,
            'elevenlabs_voice_id' => 'voice_def456',
            'name' => 'Another Voice',
            'sample_count' => 1,
            'is_default' => true,
        ]);

        $response = $this->actingAs($this->user)->get('/settings/voices');

        $response->assertOk();
        $response->assertSee('My Voice');
        $response->assertSee('Another Voice');
        $response->assertSee('voice_abc123');
        $response->assertSee('voice_def456');
    }

    public function test_index_shows_empty_state(): void
    {
        $response = $this->actingAs($this->user)->get('/settings/voices');

        $response->assertOk();
    }

    public function test_store_clones_voice(): void
    {
        $tenant = TenantModel::find($this->user->tenant_id);
        $tenant->update(['settings' => array_merge($tenant->settings ?? [], [
            'elevenlabs_api_key' => Crypt::encryptString('test-api-key-123'),
        ])]);

        Http::fake([
            'https://api.elevenlabs.io/v1/voices/add' => Http::response([
                'voice_id' => 'cloned_voice_xyz',
                'sample_count' => 2,
                'requires_verification' => false,
                'preview_url' => 'https://example.com/preview.mp3',
            ], 200),
        ]);

        $file = UploadedFile::fake()->create('sample.mp3', 1024, 'audio/mpeg');

        $this->actingAs($this->user)
            ->post('/settings/voices', [
                'name' => 'My Cloned Voice',
                'files' => [$file, $file],
                'description' => 'A test cloned voice',
                'remove_background_noise' => true,
            ])
            ->assertRedirect('/settings/voices');

        $voice = CustomVoiceModel::where('tenant_id', $this->user->tenant_id)->first();
        $this->assertNotNull($voice);
        $this->assertEquals('My Cloned Voice', $voice->name);
        $this->assertEquals('cloned_voice_xyz', $voice->elevenlabs_voice_id);
        $this->assertEquals(2, $voice->sample_count);
        $this->assertEquals('A test cloned voice', $voice->description);
        $this->assertTrue($voice->is_default);

        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.elevenlabs.io/v1/voices/add'
                && $request->hasHeader('xi-api-key', 'test-api-key-123');
        });
    }

    public function test_store_requires_files(): void
    {
        $this->actingAs($this->user)
            ->post('/settings/voices', ['name' => 'No Files'])
            ->assertSessionHasErrors('files');

        $this->assertEquals(0, CustomVoiceModel::count());
    }

    public function test_store_requires_name(): void
    {
        $file = UploadedFile::fake()->create('sample.mp3', 1024, 'audio/mpeg');

        $this->actingAs($this->user)
            ->post('/settings/voices', ['files' => [$file]])
            ->assertSessionHasErrors('name');

        $this->assertEquals(0, CustomVoiceModel::count());
    }

    public function test_store_invalid_file_type(): void
    {
        $file = UploadedFile::fake()->create('sample.txt', 1024, 'text/plain');

        $this->actingAs($this->user)
            ->post('/settings/voices', [
                'name' => 'Bad File',
                'files' => [$file],
            ])
            ->assertSessionHasErrors('files.0');

        $this->assertEquals(0, CustomVoiceModel::count());
    }

    public function test_store_max_three_files(): void
    {
        $file = UploadedFile::fake()->create('sample.mp3', 1024, 'audio/mpeg');

        $this->actingAs($this->user)
            ->post('/settings/voices', [
                'name' => 'Too Many',
                'files' => [$file, $file, $file, $file],
            ])
            ->assertSessionHasErrors('files');

        $this->assertEquals(0, CustomVoiceModel::count());
    }

    public function test_store_handles_elevenlabs_api_error(): void
    {
        $tenant = TenantModel::find($this->user->tenant_id);
        $tenant->update(['settings' => array_merge($tenant->settings ?? [], [
            'elevenlabs_api_key' => Crypt::encryptString('test-api-key-123'),
        ])]);

        Http::fake([
            'https://api.elevenlabs.io/v1/voices/add' => Http::response([
                'detail' => ['message' => 'Insufficient quota'],
            ], 422),
        ]);

        $file = UploadedFile::fake()->create('sample.mp3', 1024, 'audio/mpeg');

        $this->actingAs($this->user)
            ->post('/settings/voices', [
                'name' => 'Error Voice',
                'files' => [$file],
            ])
            ->assertRedirect('/settings/voices');

        $this->assertEquals(0, CustomVoiceModel::count());
    }

    public function test_store_requires_api_key(): void
    {
        $file = UploadedFile::fake()->create('sample.mp3', 1024, 'audio/mpeg');

        $this->actingAs($this->user)
            ->post('/settings/voices', [
                'name' => 'No API Key',
                'files' => [$file],
            ])
            ->assertRedirect('/settings/voices');

        $this->assertEquals(0, CustomVoiceModel::count());
    }

    public function test_destroy_deletes_voice(): void
    {
        $voice = CustomVoiceModel::create([
            'tenant_id' => $this->user->tenant_id,
            'elevenlabs_voice_id' => 'voice_delete_me',
            'name' => 'Delete Me',
            'sample_count' => 1,
        ]);

        $this->actingAs($this->user)
            ->delete("/settings/voices/{$voice->id}")
            ->assertRedirect('/settings/voices');

        $this->assertNull($voice->fresh());
    }

    public function test_non_owner_cannot_delete_others_voice(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $voice = CustomVoiceModel::create([
            'tenant_id' => $otherTenant->id,
            'elevenlabs_voice_id' => 'voice_other',
            'name' => 'Other Voice',
            'sample_count' => 1,
        ]);

        $this->actingAs($this->user)
            ->delete("/settings/voices/{$voice->id}")
            ->assertForbidden();

        $this->assertNotNull($voice->fresh());
    }

    public function test_set_default_updates_is_default(): void
    {
        $voice1 = CustomVoiceModel::create([
            'tenant_id' => $this->user->tenant_id,
            'elevenlabs_voice_id' => 'voice_1',
            'name' => 'Voice One',
            'sample_count' => 1,
            'is_default' => true,
        ]);

        $voice2 = CustomVoiceModel::create([
            'tenant_id' => $this->user->tenant_id,
            'elevenlabs_voice_id' => 'voice_2',
            'name' => 'Voice Two',
            'sample_count' => 1,
            'is_default' => false,
        ]);

        $this->actingAs($this->user)
            ->patch("/settings/voices/{$voice2->id}/default")
            ->assertRedirect('/settings/voices');

        $this->assertFalse($voice1->fresh()->is_default);
        $this->assertTrue($voice2->fresh()->is_default);
    }

    public function test_show_returns_voice_detail(): void
    {
        $voice = CustomVoiceModel::create([
            'tenant_id' => $this->user->tenant_id,
            'elevenlabs_voice_id' => 'voice_show',
            'name' => 'Show Voice',
            'sample_count' => 2,
            'description' => 'A test voice',
            'requires_verification' => true,
        ]);

        $this->actingAs($this->user)
            ->getJson("/settings/voices/{$voice->id}")
            ->assertOk()
            ->assertJson([
                'id' => $voice->id,
                'name' => 'Show Voice',
                'sample_count' => 2,
                'requires_verification' => true,
            ]);
    }

    public function test_show_404_for_other_tenant_voice(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $voice = CustomVoiceModel::create([
            'tenant_id' => $otherTenant->id,
            'elevenlabs_voice_id' => 'voice_other',
            'name' => 'Other Voice',
            'sample_count' => 1,
        ]);

        $this->actingAs($this->user)
            ->getJson("/settings/voices/{$voice->id}")
            ->assertNotFound();
    }
}
