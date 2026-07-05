<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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

    public function exportCsv(Request $request): \Illuminate\Http\Response
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

        $calls = $query->get();

        $headers = [
            'CallSid', 'From', 'To', 'Status', 'Duration', 'Flow',
            'StartedAt', 'EndedAt', 'RecordingUrl', 'Notes',
        ];

        $rows = $calls->map(fn ($c) => [
            $c->call_sid,
            $c->from_number,
            $c->to_number,
            $c->status,
            $c->duration_seconds ?? 0,
            $c->flow_name ?? '',
            $c->started_at?->toIso8601String() ?? '',
            $c->ended_at?->toIso8601String() ?? '',
            $c->recording_url ?? '',
            Str::replace("\n", ' ', $c->notes ?? ''),
        ]);

        $csv = $this->arrayToCsv($headers, $rows->toArray());

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="calls-export-'.now()->format('Y-m-d-His').'.csv"',
        ]);
    }

    /**
     * @param array<int, string> $headers
     * @param array<int, array<int, string>> $rows
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
