<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CallSearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $calls = CallModel::query()
            ->join('flows', 'calls.flow_id', '=', 'flows.id')
            ->leftJoin('transcripts', 'transcripts.call_id', '=', 'calls.id')
            ->where('calls.tenant_id', $tenantId)
            ->when($request->q, function ($q, $v) {
                $searchTerm = strtolower($v);

                return $q->where(function ($q) use ($searchTerm) {
                    $q->whereRaw('LOWER(calls.from_number) LIKE ?', ["%{$searchTerm}%"])
                        ->orWhereRaw('LOWER(calls.to_number) LIKE ?', ["%{$searchTerm}%"])
                        ->orWhereRaw('LOWER(transcripts.text) LIKE ?', ["%{$searchTerm}%"]);
                });
            })
            ->when($request->status, fn ($q, $v) => $q->where('calls.status', $v))
            ->when($request->flow_id, fn ($q, $v) => $q->where('calls.flow_id', $v))
            ->when($request->date_from, fn ($q, $v) => $q->where('calls.created_at', '>=', $v))
            ->when($request->date_to, fn ($q, $v) => $q->where('calls.created_at', '<=', $v))
            ->select('calls.*', 'flows.name as flow_name')
            ->distinct()
            ->orderBy('calls.created_at', 'desc')
            ->paginate($request->per_page ?? 25);

        return response()->json($calls);
    }
}
