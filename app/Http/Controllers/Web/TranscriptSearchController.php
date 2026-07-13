<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TranscriptSearchController extends Controller
{
    public function index(Request $request): Response
    {
        $query = TranscriptModel::query()
            ->join('calls', 'transcripts.call_id', '=', 'calls.id')
            ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
            ->where('calls.tenant_id', $request->user()->tenant_id)
            ->select(
                'transcripts.*',
                'calls.from_number',
                'calls.to_number',
                'calls.status as call_status',
                'calls.call_sid',
                'flows.name as flow_name'
            )
            ->orderBy('transcripts.created_at', 'desc');

        if ($search = $request->get('q')) {
            $query->whereRaw('LOWER(transcripts.text) LIKE ?', ['%'.mb_strtolower($search).'%']);
        }

        if ($role = $request->get('role')) {
            $query->where('transcripts.role', $role);
        }

        $transcripts = $query->paginate(20)->withQueryString();

        $baseQuery = TranscriptModel::query()
            ->join('calls', 'transcripts.call_id', '=', 'calls.id')
            ->where('calls.tenant_id', $request->user()->tenant_id);

        $stats = [
            'total_transcripts' => (clone $baseQuery)->count(),
            'calls_with_transcripts' => (clone $baseQuery)->distinct('calls.id')->count('calls.id'),
        ];

        return Inertia::render('Transcripts/Index', [
            'transcripts' => $transcripts,
            'stats' => $stats,
            'filters' => $request->only(['q', 'role']),
        ]);
    }

    public function export(Request $request): \Illuminate\Http\Response
    {
        $query = TranscriptModel::query()
            ->join('calls', 'transcripts.call_id', '=', 'calls.id')
            ->leftJoin('flows', 'calls.flow_id', '=', 'flows.id')
            ->where('calls.tenant_id', $request->user()->tenant_id)
            ->select(
                'transcripts.*',
                'calls.from_number',
                'calls.to_number',
                'calls.call_sid',
                'flows.name as flow_name'
            )
            ->orderBy('transcripts.created_at', 'desc');

        if ($search = $request->get('q')) {
            $query->whereRaw('LOWER(transcripts.text) LIKE ?', ['%'.mb_strtolower($search).'%']);
        }

        if ($role = $request->get('role')) {
            $query->where('transcripts.role', $role);
        }

        $transcripts = $query->get();

        $headers = [
            'CallSid', 'From', 'To', 'Flow', 'Role',
            'Transcript Text', 'Confidence', 'Timestamp',
        ];

        $rows = $transcripts->map(fn ($t) => [
            $t->call_sid,
            $t->from_number,
            $t->to_number,
            $t->flow_name ?? '',
            $t->role,
            Str::replace("\n", ' ', $t->text),
            $t->confidence ?? '',
            $t->created_at?->toIso8601String() ?? '',
        ]);

        $csv = $this->arrayToCsv($headers, $rows->toArray());

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transcripts-export-'.now()->format('Y-m-d-His').'.csv"',
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
