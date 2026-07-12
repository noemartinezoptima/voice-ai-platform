<?php

namespace App\Services;

use Illuminate\Encryption\Encrypter;
use InvalidArgumentException;

class RecordingEncryptionService
{
    private Encrypter $encrypter;

    public function __construct(string $key)
    {
        $decoded = base64_decode($key, true);

        if ($decoded === false || strlen($decoded) !== 32) {
            throw new InvalidArgumentException('Recordings encryption key must be a base64-encoded 32-byte string.');
        }

        $this->encrypter = new Encrypter($decoded, 'AES-256-GCM');
    }

    public function encryptFile(string $sourcePath, string $destinationPath): void
    {
        $content = file_get_contents($sourcePath);

        if ($content === false) {
            throw new \RuntimeException("Failed to read source file: {$sourcePath}");
        }

        $encrypted = $this->encrypter->encrypt($content);

        if (file_put_contents($destinationPath, $encrypted) === false) {
            throw new \RuntimeException("Failed to write encrypted file: {$destinationPath}");
        }
    }

    public function decryptFile(string $sourcePath, string $destinationPath): void
    {
        $content = file_get_contents($sourcePath);

        if ($content === false) {
            throw new \RuntimeException("Failed to read encrypted file: {$sourcePath}");
        }

        $decrypted = $this->encrypter->decrypt($content);

        if (file_put_contents($destinationPath, $decrypted) === false) {
            throw new \RuntimeException("Failed to write decrypted file: {$destinationPath}");
        }
    }

    /**
     * @return resource
     */
    public function decryptStream(string $sourcePath)
    {
        $content = file_get_contents($sourcePath);

        if ($content === false) {
            throw new \RuntimeException("Failed to read encrypted file: {$sourcePath}");
        }

        $decrypted = $this->encrypter->decrypt($content);
        $stream = fopen('php://temp', 'r+');

        if ($stream === false) {
            throw new \RuntimeException('Failed to open temporary stream for decrypted content.');
        }

        fwrite($stream, $decrypted);
        rewind($stream);

        return $stream;
    }

    public static function make(): self
    {
        $key = config('recordings.encryption_key');

        if (empty($key)) {
            throw new InvalidArgumentException('Recordings encryption key is not configured.');
        }

        return new self($key);
    }
}
