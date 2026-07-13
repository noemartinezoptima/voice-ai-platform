<?php

namespace App\Http\Controllers\Web;

use App\Domain\Call\Repositories\CallRepositoryInterface;
use App\Domain\Flow\Repositories\FlowRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly FlowRepositoryInterface $flowRepository,
        private readonly CallRepositoryInterface $callRepository,
    ) {}

    public function index(Request $request): InertiaResponse
    {
        $tenantId = $request->user()->tenant_id;
        $start = $request->query('start');
        $end = $request->query('end');

        $cacheKey = "dashboard:{$tenantId}:{$start}:{$end}";

        $data = Cache::remember($cacheKey, 300, function () use ($tenantId, $start, $end) {
            return [
                'stats' => $this->buildStats($tenantId, $start, $end),
                'callsByDay' => $this->callRepository->callsByDay($tenantId, $start, $end),
                'callsByStatus' => $this->callRepository->callsByStatus($tenantId, $start, $end),
                'avgDurationByDay' => $this->callRepository->avgDurationByDay($tenantId, $start, $end),
                'callsByFlow' => $this->callRepository->callsByFlow($tenantId, 5, $start, $end),
                'callsByFlowWithMetrics' => $this->callRepository->callsByFlowWithMetrics($tenantId, $start, $end),
            ];
        });

        return Inertia::render('Dashboard', [
            'stats' => $data['stats'],
            'range' => [
                'start' => $start ?? now()->subDays(7)->toDateString(),
                'end' => $end ?? now()->toDateString(),
            ],
            'callsByDay' => $data['callsByDay'],
            'callsByStatus' => $data['callsByStatus'],
            'avgDurationByDay' => $data['avgDurationByDay'],
            'callsByFlow' => $data['callsByFlow'],
            'callsByFlowWithMetrics' => $data['callsByFlowWithMetrics'],
        ]);
    }

    /** @return array<string, int> */
    private function buildStats(string $tenantId, ?string $start, ?string $end): array
    {
        return [
            'total_flows' => $this->flowRepository->countByTenant($tenantId),
            'active_flows' => $this->flowRepository->countActiveByTenant($tenantId),
            'total_calls' => $this->callRepository->countInRange($tenantId, $start, $end),
            'calls_today' => $this->callRepository->countTodayByTenant($tenantId),
            'active_calls' => $this->callRepository->countActiveByTenant($tenantId),
            'avg_duration_seconds' => $this->callRepository->avgDurationInRange($tenantId, $start, $end),
        ];
    }

    public function exportAnalytics(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;
        $start = $request->query('start');
        $end = $request->query('end');

        $callsByDay = $this->callRepository->callsByDay($tenantId, $start, $end);
        $activeCalls = $this->callRepository->countActiveByTenant($tenantId);
        $flowMetrics = $this->callRepository->callsByFlowWithMetrics($tenantId, $start, $end);

        $headers = [
            'date', 'total_calls', 'active_calls', 'avg_duration_seconds',
            'success_rate', 'flows_active',
        ];

        $rows = [];

        foreach ($callsByDay as $day) {
            $rows[] = [
                $day['date'],
                (string) $day['count'],
                (string) $activeCalls,
                '',
                '',
                '',
            ];
        }

        $rows[] = ['', '', '', '', '', ''];
        $rows[] = ['--- Per-Flow Breakdown ---', '', '', '', '', ''];

        foreach ($flowMetrics as $f) {
            $rows[] = [
                $f['flow_name'],
                (string) $f['total_calls'],
                '',
                sprintf('%.1f', $f['avg_duration']),
                sprintf('%.1f%%', $f['success_rate']),
                '',
            ];
        }

        $csv = $this->arrayToCsv($headers, $rows);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="analytics-export-'.now()->format('Y-m-d-His').'.csv"',
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
