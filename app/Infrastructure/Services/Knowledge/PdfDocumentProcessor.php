<?php

namespace App\Infrastructure\Services\Knowledge;

use App\Domain\Knowledge\Services\DocumentProcessorInterface;
use Smalot\PdfParser\Parser;

class PdfDocumentProcessor implements DocumentProcessorInterface
{
    public function supports(string $mimeType): bool
    {
        return in_array($mimeType, ['application/pdf', 'application/x-pdf']);
    }

    public function extractText(string $path): string
    {
        $parser = new Parser;
        $pdf = $parser->parseFile($path);

        return $pdf->getText();
    }
}
