<?php

namespace App\Domain\Call\Events;

use App\Domain\Call\Entities\Call;

class CallStarted
{
    public function __construct(
        public readonly Call $call,
    ) {}
}
