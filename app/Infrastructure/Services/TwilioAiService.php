<?php

namespace App\Infrastructure\Services;

use App\Domain\Flow\Services\AiServiceInterface;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class TwilioAiService implements AiServiceInterface
{
    public function __construct(
        private readonly string $accountSid,
        private readonly string $authToken,
        private readonly string $assistantSid,
    ) {}

    public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string
    {
        $body = collect($messages)
            ->map(fn (array $m) => match ($m['role']) {
                'system' => 'System: '.($m['content'] ?? ''),
                'user' => 'User: '.($m['content'] ?? ''),
                'assistant' => 'Assistant: '.($m['content'] ?? ''),
                default => $m['content'] ?? '',
            })
            ->implode("\n\n");

        $response = Http::withBasicAuth($this->accountSid, $this->authToken)
            ->timeout(30)
            ->post("https://assistants.twilio.com/v1/Assistants/{$this->assistantSid}/Messages", [
                'identity' => 'flow-executor',
                'body' => $body,
                'mode' => 'chat',
            ])
            ->throw()
            ->json();

        if (($response['aborted'] ?? false) || ($response['status'] ?? '') === 'failed') {
            throw new RuntimeException(
                $response['error'] ?? 'Twilio AI Assistant request failed',
            );
        }

        return $response['body'] ?? '';
    }
}
