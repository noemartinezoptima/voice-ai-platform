<?php

namespace App\Domain\Flow\ValueObjects;

use InvalidArgumentException;

class FlowConfig
{
    /** @param array<mixed> $steps */
    private function __construct(
        private readonly string $startStep,
        private readonly array $steps,
    ) {
        if (empty($steps)) {
            throw new InvalidArgumentException('Flow must have at least one step');
        }

        if (! isset($steps[$startStep])) {
            throw new InvalidArgumentException("Start step '{$startStep}' not found in steps");
        }
    }

    /** @param array<string, mixed> $data */
    public static function fromArray(array $data): self
    {
        return new self(
            startStep: $data['start_step'] ?? throw new InvalidArgumentException('Missing start_step'),
            steps: $data['steps'] ?? throw new InvalidArgumentException('Missing steps'),
        );
    }

    public function startStep(): string
    {
        return $this->startStep;
    }

    /** @return array<mixed> */
    public function steps(): array
    {
        return $this->steps;
    }

    /** @return array<mixed>|null */
    public function getStep(string $id): ?array
    {
        return $this->steps[$id] ?? null;
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'start_step' => $this->startStep,
            'steps' => $this->steps,
        ];
    }
}
