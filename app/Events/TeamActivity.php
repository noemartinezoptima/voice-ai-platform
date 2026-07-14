<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class TeamActivity implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public string $tenantId,
        public string $userName,
        public string $action,
        public string $description,
        public ?string $link = null,
        public ?string $icon = null,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('tenant.'.$this->tenantId.'.activity');
    }

    public function broadcastAs(): string
    {
        return 'team.activity';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return [
            'user_name' => $this->userName,
            'action' => $this->action,
            'description' => $this->description,
            'link' => $this->link,
            'icon' => $this->icon,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
