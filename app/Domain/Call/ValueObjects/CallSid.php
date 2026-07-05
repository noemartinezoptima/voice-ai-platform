<?php

namespace App\Domain\Call\ValueObjects;

use InvalidArgumentException;

class CallSid
{
    public function __construct(private readonly string $value)
    {
        if (! preg_match('/^CA[a-f0-9]{32}$/i', $value)) {
            throw new InvalidArgumentException("Invalid CallSid format: {$value}");
        }
    }

    public function value(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
