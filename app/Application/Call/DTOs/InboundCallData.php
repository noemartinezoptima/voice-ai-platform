<?php

namespace App\Application\Call\DTOs;

class InboundCallData
{
    public function __construct(
        public readonly string $callSid,
        public readonly string $fromNumber,
        public readonly string $toNumber,
        public readonly ?string $tenantId = null,
        public readonly ?string $flowId = null,
    ) {}

    /** @param array<string, mixed> $payload */
    public static function fromTwilio(array $payload): self
    {
        return new self(
            callSid: $payload['CallSid'] ?? '',
            fromNumber: $payload['From'] ?? '',
            toNumber: $payload['To'] ?? '',
            tenantId: $payload['tenant_id'] ?? null,
            flowId: $payload['flow_id'] ?? null,
        );
    }
}
