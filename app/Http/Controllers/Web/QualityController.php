<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Call\CallQualityScoreModel;
use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QualityController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $cacheKey = "quality:stats:{$tenantId}";

        $cachedStats = Cache::remember($cacheKey, 300, function () use ($tenantId) {
            $stats = DB::table('call_quality_scores')
                ->where('tenant_id', $tenantId)
                ->selectRaw('
                    COALESCE(AVG(total_score), 0) as avg_score,
                    COUNT(*) as total_scored
                ')
                ->first();

            $topFlow = DB::table('call_quality_scores')
                ->where('call_quality_scores.tenant_id', $tenantId)
                ->join('calls', 'call_quality_scores.call_id', '=', 'calls.id')
                ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
                ->selectRaw("COALESCE(flows.name, 'No Flow') as flow_name, AVG(call_quality_scores.total_score) as avg_score")
                ->groupBy('flows.id', 'flows.name')
                ->orderByDesc('avg_score')
                ->first();

            $topFlows = DB::table('call_quality_scores')
                ->where('call_quality_scores.tenant_id', $tenantId)
                ->join('calls', 'call_quality_scores.call_id', '=', 'calls.id')
                ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
                ->selectRaw("COALESCE(flows.name, 'No Flow') as flow_name, ROUND(AVG(call_quality_scores.total_score), 1) as avg_score, COUNT(*) as call_count")
                ->groupBy('flows.id', 'flows.name')
                ->orderByDesc('avg_score')
                ->limit(5)
                ->get();

            $scoreDistribution = DB::table('call_quality_scores')
                ->where('tenant_id', $tenantId)
                ->selectRaw('
                    COUNT(*) FILTER (WHERE total_score >= 80) as excellent,
                    COUNT(*) FILTER (WHERE total_score >= 60 AND total_score < 80) as good,
                    COUNT(*) FILTER (WHERE total_score >= 40 AND total_score < 60) as fair,
                    COUNT(*) FILTER (WHERE total_score < 40) as poor
                ')
                ->first();

            $scoreTrend = DB::table('call_quality_scores')
                ->where('tenant_id', $tenantId)
                ->where('created_at', '>=', now()->subDays(30))
                ->selectRaw('DATE(created_at) as date, ROUND(AVG(total_score), 1) as avg_score, COUNT(*) as call_count')
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date')
                ->get();

            return [
                'avgScore' => $stats ? round((float) $stats->avg_score, 1) : 0.0,
                'totalScored' => $stats ? (int) $stats->total_scored : 0,
                'topFlow' => $topFlow->flow_name ?? 'N/A',
                'topFlowScore' => $topFlow ? round((float) ($topFlow->avg_score ?? 0), 1) : 0,
                'topFlows' => $topFlows,
                'scoreDistribution' => $scoreDistribution,
                'scoreTrend' => $scoreTrend,
            ];
        });

        $filters = $request->only(['date_from', 'date_to', 'score_min', 'score_max', 'search']);

        $callsQuery = CallQualityScoreModel::query()
            ->where('call_quality_scores.tenant_id', $tenantId)
            ->join('calls', 'call_quality_scores.call_id', '=', 'calls.id')
            ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
            ->select(
                'call_quality_scores.*',
                'calls.from_number',
                'calls.to_number',
                'calls.status as call_status',
                'calls.started_at',
            )
            ->selectRaw('COALESCE(flows.name, \'No Flow\') as flow_name');

        if ($dateFrom = $filters['date_from'] ?? null) {
            $callsQuery->whereDate('call_quality_scores.created_at', '>=', $dateFrom);
        }
        if ($dateTo = $filters['date_to'] ?? null) {
            $callsQuery->whereDate('call_quality_scores.created_at', '<=', $dateTo);
        }
        if ($scoreMin = $filters['score_min'] ?? null) {
            $callsQuery->where('call_quality_scores.total_score', '>=', (int) $scoreMin);
        }
        if ($scoreMax = $filters['score_max'] ?? null) {
            $callsQuery->where('call_quality_scores.total_score', '<=', (int) $scoreMax);
        }
        if ($search = $filters['search'] ?? null) {
            $callsQuery->where(function ($q) use ($search) {
                $q->where('calls.from_number', 'like', "%{$search}%")
                    ->orWhere('calls.to_number', 'like', "%{$search}%");
            });
        }

        $callsWithScores = $callsQuery
            ->orderByDesc('call_quality_scores.created_at')
            ->paginate(15);

        $recentScored = CallQualityScoreModel::query()
            ->where('call_quality_scores.tenant_id', $tenantId)
            ->join('calls', 'call_quality_scores.call_id', '=', 'calls.id')
            ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
            ->select(
                'call_quality_scores.id',
                'call_quality_scores.call_id',
                'call_quality_scores.total_score',
                'calls.from_number',
                'calls.to_number',
                'calls.started_at',
            )
            ->selectRaw('COALESCE(flows.name, \'No Flow\') as flow_name')
            ->orderByDesc('call_quality_scores.created_at')
            ->limit(10)
            ->get();

        return Inertia::render('Quality/Index', [
            'avgScore' => $cachedStats['avgScore'],
            'totalScored' => $cachedStats['totalScored'],
            'topFlow' => $cachedStats['topFlow'],
            'topFlowScore' => $cachedStats['topFlowScore'],
            'callsWithScores' => $callsWithScores,
            'topFlows' => $cachedStats['topFlows'],
            'recentScored' => $recentScored,
            'scoreDistribution' => $cachedStats['scoreDistribution'],
            'scoreTrend' => $cachedStats['scoreTrend'],
            'filters' => $filters,
        ]);
    }

    public function show(Request $request, CallModel $call): Response
    {
        $score = CallQualityScoreModel::where('call_id', $call->id)->first();

        $call->load('flow');
        $call->loadCount('qualityScore');

        $transcripts = TranscriptModel::where('call_id', $call->id)
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Quality/Show', [
            'call' => [
                'id' => $call->id,
                'call_sid' => $call->call_sid,
                'from_number' => $call->from_number,
                'to_number' => $call->to_number,
                'status' => $call->status,
                'duration_seconds' => $call->duration_seconds,
                'started_at' => $call->started_at,
                'flow_name' => $call->flow?->name,
                'recording_url' => $call->recording_url,
            ],
            'score' => $score ? [
                'id' => $score->id,
                'total_score' => $score->total_score,
                'politeness_score' => $score->politeness_score,
                'resolution_score' => $score->resolution_score,
                'duration_score' => $score->duration_score,
                'details' => $score->details,
            ] : null,
            'transcripts' => $transcripts->map(fn ($t) => [
                'role' => $t->role,
                'text' => $t->text,
                'created_at' => $t->created_at,
            ]),
        ]);
    }
}
