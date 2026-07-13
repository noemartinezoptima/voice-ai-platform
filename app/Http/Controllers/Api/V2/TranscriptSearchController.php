<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TranscriptSearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $transcripts = TranscriptModel::query()
            ->join('calls', 'transcripts.call_id', '=', 'calls.id')
            ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
            ->where('calls.tenant_id', $tenantId)
            ->when($request->q, function ($q, $v) {
                $searchTerm = strtolower($v);

                return $q->whereRaw('LOWER(transcripts.text) LIKE ?', ["%{$searchTerm}%"]);
            })
            ->when($request->role, fn ($q, $v) => $q->where('transcripts.role', $v))
            ->select('transcripts.*', 'calls.from_number', 'calls.to_number', 'calls.status as call_status', 'flows.name as flow_name')
            ->orderBy('transcripts.created_at', 'desc')
            ->paginate($request->per_page ?? 50);

        return response()->json($transcripts);
    }
}
