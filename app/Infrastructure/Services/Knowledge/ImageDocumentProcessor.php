<?php

namespace App\Infrastructure\Services\Knowledge;

use App\Domain\Knowledge\Services\DocumentProcessorInterface;
use Illuminate\Support\Facades\Http;

class ImageDocumentProcessor implements DocumentProcessorInterface
{
    public function __construct(
        private readonly string $openAiApiKey,
    ) {}

    public function supports(string $mimeType): bool
    {
        return str_starts_with($mimeType, 'image/');
    }

    public function extractText(string $path): string
    {
        $imageData = base64_encode(file_get_contents($path));
        $mimeType = mime_content_type($path) ?: 'image/png';

        $response = Http::withToken($this->openAiApiKey)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => 'Extract all text from this image. Return only the extracted text, no explanations.'],
                            ['type' => 'image_url', 'image_url' => ['url' => "data:{$mimeType};base64,{$imageData}"]],
                        ],
                    ],
                ],
                'max_tokens' => 4096,
            ])
            ->throw()
            ->json();

        return $response['choices'][0]['message']['content'] ?? '';
    }
}
