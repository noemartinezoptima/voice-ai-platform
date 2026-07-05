<?php

namespace App\Domain\Knowledge\Services;

interface EmbeddingServiceInterface
{
    /**
     * @param  string[]  $texts
     * @return array<int, float[]>
     */
    public function embedMany(array $texts): array;

    /** @return float[] */
    public function embed(string $text): array;
}
