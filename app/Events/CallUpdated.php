<?php

namespace App\Events;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallUpdated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly CallModel $call,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('tenant.'.$this->call->tenant_id.'.calls');
    }

    public function broadcastAs(): string
    {
        return 'call.updated';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        $flowName = $this->call->relationLoaded('flow')
            ? $this->call->flow?->name
            : FlowModel::find($this->call->flow_id)?->name;

        return [
            'id' => $this->call->id,
            'status' => $this->call->status,
            'from_number' => $this->call->from_number,
            'to_number' => $this->call->to_number,
            'flow_name' => $flowName,
            'started_at' => $this->call->started_at?->toIso8601String(),
            'duration_seconds' => $this->call->duration_seconds,
            'call_sid' => $this->call->call_sid,
        ];
    }
}
