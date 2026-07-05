<?php

namespace App\Domain\Knowledge\Services;

class ChunkingService
{
    private const TARGET_TOKENS = 500;

    private const OVERLAP_TOKENS = 50;

    private const AVG_CHARS_PER_TOKEN = 4;

    /** @return string[] */
    public function chunk(string $text): array
    {
        $text = trim($text);
        if ($text === '') {
            return [];
        }

        $targetChars = self::TARGET_TOKENS * self::AVG_CHARS_PER_TOKEN;
        $overlapChars = self::OVERLAP_TOKENS * self::AVG_CHARS_PER_TOKEN;

        $paragraphs = preg_split('/\n\s*\n/', $text);
        $chunks = [];
        $current = '';

        foreach ($paragraphs as $paragraph) {
            $paragraph = trim($paragraph);
            if ($paragraph === '') {
                continue;
            }

            if (strlen($current) + strlen($paragraph) > $targetChars && $current !== '') {
                $chunks[] = trim($current);
                $sentences = preg_split('/(?<=[.?!])\s+/', $current);
                $current = '';

                if (count($sentences) > 1) {
                    $overlapText = '';
                    foreach (array_reverse($sentences) as $sentence) {
                        $candidate = $sentence.' '.$overlapText;
                        if (strlen($candidate) > $overlapChars) {
                            break;
                        }
                        $overlapText = $candidate;
                    }
                    $current = trim($overlapText)."\n\n";
                }
            }

            $current .= $paragraph."\n\n";
        }

        if (trim($current) !== '') {
            $chunks[] = trim($current);
        }

        return $chunks;
    }
}
