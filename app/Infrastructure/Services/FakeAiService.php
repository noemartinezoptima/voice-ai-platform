<?php

namespace App\Infrastructure\Services;

use App\Domain\Flow\Services\AiServiceInterface;

class FakeAiService implements AiServiceInterface
{
    public function __construct(
        private readonly string $response = 'This is a fake AI response.',
    ) {}

    public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string
    {
        return $this->response;
    }
}
