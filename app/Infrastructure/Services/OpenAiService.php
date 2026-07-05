<?php

namespace App\Infrastructure\Services;

use App\Domain\Flow\Services\AiServiceInterface;
use Illuminate\Support\Facades\Http;

class OpenAiService implements AiServiceInterface
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model = 'gpt-4o',
    ) {}

    public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string
    {
        $response = Http::withToken($this->apiKey)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $this->model,
                'messages' => $messages,
                'temperature' => $temperature,
                'max_tokens' => $maxTokens,
            ])
            ->throw()
            ->json();

        return $response['choices'][0]['message']['content'] ?? '';
    }
}
