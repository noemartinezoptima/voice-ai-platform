<?php

namespace App\Domain\Tenant\Entities;

class Tenant
{
    /** @param array<string, mixed> $settings */
    public function __construct(
        private readonly string $id,
        private string $name,
        private string $slug,
        private array $settings = [],
        private bool $isActive = true,
    ) {}

    public function getId(): string
    {
        return $this->id;
    }

    public function id(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function slug(): string
    {
        return $this->slug;
    }

    /** @return array<string, mixed> */
    public function getSettings(): array
    {
        return $this->settings;
    }

    /** @return array<string, mixed> */
    public function settings(): array
    {
        return $this->settings;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    /** @param array<string, mixed> $settings */
    public function updateSettings(array $settings): void
    {
        $this->settings = $settings;
    }
}
