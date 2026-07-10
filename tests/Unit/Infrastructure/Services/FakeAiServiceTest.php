<?php

namespace Tests\Unit\Infrastructure\Services;

use App\Infrastructure\Services\FakeAiService;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FakeAiServiceTest extends TestCase
{
    #[Test]
    public function returns_default_response(): void
    {
        $service = new FakeAiService;

        $result = $service->chat([['role' => 'user', 'content' => 'Hi']]);

        $this->assertSame('This is a fake AI response.', $result);
    }

    #[Test]
    public function returns_custom_response(): void
    {
        $service = new FakeAiService('Custom response text');

        $result = $service->chat([]);

        $this->assertSame('Custom response text', $result);
    }

    #[Test]
    public function chat_respects_temperature_and_max_tokens(): void
    {
        $service = new FakeAiService;

        $result = $service->chat([], temperature: 0.5, maxTokens: 128);

        $this->assertIsString($result);
    }
}
