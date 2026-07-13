<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallQualityScoreModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CallQualityController extends Controller
{
    public function show(Request $request, string $call): JsonResponse
    {
        $score = CallQualityScoreModel::where('call_id', $call)
            ->where('tenant_id', $request->user()->tenant_id)
            ->first();

        if ($score === null) {
            return response()->json(['message' => 'Not scored yet.'], 404);
        }

        return response()->json([
            'call_id' => $score->call_id,
            'total_score' => $score->total_score,
            'politeness_score' => $score->politeness_score,
            'resolution_score' => $score->resolution_score,
            'duration_score' => $score->duration_score,
            'details' => $score->details,
            'scored_at' => $score->created_at,
        ]);
    }
}
