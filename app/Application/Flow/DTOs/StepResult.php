<?php

namespace App\Application\Flow\DTOs;

use App\Domain\Flow\ValueObjects\StepType;

class StepResult
{
    /** @param array<string, mixed> $metadata */
    public function __construct(
        public readonly string $stepId,
        public readonly StepType $type,
        public readonly mixed $output = null,
        public readonly ?string $nextStepId = null,
        public readonly array $metadata = [],
    ) {}
}
