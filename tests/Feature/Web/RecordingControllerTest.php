<?php

namespace Tests\Feature\Web;

use App\Models\User;
use App\Services\RecordingEncryptionService;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RecordingControllerTest extends TestCase
{
    use RefreshDatabase;

    private string $recordingsRoot;

    protected function setUp(): void
    {
        parent::setUp();

        $this->recordingsRoot = sys_get_temp_dir().'/recordings-'.uniqid();
        Config::set('filesystems.disks.recordings.root', $this->recordingsRoot);
        Config::set('recordings.encryption_key', base64_encode(random_bytes(32)));
    }

    protected function tearDown(): void
    {
        if (is_dir($this->recordingsRoot)) {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($this->recordingsRoot, \RecursiveDirectoryIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::CHILD_FIRST
            );

            foreach ($iterator as $file) {
                $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname());
            }

            rmdir($this->recordingsRoot);
        }

        parent::tearDown();
    }

    public function test_streams_decrypted_recording(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $call = CallModelFactory::new()->create(['tenant_id' => $tenant->id]);

        $audioContent = 'fake-wav-audio-content';
        $source = tempnam(sys_get_temp_dir(), 'recording_source_');
        file_put_contents($source, $audioContent);

        $service = RecordingEncryptionService::make();
        $recordingPath = $tenant->id.'/'.$call->id.'.enc';
        Storage::disk('recordings')->makeDirectory($tenant->id);
        $service->encryptFile($source, Storage::disk('recordings')->path($recordingPath));

        $call->recording_path = $recordingPath;
        $call->save();

        $response = $this->actingAs($user)->get("/recordings/{$call->id}/play");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'audio/wav');

        ob_start();
        $response->sendContent();
        $content = ob_get_clean();

        $this->assertSame($audioContent, $content);

        unlink($source);
    }

    public function test_returns_404_when_no_recording_path(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $call = CallModelFactory::new()->create(['tenant_id' => $tenant->id, 'recording_path' => null]);

        $this->actingAs($user)->get("/recordings/{$call->id}/play")
            ->assertNotFound();
    }

    public function test_returns_404_for_other_tenant(): void
    {
        $tenant = TenantFactory::new()->create();
        $otherTenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $call = CallModelFactory::new()->create(['tenant_id' => $otherTenant->id, 'recording_path' => 'some/path.enc']);

        $this->actingAs($user)->get("/recordings/{$call->id}/play")
            ->assertNotFound();
    }

    public function test_requires_authentication(): void
    {
        $tenant = TenantFactory::new()->create();
        $call = CallModelFactory::new()->create(['tenant_id' => $tenant->id, 'recording_path' => 'some/path.enc']);

        $this->get("/recordings/{$call->id}/play")
            ->assertRedirect('/login');
    }
}
