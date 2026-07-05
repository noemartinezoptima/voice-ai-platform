<?php

namespace App\Domain\Knowledge\Services;

class RetrievalResult
{
    /** @param ChunkResult[] $chunks */
    public function __construct(
        public readonly array $chunks,
        public readonly string $contextText,
        public readonly RetrievalType $type,
    ) {}
}
