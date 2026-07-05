<?php

namespace App\Domain\Knowledge\Entities;

use App\Domain\Knowledge\ValueObjects\DocumentStatus;
use App\Domain\Knowledge\ValueObjects\ResourceType;

class Document
{
    /** @param array<string, mixed> $metadata */
    public function __construct(
        private readonly string $id,
        private string $tenantId,
        private string $name,
        private ResourceType $resourceType,
        private string $mimeType,
        private string $path,
        private DocumentStatus $status = DocumentStatus::Pending,
        private ?string $error = null,
        private array $metadata = [],
    ) {}

    public function id(): string
    {
        return $this->id;
    }

    public function tenantId(): string
    {
        return $this->tenantId;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function resourceType(): ResourceType
    {
        return $this->resourceType;
    }

    public function mimeType(): string
    {
        return $this->mimeType;
    }

    public function path(): string
    {
        return $this->path;
    }

    public function status(): DocumentStatus
    {
        return $this->status;
    }

    public function error(): ?string
    {
        return $this->error;
    }

    /** @return array<string, mixed> */
    public function metadata(): array
    {
        return $this->metadata;
    }

    public function markProcessing(): void
    {
        $this->status = DocumentStatus::Processing;
    }

    public function markReady(): void
    {
        $this->status = DocumentStatus::Ready;
    }

    public function markFailed(string $error): void
    {
        $this->status = DocumentStatus::Failed;
        $this->error = $error;
    }

    /** @param array<string, mixed> $metadata */
    public function updateMetadata(array $metadata): void
    {
        $this->metadata = array_merge($this->metadata, $metadata);
    }
}
