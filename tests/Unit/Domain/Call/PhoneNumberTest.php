<?php

namespace Tests\Unit\Domain\Call;

use App\Domain\Call\ValueObjects\PhoneNumber;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class PhoneNumberTest extends TestCase
{
    public function test_accepts_valid_e164(): void
    {
        $phone = new PhoneNumber('+12345678901');

        $this->assertEquals('+12345678901', $phone->value());
    }

    public function test_strips_non_digit_chars(): void
    {
        $phone = new PhoneNumber('+1 (234) 567-8901');

        $this->assertEquals('+12345678901', $phone->value());
    }

    public function test_rejects_no_plus(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new PhoneNumber('12345678901');
    }

    public function test_rejects_too_short(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new PhoneNumber('+123');
    }

    public function test_rejects_too_long(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new PhoneNumber('+'.str_repeat('1', 16));
    }

    public function test_rejects_zero_after_plus(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new PhoneNumber('+012345678901');
    }

    public function test_string_cast(): void
    {
        $phone = new PhoneNumber('+12345678901');

        $this->assertEquals('+12345678901', (string) $phone);
    }

    public function test_accepts_max_length(): void
    {
        $phone = new PhoneNumber('+123456789012345');

        $this->assertEquals(16, strlen($phone->value()));
    }

    public function test_rejects_empty(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new PhoneNumber('');
    }
}
