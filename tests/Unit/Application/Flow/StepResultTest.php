<?php

namespace Tests\Unit\Application\Flow;

use App\Application\Flow\DTOs\StepResult;
use App\Domain\Flow\ValueObjects\StepType;
use PHPUnit\Framework\TestCase;

class StepResultTest extends TestCase
{
    public function test_constructor(): void
    {
        $result = new StepResult(
            stepId: 'step_1',
            type: StepType::Say,
            output: 'Hello world',
            nextStepId: 'step_2',
            metadata: ['text' => 'Hello world'],
        );
        $this->assertEquals('step_1', $result->stepId);
        $this->assertEquals(StepType::Say, $result->type);
        $this->assertEquals('Hello world', $result->output);
        $this->assertEquals('step_2', $result->nextStepId);
        $this->assertEquals(['text' => 'Hello world'], $result->metadata);
    }

    public function test_default_next_step_is_null(): void
    {
        $result = new StepResult(
            stepId: 's1',
            type: StepType::Hangup,
        );
        $this->assertNull($result->nextStepId);
        $this->assertNull($result->output);
        $this->assertEquals([], $result->metadata);
    }
}
