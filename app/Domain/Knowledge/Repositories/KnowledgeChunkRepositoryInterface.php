<?php

namespace App\Domain\Knowledge\Repositories;

use App\Domain\Knowledge\Entities\KnowledgeChunk;

interface KnowledgeChunkRepositoryInterface
{
    /** @return KnowledgeChunk[] */
    public function findByDocument(string $documentId): array;

    /** @return KnowledgeChunk[] */
    public function findByTenant(string $tenantId): array;

    public function save(KnowledgeChunk $chunk): void;

    /** @param KnowledgeChunk[] $chunks */
    public function saveMany(array $chunks): void;

    public function deleteByDocument(string $documentId): void;
}
