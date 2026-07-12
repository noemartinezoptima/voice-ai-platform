<?php

namespace App\Domain\Voice\Entities;

class CustomVoice
{
    /** @param array<string, mixed>|null $labels */
    public function __construct(
        private readonly string $id,
        private readonly string $tenantId,
        private string $elevenlabsVoiceId,
        private string $name,
        private ?string $previewUrl,
        private int $sampleCount,
        private ?string $description,
        private ?array $labels,
        private bool $isDefault,
        private bool $requiresVerification,
        private \DateTimeImmutable $createdAt,
        private \DateTimeImmutable $updatedAt,
    ) {}

    public function getId(): string
    {
        return $this->id;
    }

    public function id(): string
    {
        return $this->id;
    }

    public function getTenantId(): string
    {
        return $this->tenantId;
    }

    public function tenantId(): string
    {
        return $this->tenantId;
    }

    public function getElevenlabsVoiceId(): string
    {
        return $this->elevenlabsVoiceId;
    }

    public function elevenlabsVoiceId(): string
    {
        return $this->elevenlabsVoiceId;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function getPreviewUrl(): ?string
    {
        return $this->previewUrl;
    }

    public function previewUrl(): ?string
    {
        return $this->previewUrl;
    }

    public function getSampleCount(): int
    {
        return $this->sampleCount;
    }

    public function sampleCount(): int
    {
        return $this->sampleCount;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function description(): ?string
    {
        return $this->description;
    }

    /** @return array<string, mixed>|null */
    public function getLabels(): ?array
    {
        return $this->labels;
    }

    /** @return array<string, mixed>|null */
    public function labels(): ?array
    {
        return $this->labels;
    }

    public function isDefault(): bool
    {
        return $this->isDefault;
    }

    public function requiresVerification(): bool
    {
        return $this->requiresVerification;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function createdAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function updatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
