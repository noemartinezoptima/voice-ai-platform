<?php

namespace Tests\Unit\Services;

use App\Services\RecordingEncryptionService;
use PHPUnit\Framework\TestCase;

class RecordingEncryptionServiceTest extends TestCase
{
    private RecordingEncryptionService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $key = base64_encode(random_bytes(32));
        $this->service = new RecordingEncryptionService($key);
    }

    public function test_encrypt_then_decrypt_returns_original(): void
    {
        $original = 'Hello, this is a recording content.';

        $encrypted = $this->service->encrypt($original);
        $decrypted = $this->service->decrypt($encrypted);

        $this->assertSame($original, $decrypted);
    }

    public function test_encrypted_output_differs_each_time(): void
    {
        $content = 'Same content encrypted twice.';

        $encrypted1 = $this->service->encrypt($content);
        $encrypted2 = $this->service->encrypt($content);

        $this->assertNotSame($encrypted1, $encrypted2);
    }
}
