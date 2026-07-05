<?php

namespace App\Domain\Knowledge\Services;

interface DocumentProcessorInterface
{
    public function supports(string $mimeType): bool;

    public function extractText(string $path): string;
}
