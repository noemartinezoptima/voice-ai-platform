<?php

namespace App\Services;

class WebhookSigner
{
    public function sign(string $payload, string $secret): string
    {
        return hash_hmac('sha256', $payload, $secret);
    }

    public function verify(string $payload, string $signature, string $secret): bool
    {
        return hash_equals($this->sign($payload, $secret), $signature);
    }

    /** @return array<string, string> */
    public function signatureHeader(string $payload, string $secret): array
    {
        $timestamp = (string) time();
        $signature = $this->sign("{$timestamp}.{$payload}", $secret);

        return [
            'X-Signature-256' => $signature,
            'X-Signature-Timestamp' => $timestamp,
        ];
    }
}
