<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use App\Services\ConversationAnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AnalyticsController extends Controller
{
    public function __construct(
        private readonly ConversationAnalyticsService $analytics,
    ) {}

    public function index(Request $request): InertiaResponse
    {
        $tenantId = $request->user()->tenant_id;
        $since = now()->subDays(90)->startOfDay();

        $latestTranscript = TranscriptModel::query()
            ->join('calls', 'transcripts.call_id', '=', 'calls.id')
            ->where('calls.tenant_id', $tenantId)
            ->where('calls.started_at', '>=', $since)
            ->max('transcripts.created_at');

        $cacheKey = "analytics:{$tenantId}";
        if ($latestTranscript !== null) {
            $cacheKey .= ":{$latestTranscript}";
        }

        $data = Cache::remember($cacheKey, 600, function () use ($tenantId, $since) {
            $transcripts = TranscriptModel::query()
                ->join('calls', 'transcripts.call_id', '=', 'calls.id')
                ->where('calls.tenant_id', $tenantId)
                ->where('calls.started_at', '>=', $since)
                ->select('transcripts.*', 'calls.from_number', 'calls.started_at')
                ->orderBy('calls.started_at')
                ->get();

            $allTexts = $transcripts->pluck('text')->filter()->all();

            $sentiments = [];
            $callerSentiment = [];
            $dailyScores = [];

            foreach ($transcripts as $t) {
                $result = $this->analytics->analyzeSentiment($t->text ?? '');
                $sentiments[] = $result;

                $date = $t->started_at
                    ? Carbon::parse($t->started_at)->toDateString()
                    : 'unknown';

                if (! isset($dailyScores[$date])) {
                    $dailyScores[$date] = [];
                }
                $dailyScores[$date][] = $result['score'];

                if ($t->from_number) {
                    if (! isset($callerSentiment[$t->from_number])) {
                        $callerSentiment[$t->from_number] = ['scores' => [], 'calls' => 0];
                    }
                    $callerSentiment[$t->from_number]['scores'][] = $result['score'];
                    $callerSentiment[$t->from_number]['calls']++;
                }
            }

            $sentimentDistribution = [
                'positive' => count(array_filter($sentiments, fn ($s) => $s['label'] === 'positive')),
                'neutral' => count(array_filter($sentiments, fn ($s) => $s['label'] === 'neutral')),
                'negative' => count(array_filter($sentiments, fn ($s) => $s['label'] === 'negative')),
            ];

            $sentimentOverTime = [];
            foreach ($dailyScores as $date => $scores) {
                $sentimentOverTime[] = [
                    'date' => $date,
                    'avg_score' => round(array_sum($scores) / count($scores), 4),
                ];
            }
            usort($sentimentOverTime, fn ($a, $b) => $a['date'] <=> $b['date']);

            $topKeywords = $this->analytics->extractKeywords($allTexts, 15);

            $topicBreakdown = $this->analytics->clusterTopics($allTexts);

            $callerSentimentData = [];
            foreach ($callerSentiment as $caller => $d) {
                $callerSentimentData[] = [
                    'caller' => $caller,
                    'avg_score' => round(array_sum($d['scores']) / count($d['scores']), 4),
                    'calls' => $d['calls'],
                ];
            }
            usort($callerSentimentData, fn ($a, $b) => $b['avg_score'] <=> $a['avg_score']);
            $callerSentimentData = array_slice($callerSentimentData, 0, 10);

            $totalTranscripts = count($transcripts);
            $avgSentiment = $totalTranscripts > 0
                ? round(array_sum(array_column($sentiments, 'score')) / $totalTranscripts, 4)
                : 0;

            $topTopic = count($topicBreakdown) > 0 ? $topicBreakdown[0]['topic'] : 'N/A';

            return [
                'sentimentDistribution' => $sentimentDistribution,
                'sentimentOverTime' => $sentimentOverTime,
                'topKeywords' => $topKeywords,
                'topicBreakdown' => $topicBreakdown,
                'callerSentiment' => $callerSentimentData,
                'totalTranscripts' => $totalTranscripts,
                'avgSentiment' => $avgSentiment,
                'topTopic' => $topTopic,
            ];
        });

        return Inertia::render('Analytics/Index', $data);
    }

    public function export(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;
        $since = now()->subDays(90)->startOfDay();

        $transcripts = TranscriptModel::query()
            ->join('calls', 'transcripts.call_id', '=', 'calls.id')
            ->where('calls.tenant_id', $tenantId)
            ->where('calls.started_at', '>=', $since)
            ->select('transcripts.*', 'calls.from_number', 'calls.started_at')
            ->orderBy('calls.started_at')
            ->get();

        $allTexts = $transcripts->pluck('text')->filter()->all();
        $topicBreakdown = $this->analytics->clusterTopics($allTexts);

        $dailyData = [];
        foreach ($transcripts as $t) {
            $date = $t->started_at
                ? Carbon::parse($t->started_at)->toDateString()
                : 'unknown';
            $sentiment = $this->analytics->analyzeSentiment($t->text ?? '');

            if (! isset($dailyData[$date])) {
                $dailyData[$date] = [
                    'total' => 0,
                    'positive' => 0,
                    'neutral' => 0,
                    'negative' => 0,
                    'scores' => [],
                ];
            }
            $dailyData[$date]['total']++;
            $dailyData[$date][$sentiment['label']]++;
            $dailyData[$date]['scores'][] = $sentiment['score'];
        }

        $topTopic = count($topicBreakdown) > 0 ? $topicBreakdown[0]['topic'] : 'N/A';

        $headers = ['Date', 'Total Transcripts', 'Positive', 'Neutral', 'Negative', 'Avg Sentiment', 'Top Topic'];

        $rows = [];
        foreach ($dailyData as $date => $data) {
            $avg = round(array_sum($data['scores']) / count($data['scores']), 4);
            $rows[] = [
                $date,
                (string) $data['total'],
                (string) $data['positive'],
                (string) $data['neutral'],
                (string) $data['negative'],
                (string) $avg,
                $topTopic,
            ];
        }

        usort($rows, fn ($a, $b) => $a[0] <=> $b[0]);

        $csv = $this->arrayToCsv($headers, $rows);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="conversation-analytics-'.now()->format('Y-m-d-His').'.csv"',
        ]);
    }

    /**
     * @param  array<int, string>  $headers
     * @param  array<int, array<int, string>>  $rows
     */
    private function arrayToCsv(array $headers, array $rows): string
    {
        $out = fopen('php://temp', 'r+');

        fputcsv($out, $headers);

        foreach ($rows as $row) {
            fputcsv($out, $row);
        }

        rewind($out);

        return stream_get_contents($out);
    }
}
