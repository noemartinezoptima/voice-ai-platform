<?php

namespace App\Domain\Call\Entities;

use App\Domain\Call\ValueObjects\CallSid;
use App\Domain\Call\ValueObjects\PhoneNumber;

class Call
{
    /** @param array<string, mixed> $context */
    public function __construct(
        private readonly string $id,
        private string $tenantId,
        private ?string $flowId,
        private CallSid $callSid,
        private PhoneNumber $fromNumber,
        private PhoneNumber $toNumber,
        private string $status = 'initiated',
        private int $durationSeconds = 0,
        private ?string $currentStep = null,
        private array $context = [],
        private ?string $error = null,
        private ?\DateTimeImmutable $startedAt = null,
        private ?\DateTimeImmutable $endedAt = null,
        private ?string $recordingSid = null,
        private ?string $recordingUrl = null,
        private ?string $notes = null,
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

    public function getFlowId(): ?string
    {
        return $this->flowId;
    }

    public function flowId(): ?string
    {
        return $this->flowId;
    }

    public function setFlowId(?string $flowId): void
    {
        $this->flowId = $flowId;
    }

    public function getCallSid(): CallSid
    {
        return $this->callSid;
    }

    public function callSid(): CallSid
    {
        return $this->callSid;
    }

    public function getFromNumber(): PhoneNumber
    {
        return $this->fromNumber;
    }

    public function fromNumber(): PhoneNumber
    {
        return $this->fromNumber;
    }

    public function getToNumber(): PhoneNumber
    {
        return $this->toNumber;
    }

    public function toNumber(): PhoneNumber
    {
        return $this->toNumber;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function status(): string
    {
        return $this->status;
    }

    public function markInProgress(): void
    {
        $this->status = 'in_progress';
    }

    public function markCompleted(): void
    {
        $this->status = 'completed';
    }

    public function markFailed(?string $error = null): void
    {
        $this->status = 'failed';
        if ($error) {
            $this->context['error'] = $error;
        }
    }

    public function markTransferred(): void
    {
        $this->status = 'transferred';
    }

    public function getDurationSeconds(): int
    {
        return $this->durationSeconds;
    }

    public function setDurationSeconds(int $seconds): void
    {
        $this->durationSeconds = $seconds;
    }

    public function getCurrentStep(): ?string
    {
        return $this->currentStep;
    }

    public function currentStep(): ?string
    {
        return $this->currentStep;
    }

    public function setCurrentStep(?string $stepId): void
    {
        $this->currentStep = $stepId;
    }

    /** @return array<string, mixed> */
    public function getContext(): array
    {
        return $this->context;
    }

    /** @return array<string, mixed> */
    public function context(): array
    {
        return $this->context;
    }

    /** @param array<string, mixed> $context */
    public function setContext(array $context): void
    {
        $this->context = $context;
    }

    /** @param array<string, mixed> $data */
    public function updateContext(array $data): void
    {
        $this->context = array_merge($this->context, $data);
    }

    public function getError(): ?string
    {
        return $this->error;
    }

    public function getStartedAt(): ?\DateTimeImmutable
    {
        return $this->startedAt;
    }

    public function getEndedAt(): ?\DateTimeImmutable
    {
        return $this->endedAt;
    }

    public function getRecordingSid(): ?string
    {
        return $this->recordingSid;
    }

    public function setRecordingSid(?string $recordingSid): void
    {
        $this->recordingSid = $recordingSid;
    }

    public function getRecordingUrl(): ?string
    {
        return $this->recordingUrl;
    }

    public function setRecordingUrl(?string $recordingUrl): void
    {
        $this->recordingUrl = $recordingUrl;
    }

    public function notes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): void
    {
        $this->notes = $notes;
    }
}
