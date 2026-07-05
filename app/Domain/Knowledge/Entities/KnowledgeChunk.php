<?php

namespace App\Domain\Knowledge\Entities;

class KnowledgeChunk
{
    /** @param array<string, mixed> $metadata */
    public function __construct(
        private readonly string $id,
        private string $documentId,
        private string $tenantId,
        private int $chunkIndex,
        private string $content,
        /** @var float[]|null */
        private ?array $embedding = null,
        private array $metadata = [],
    ) {}

    public function id(): string
    {
        return $this->id;
    }

    public function documentId(): string
    {
        return $this->documentId;
    }

    public function tenantId(): string
    {
        return $this->tenantId;
    }

    public function chunkIndex(): int
    {
        return $this->chunkIndex;
    }

    public function content(): string
    {
        return $this->content;
    }

    /** @return float[]|null */
    public function embedding(): ?array
    {
        return $this->embedding;
    }

    /** @param float[] $embedding */
    public function setEmbedding(array $embedding): void
    {
        $this->embedding = $embedding;
    }

    /** @return array<string, mixed> */
    public function metadata(): array
    {
        return $this->metadata;
    }

    /** @param array<string, mixed> $metadata */
    public function setMetadata(array $metadata): void
    {
        $this->metadata = $metadata;
    }
}
