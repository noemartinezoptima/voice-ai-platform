<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Call\CallQualityScoreModel;
use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AnalyticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $data = Cache::remember("api:v2:analytics:{$tenantId}", 300, function () use ($tenantId) {
            $totalCalls = CallModel::where('tenant_id', $tenantId)->count();
            $completedCalls = CallModel::where('tenant_id', $tenantId)->where('status', 'completed')->count();
            $avgDuration = (int) CallModel::where('tenant_id', $tenantId)->avg('duration_seconds');
            $totalTranscripts = TranscriptModel::join('calls', 'transcripts.call_id', '=', 'calls.id')
                ->where('calls.tenant_id', $tenantId)->count();
            $avgQualityScore = (float) (CallQualityScoreModel::where('tenant_id', $tenantId)->avg('total_score') ?? 0);

            return [
                'total_calls' => $totalCalls,
                'completed_calls' => $completedCalls,
                'success_rate' => $totalCalls > 0 ? round($completedCalls / $totalCalls * 100, 1) : 0,
                'avg_duration_seconds' => $avgDuration,
                'total_transcripts' => $totalTranscripts,
                'avg_quality_score' => round($avgQualityScore, 1),
            ];
        });

        return response()->json(['data' => $data]);
    }
}
