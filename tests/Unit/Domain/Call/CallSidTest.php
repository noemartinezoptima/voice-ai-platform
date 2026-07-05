<?php

namespace Tests\Unit\Domain\Call;

use App\Domain\Call\ValueObjects\CallSid;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class CallSidTest extends TestCase
{
    public function test_accepts_valid_call_sid(): void
    {
        $sid = new CallSid('CA'.str_repeat('a', 32));

        $this->assertEquals('CA'.str_repeat('a', 32), $sid->value());
    }

    public function test_rejects_too_short_sid(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new CallSid('CAabc');
    }

    public function test_rejects_wrong_prefix(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new CallSid('XX'.str_repeat('a', 32));
    }

    public function test_accepts_mixed_case_hex(): void
    {
        $sid = new CallSid('CA'.str_repeat('A', 32));

        $this->assertStringStartsWith('CA', $sid->value());
    }

    public function test_string_cast(): void
    {
        $sid = new CallSid('CA'.str_repeat('a', 32));

        $this->assertEquals('CA'.str_repeat('a', 32), (string) $sid);
    }

    public function test_rejects_empty(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new CallSid('');
    }

    public function test_accepts_call_sid_with_numbers(): void
    {
        $sid = new CallSid('CA'.'a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5');

        $this->assertEquals('CA'.'a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5', $sid->value());
    }
}
