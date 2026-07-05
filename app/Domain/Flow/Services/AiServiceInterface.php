<?php

namespace App\Domain\Flow\Services;

interface AiServiceInterface
{
    /** @param array<int, array<string, string>> $messages */
    public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string;
}
