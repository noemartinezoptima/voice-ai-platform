<?php

namespace App\Services;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;

class CallQualityScoringService
{
    public function __construct(
        private readonly ConversationAnalyticsService $analytics,
    ) {}

    /**
     * @return array{total_score: int, politeness_score: int, resolution_score: int, duration_score: int}
     */
    public function scoreCall(CallModel $call): array
    {
        $transcripts = TranscriptModel::where('call_id', $call->id)->get();
        $allText = $transcripts->pluck('text')->implode(' ');

        $sentiment = $this->analytics->analyzeSentiment($allText);
        $politeness = (int) max(0, min(100, ($sentiment['score'] + 1) * 50));

        $duration = $call->duration_seconds ?? 0;
        $resolution = match ($call->status) {
            'completed' => 80,
            'failed' => 10,
            default => 50,
        };
        if ($duration < 30) {
            $resolution = max($resolution - 20, 0);
        }

        $durationScore = match (true) {
            $duration < 30 => 30,
            $duration < 60 => 60,
            $duration > 600 => (int) max(80 - (($duration - 600) / 60), 20),
            default => 80,
        };

        $total = (int) round(($politeness + $resolution + $durationScore) / 3);

        return [
            'total_score' => $total,
            'politeness_score' => $politeness,
            'resolution_score' => $resolution,
            'duration_score' => (int) $durationScore,
        ];
    }
}
