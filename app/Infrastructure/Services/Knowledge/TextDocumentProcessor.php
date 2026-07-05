<?php

namespace App\Infrastructure\Services\Knowledge;

use App\Domain\Knowledge\Services\DocumentProcessorInterface;

class TextDocumentProcessor implements DocumentProcessorInterface
{
    public function supports(string $mimeType): bool
    {
        return in_array($mimeType, [
            'text/plain', 'text/markdown', 'text/csv',
            'application/json', 'application/xml', 'text/html',
        ]);
    }

    public function extractText(string $path): string
    {
        return file_get_contents($path);
    }
}
