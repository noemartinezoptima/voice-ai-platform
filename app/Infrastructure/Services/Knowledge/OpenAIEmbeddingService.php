<?php

namespace App\Infrastructure\Services\Knowledge;

use App\Domain\Knowledge\Services\EmbeddingServiceInterface;
use Illuminate\Support\Facades\Http;

class OpenAIEmbeddingService implements EmbeddingServiceInterface
{
    private const MODEL = 'text-embedding-3-small';

    private const DIMENSIONS = 1536;

    private const BATCH_SIZE = 20;

    public function __construct(
        private readonly string $apiKey,
    ) {}

    /** @return array<int, float[]> */
    public function embedMany(array $texts): array
    {
        $embeddings = [];

        foreach (array_chunk($texts, self::BATCH_SIZE) as $batch) {
            $response = Http::withToken($this->apiKey)
                ->post('https://api.openai.com/v1/embeddings', [
                    'model' => self::MODEL,
                    'input' => $batch,
                    'dimensions' => self::DIMENSIONS,
                ])
                ->throw()
                ->json();

            foreach ($response['data'] as $item) {
                $embeddings[] = $item['embedding'];
            }
        }

        return $embeddings;
    }

    public function embed(string $text): array
    {
        return $this->embedMany([$text])[0] ?? [];
    }
}
