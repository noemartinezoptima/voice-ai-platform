<?php

namespace App\Infrastructure\Services\Knowledge;

use App\Domain\Knowledge\Services\DocumentProcessorInterface;

class CsvDocumentProcessor implements DocumentProcessorInterface
{
    public function supports(string $mimeType): bool
    {
        return $mimeType === 'text/csv';
    }

    public function extractText(string $path): string
    {
        $handle = fopen($path, 'r');
        if ($handle === false) {
            return '';
        }

        $lines = [];
        $headers = fgetcsv($handle);

        while (($row = fgetcsv($handle)) !== false) {
            if ($headers !== false) {
                $pairs = [];
                foreach ($headers as $i => $header) {
                    $value = $row[$i] ?? '';
                    $pairs[] = "{$header}: {$value}";
                }
                $lines[] = implode(', ', $pairs);
            } else {
                $lines[] = implode(', ', $row);
            }
        }

        fclose($handle);

        return implode("\n", $lines);
    }
}
