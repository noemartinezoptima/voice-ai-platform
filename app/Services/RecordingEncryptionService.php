<?php

namespace App\Services;

use Illuminate\Encryption\Encrypter;

class RecordingEncryptionService
{
    private Encrypter $encrypter;

    public function __construct(?string $key = null)
    {
        $key = $key ?? config('app.recordings_encryption_key');

        $this->encrypter = new Encrypter(base64_decode($key), 'AES-256-GCM');
    }

    public function encrypt(string $content): string
    {
        return $this->encrypter->encrypt($content);
    }

    public function decrypt(string $encryptedContent): string
    {
        return $this->encrypter->decrypt($encryptedContent);
    }
}
