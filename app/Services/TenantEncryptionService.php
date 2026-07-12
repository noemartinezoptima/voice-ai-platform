<?php

namespace App\Services;

use Illuminate\Encryption\Encrypter;

class TenantEncryptionService
{
    public function generateKey(): string
    {
        return base64_encode(random_bytes(32));
    }

    public function encrypter(?string $key): ?Encrypter
    {
        if ($key === null || $key === '') {
            return null;
        }

        return new Encrypter(base64_decode($key), 'AES-256-CBC');
    }

    public function encrypt(string $value, ?string $key): ?string
    {
        $encrypter = $this->encrypter($key);

        return $encrypter?->encryptString($value);
    }

    public function decrypt(?string $value, ?string $key): ?string
    {
        if ($value === null || $key === null) {
            return null;
        }

        $encrypter = $this->encrypter($key);

        return $encrypter?->decryptString($value);
    }

    public function rotateKey(string $oldKey): string
    {
        return $this->generateKey();
    }
}
