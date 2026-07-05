<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CallController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CallModel::query()
            ->where('calls.tenant_id', $request->user()->tenant_id)
            ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
            ->select('calls.*', 'flows.name as flow_name')
            ->orderBy('calls.created_at', 'desc');

        if ($status = $request->get('status')) {
            $query->where('calls.status', $status);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('calls.from_number', 'like', "%{$search}%")
                    ->orWhere('calls.to_number', 'like', "%{$search}%")
                    ->orWhere('calls.call_sid', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Calls/Index', [
            'calls' => $query->paginate(15),
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(Request $request, string $id): Response
    {
        $call = CallModel::query()
            ->where('calls.tenant_id', $request->user()->tenant_id)
            ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
            ->select('calls.*', 'flows.name as flow_name')
            ->where('calls.id', $id)
            ->firstOrFail();

        return Inertia::render('Calls/Show', [
            'call' => $call,
        ]);
    }

    public function updateNotes(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:10000'],
        ]);

        $updated = CallModel::where('tenant_id', $request->user()->tenant_id)
            ->where('id', $id)
            ->update(['notes' => $validated['notes']]);

        if ($updated === 0) {
            abort(404);
        }

        return response()->json(['status' => 'saved']);
    }
}
