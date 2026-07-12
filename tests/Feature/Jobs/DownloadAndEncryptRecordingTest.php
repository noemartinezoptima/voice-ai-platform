<?php

namespace Tests\Feature\Jobs;

use App\Jobs\DownloadAndEncryptRecording;
use App\Services\RecordingEncryptionService;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DownloadAndEncryptRecordingTest extends TestCase
{
    use RefreshDatabase;

    private string $recordingsRoot;

    protected function setUp(): void
    {
        parent::setUp();

        $this->recordingsRoot = sys_get_temp_dir().'/recordings-'.uniqid();
        Config::set('filesystems.disks.recordings.root', $this->recordingsRoot);
        Config::set('recordings.encryption_key', base64_encode(random_bytes(32)));

        Http::preventStrayRequests();
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

    public function test_downloads_and_encrypts_recording(): void
    {
        $tenant = TenantFactory::new()->create([
            'settings' => [
                'twilio_account_sid' => 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'twilio_auth_token' => 'auth_token',
            ],
        ]);
        $call = CallModelFactory::new()->create(['tenant_id' => $tenant->id]);
        $recordingUrl = 'https://api.twilio.com/2010-04-01/Accounts/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/Recordings/RE123.wav';
        $audioContent = 'fake-wav-audio-content';

        Http::fake([
            $recordingUrl => Http::response($audioContent, 200),
        ]);

        $job = new DownloadAndEncryptRecording($call, $recordingUrl);
        $job->handle();

        $call->refresh();

        $this->assertNotNull($call->recording_path);
        $this->assertStringStartsWith($tenant->id.'/', $call->recording_path);
        $this->assertTrue(Storage::disk('recordings')->exists($call->recording_path));

        $encryptedContent = Storage::disk('recordings')->get($call->recording_path);
        $this->assertNotSame($audioContent, $encryptedContent);

        $service = RecordingEncryptionService::make();
        $stream = $service->decryptStream(Storage::disk('recordings')->path($call->recording_path));
        $this->assertSame($audioContent, stream_get_contents($stream));
        fclose($stream);
    }

    public function test_uses_oauth_token_when_available(): void
    {
        $tenant = TenantFactory::new()->create([
            'settings' => [
                'twilio_oauth' => [
                    'access_token' => Crypt::encryptString('oauth_access_token'),
                    'account_sid' => 'ACoauthaccountsid',
                ],
                'twilio_account_sid' => 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'twilio_auth_token' => 'auth_token',
            ],
        ]);
        $call = CallModelFactory::new()->create(['tenant_id' => $tenant->id]);
        $recordingUrl = 'https://api.twilio.com/2010-04-01/Accounts/ACoauthaccountsid/Recordings/RE456.wav';

        Http::fake([
            '*' => function (Request $request) use ($recordingUrl) {
                $this->assertEquals($recordingUrl, $request->url());
                $this->assertEquals('Bearer oauth_access_token', $request->header('Authorization')[0] ?? '');

                return Http::response('oauth-audio-content', 200);
            },
        ]);

        $job = new DownloadAndEncryptRecording($call, $recordingUrl);
        $job->handle();

        $call->refresh();
        $this->assertNotNull($call->recording_path);
    }

    public function test_throws_when_no_credentials_configured(): void
    {
        $tenant = TenantFactory::new()->create(['settings' => []]);
        $call = CallModelFactory::new()->create(['tenant_id' => $tenant->id]);
        $recordingUrl = 'https://api.twilio.com/recording.wav';

        Http::fake();

        $job = new DownloadAndEncryptRecording($call, $recordingUrl);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('No Twilio credentials configured');

        $job->handle();
    }
}
