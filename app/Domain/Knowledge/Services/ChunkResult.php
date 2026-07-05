<?php

namespace App\Domain\Knowledge\Services;

class ChunkResult
{
    /** @param array<string, mixed> $metadata */
    public function __construct(
        public readonly string $content,
        public readonly float $similarity,
        public readonly string $documentName,
        public readonly array $metadata = [],
    ) {}
}
