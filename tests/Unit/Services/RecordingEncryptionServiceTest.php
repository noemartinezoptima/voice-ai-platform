<?php

namespace Tests\Unit\Services;

use App\Services\RecordingEncryptionService;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class RecordingEncryptionServiceTest extends TestCase
{
    private RecordingEncryptionService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new RecordingEncryptionService(base64_encode(random_bytes(32)));
    }

    public function test_encrypt_file_then_decrypt_file_returns_original(): void
    {
        $source = tempnam(sys_get_temp_dir(), 'recording_source_');
        $destination = tempnam(sys_get_temp_dir(), 'recording_enc_');
        $decrypted = tempnam(sys_get_temp_dir(), 'recording_dec_');

        file_put_contents($source, 'Hello, this is a recording content.');

        $this->service->encryptFile($source, $destination);
        $this->service->decryptFile($destination, $decrypted);

        $this->assertSame('Hello, this is a recording content.', file_get_contents($decrypted));

        unlink($source);
        unlink($destination);
        unlink($decrypted);
    }

    public function test_encrypted_file_differs_each_time(): void
    {
        $source = tempnam(sys_get_temp_dir(), 'recording_source_');
        $destination1 = tempnam(sys_get_temp_dir(), 'recording_enc_');
        $destination2 = tempnam(sys_get_temp_dir(), 'recording_enc_');

        file_put_contents($source, 'Same content encrypted twice.');

        $this->service->encryptFile($source, $destination1);
        $this->service->encryptFile($source, $destination2);

        $this->assertNotSame(file_get_contents($destination1), file_get_contents($destination2));

        unlink($source);
        unlink($destination1);
        unlink($destination2);
    }

    public function test_decrypt_stream_returns_original(): void
    {
        $source = tempnam(sys_get_temp_dir(), 'recording_source_');
        $destination = tempnam(sys_get_temp_dir(), 'recording_enc_');

        file_put_contents($source, 'Streamed recording content.');

        $this->service->encryptFile($source, $destination);

        $stream = $this->service->decryptStream($destination);

        $this->assertIsResource($stream);
        $this->assertSame('Streamed recording content.', stream_get_contents($stream));

        fclose($stream);
        unlink($source);
        unlink($destination);
    }

    public function test_make_reads_key_from_config(): void
    {
        $key = base64_encode(random_bytes(32));
        Config::set('recordings.encryption_key', $key);

        $service = RecordingEncryptionService::make();

        $this->assertInstanceOf(RecordingEncryptionService::class, $service);
    }

    public function test_make_throws_when_key_is_missing(): void
    {
        Config::set('recordings.encryption_key', null);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Recordings encryption key is not configured');

        RecordingEncryptionService::make();
    }

    public function test_make_throws_when_key_is_invalid(): void
    {
        Config::set('recordings.encryption_key', 'not-valid-base64');

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Recordings encryption key must be a base64-encoded 32-byte string');

        RecordingEncryptionService::make();
    }
}
