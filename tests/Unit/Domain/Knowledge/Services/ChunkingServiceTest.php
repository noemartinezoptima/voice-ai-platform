<?php

namespace Tests\Unit\Domain\Knowledge\Services;

use App\Domain\Knowledge\Services\ChunkingService;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ChunkingServiceTest extends TestCase
{
    private ChunkingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ChunkingService;
    }

    #[Test]
    public function returns_empty_array_for_empty_text(): void
    {
        $this->assertSame([], $this->service->chunk(''));
        $this->assertSame([], $this->service->chunk('   '));
    }

    #[Test]
    public function returns_single_chunk_for_short_text(): void
    {
        $text = 'Hello world. This is a short text.';

        $chunks = $this->service->chunk($text);

        $this->assertCount(1, $chunks);
        $this->assertSame($text, $chunks[0]);
    }

    #[Test]
    public function splits_long_text_into_multiple_chunks(): void
    {
        $paragraph = "This is a test paragraph with enough content to demonstrate chunking behavior.\n\n";
        $text = str_repeat($paragraph, 100);

        $chunks = $this->service->chunk($text);

        $this->assertGreaterThan(1, count($chunks));
    }

    #[Test]
    public function preserves_paragraph_boundaries(): void
    {
        $text = "First paragraph about voice AI technology.\n\nSecond paragraph about call routing.\n\nThird paragraph about transcription.";

        $chunks = $this->service->chunk($text);

        $combined = implode(' ', $chunks);
        $this->assertStringContainsString('First paragraph', $combined);
        $this->assertStringContainsString('Second paragraph', $combined);
        $this->assertStringContainsString('Third paragraph', $combined);
    }

    #[Test]
    public function each_chunk_has_reasonable_size(): void
    {
        $paragraph = "This is a test paragraph designed to verify chunk sizing behavior.\n\n";
        $text = str_repeat($paragraph, 200);

        $chunks = $this->service->chunk($text);

        foreach ($chunks as $chunk) {
            $this->assertLessThan(3000, strlen($chunk));
        }
    }

    #[Test]
    public function trims_whitespace_from_chunks(): void
    {
        $text = "  Paragraph one.\n\n  Paragraph two.  ";

        $chunks = $this->service->chunk($text);

        foreach ($chunks as $chunk) {
            $this->assertSame($chunk, trim($chunk));
        }
    }
}
