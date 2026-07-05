<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MonitorController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Monitor/Index', [
            'activeCalls' => $this->getActiveCalls($request),
        ]);
    }

    public function active(Request $request): JsonResponse
    {
        return response()->json([
            'calls' => $this->getActiveCalls($request),
        ]);
    }

    /** @return array<int, array<string, mixed>> */
    private function getActiveCalls(Request $request): array
    {
        return CallModel::query()
            ->where('calls.tenant_id', $request->user()->tenant_id)
            ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
            ->select('calls.*', 'flows.name as flow_name')
            ->whereIn('calls.status', ['initiated', 'in_progress', 'ringing'])
            ->orderBy('calls.created_at', 'desc')
            ->take(50)
            ->get()
            ->toArray();
    }
}
