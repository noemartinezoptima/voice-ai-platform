<?php

namespace App\Services;

class ConversationAnalyticsService
{
    /** @var list<string> */
    private const POSITIVE_WORDS = [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'pleased',
        'thanks', 'thank', 'perfect', 'helpful', 'fantastic', 'love', 'awesome',
        'appreciate', 'satisfied', 'excellent',
    ];

    /** @var list<string> */
    private const NEGATIVE_WORDS = [
        'bad', 'terrible', 'awful', 'horrible', 'unhappy', 'angry', 'frustrated',
        'upset', 'disappointed', 'wrong', 'useless', 'poor', 'hate', 'sorry',
        'problem', 'issue', 'error', 'fail',
    ];

    /** @var list<string> */
    private const STOP_WORDS = [
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'i', 'you', 'we', 'they',
        'he', 'she', 'it', 'this', 'that', 'and', 'or', 'but', 'to', 'of', 'in',
        'for', 'on', 'with', 'at', 'from', 'by', 'about', 'as', 'be', 'been',
        'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'can',
        'could', 'should', 'may', 'might', 'shall', 'not', 'no', 'yes', 'if',
        'then', 'else', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
        'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own',
        'same', 'so', 'than', 'too', 'very', 'just', 'now', 'up', 'out', 'also',
        'very', 'here', 'there', 'my', 'your', 'his', 'her', 'its', 'our',
        'their', 'me', 'him', 'us', 'them', 'what', 'which', 'who', 'whom',
        'these', 'those', 'am', 'is', 'are', 'was', 'were',
    ];

    /** @var array<string, list<string>> */
    private const TOPIC_KEYWORDS = [
        'billing' => ['bill', 'payment', 'charge', 'invoice', 'price', 'cost', 'plan', 'subscription'],
        'support' => ['help', 'support', 'issue', 'problem', 'fix', 'broken', 'error'],
        'product' => ['feature', 'product', 'service', 'use', 'work', 'working'],
        'account' => ['account', 'login', 'password', 'email', 'profile', 'sign'],
        'cancellation' => ['cancel', 'refund', 'return', 'stop', 'discontinue'],
    ];

    /**
     * @return array{score: float, label: 'positive'|'neutral'|'negative', positive_words: int, negative_words: int}
     */
    public function analyzeSentiment(string $text): array
    {
        $words = str_word_count(strtolower($text), 1);
        $totalWords = count($words);
        $positiveCount = 0;
        $negativeCount = 0;

        foreach ($words as $word) {
            if (in_array($word, self::POSITIVE_WORDS, true)) {
                $positiveCount++;
            }
            if (in_array($word, self::NEGATIVE_WORDS, true)) {
                $negativeCount++;
            }
        }

        $score = ($positiveCount - $negativeCount) / max($totalWords, 1);

        $label = 'neutral';
        if ($score > 0.05) {
            $label = 'positive';
        } elseif ($score < -0.05) {
            $label = 'negative';
        }

        return [
            'score' => $score,
            'label' => $label,
            'positive_words' => $positiveCount,
            'negative_words' => $negativeCount,
        ];
    }

    /**
     * @param  list<string>  $texts
     * @return array<int, array{word: string, count: int}>
     */
    public function extractKeywords(array $texts, int $limit = 20): array
    {
        $frequencies = [];

        foreach ($texts as $text) {
            $words = str_word_count(strtolower($text), 1);
            foreach ($words as $word) {
                if (strlen($word) < 3) {
                    continue;
                }
                if (in_array($word, self::STOP_WORDS, true)) {
                    continue;
                }
                if (! isset($frequencies[$word])) {
                    $frequencies[$word] = 0;
                }
                $frequencies[$word]++;
            }
        }

        arsort($frequencies);

        $result = [];
        $i = 0;
        foreach ($frequencies as $word => $count) {
            if ($i >= $limit) {
                break;
            }
            $result[] = ['word' => $word, 'count' => $count];
            $i++;
        }

        return $result;
    }

    /**
     * @param  list<string>  $texts
     * @return array<int, array{topic: string, count: int}>
     */
    public function clusterTopics(array $texts): array
    {
        $allText = strtolower(implode(' ', $texts));
        $words = str_word_count($allText, 1);

        $topicCounts = [];
        foreach (self::TOPIC_KEYWORDS as $topic => $keywords) {
            $count = 0;
            foreach ($words as $word) {
                if (in_array($word, $keywords, true)) {
                    $count++;
                }
            }
            $topicCounts[] = ['topic' => $topic, 'count' => $count];
        }

        usort($topicCounts, fn (array $a, array $b) => $b['count'] <=> $a['count']);

        return $topicCounts;
    }
}
