<?php

namespace Tests\Unit\Infrastructure\Services\Knowledge;

use App\Infrastructure\Services\Knowledge\TextDocumentProcessor;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TextDocumentProcessorTest extends TestCase
{
    private TextDocumentProcessor $processor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->processor = new TextDocumentProcessor;
    }

    #[Test]
    public function supports_text_plain(): void
    {
        $this->assertTrue($this->processor->supports('text/plain'));
    }

    #[Test]
    public function supports_text_markdown(): void
    {
        $this->assertTrue($this->processor->supports('text/markdown'));
    }

    #[Test]
    public function supports_text_csv(): void
    {
        $this->assertTrue($this->processor->supports('text/csv'));
    }

    #[Test]
    public function supports_application_json(): void
    {
        $this->assertTrue($this->processor->supports('application/json'));
    }

    #[Test]
    public function supports_text_html(): void
    {
        $this->assertTrue($this->processor->supports('text/html'));
    }

    #[Test]
    public function does_not_support_pdf(): void
    {
        $this->assertFalse($this->processor->supports('application/pdf'));
    }

    #[Test]
    public function extracts_text_from_file(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'txt_test_');
        file_put_contents($path, 'Hello world from text processor.');

        $result = $this->processor->extractText($path);

        $this->assertSame('Hello world from text processor.', $result);
        unlink($path);
    }
}
