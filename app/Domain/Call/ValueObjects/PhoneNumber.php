<?php

namespace App\Domain\Call\ValueObjects;

use InvalidArgumentException;

class PhoneNumber
{
    public function __construct(private string $value)
    {
        $cleaned = preg_replace('/[^+\d]/', '', $value);

        if (! preg_match('/^\+[1-9]\d{6,14}$/', $cleaned)) {
            throw new InvalidArgumentException("Invalid phone number format: {$value}");
        }

        $this->value = $cleaned;
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
