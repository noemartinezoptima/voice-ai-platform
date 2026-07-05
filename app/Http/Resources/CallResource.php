<?php

namespace App\Http\Resources;

use App\Domain\Call\Entities\Call;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Call */
class CallResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getId(),
            'tenant_id' => $this->getTenantId(),
            'flow_id' => $this->getFlowId(),
            'call_sid' => $this->getCallSid()->value(),
            'from_number' => $this->getFromNumber()->value(),
            'to_number' => $this->getToNumber()->value(),
            'status' => $this->getStatus(),
            'duration_seconds' => $this->getDurationSeconds(),
            'current_step' => $this->getCurrentStep(),
            'context' => $this->getContext(),
            'started_at' => $this->getStartedAt()?->format(\DateTimeInterface::ATOM),
            'ended_at' => $this->getEndedAt()?->format(\DateTimeInterface::ATOM),
            'created_at' => $this->created_at ?? null,
        ];
    }
}
