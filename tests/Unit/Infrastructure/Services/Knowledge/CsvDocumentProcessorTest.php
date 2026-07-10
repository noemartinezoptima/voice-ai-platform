<?php

namespace Tests\Unit\Infrastructure\Services\Knowledge;

use App\Infrastructure\Services\Knowledge\CsvDocumentProcessor;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CsvDocumentProcessorTest extends TestCase
{
    private CsvDocumentProcessor $processor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->processor = new CsvDocumentProcessor;
    }

    #[Test]
    public function supports_text_csv(): void
    {
        $this->assertTrue($this->processor->supports('text/csv'));
    }

    #[Test]
    public function does_not_support_other_types(): void
    {
        $this->assertFalse($this->processor->supports('text/plain'));
        $this->assertFalse($this->processor->supports('application/pdf'));
        $this->assertFalse($this->processor->supports('application/json'));
    }

    #[Test]
    public function extracts_csv_with_headers(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'csv_test_');
        file_put_contents($path, "name,age,city\nAlice,30,NYC\nBob,25,LA\n");

        $result = $this->processor->extractText($path);

        $this->assertStringContainsString('name: Alice', $result);
        $this->assertStringContainsString('age: 30', $result);
        $this->assertStringContainsString('city: NYC', $result);
        $this->assertStringContainsString('name: Bob', $result);
        unlink($path);
    }

    #[Test]
    public function returns_empty_for_missing_file(): void
    {
        $result = @$this->processor->extractText('/nonexistent/path.csv');
        $this->assertSame('', $result);
    }
}
