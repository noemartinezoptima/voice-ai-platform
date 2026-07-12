<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;
use Inertia\Response;

class SystemHealthController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        return Inertia::render('Settings/System/Index', [
            'health' => [
                'database' => $this->checkDatabase(),
                'redis' => $this->checkRedis(),
            ],
            'failedJobs' => $this->getFailedJobs(),
            'queueDepth' => $this->getQueueDepth(),
            'errorRate' => $this->getErrorRate($tenantId),
        ]);
    }

    private function checkDatabase(): string
    {
        try {
            DB::connection()->getPdo();

            return 'ok';
        } catch (\Throwable) {
            return 'error';
        }
    }

    private function checkRedis(): string
    {
        try {
            Redis::connection()->ping();

            return 'ok';
        } catch (\Throwable) {
            return 'error';
        }
    }

    /**
     * @return array{id: int, connection: string, queue: string, exception: string, failed_at: string}
     */
    private function getFailedJobs(): array
    {
        return DB::table('failed_jobs')
            ->where('failed_at', '>=', now()->subHours(24))
            ->orderByDesc('failed_at')
            ->limit(50)
            ->get()
            ->map(fn ($job) => [
                'id' => $job->id,
                'connection' => $job->connection,
                'queue' => $job->queue,
                'exception' => mb_substr($job->exception, 0, 200),
                'failed_at' => $job->failed_at,
            ])
            ->toArray();
    }

    /**
     * @return array{queue: string, size: int}[]
     */
    private function getQueueDepth(): array
    {
        $queues = ['default', 'twilio', 'emails'];

        return array_map(fn ($queue) => [
            'queue' => $queue,
            'size' => Queue::size($queue),
        ], $queues);
    }

    /**
     * @return array{total: int, failed: int, percentage: float}
     */
    private function getErrorRate(string $tenantId): array
    {
        $total = DB::table('calls')
            ->where('tenant_id', $tenantId)
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        $failed = DB::table('calls')
            ->where('tenant_id', $tenantId)
            ->where('created_at', '>=', now()->subHours(24))
            ->where('status', 'failed')
            ->count();

        return [
            'total' => $total,
            'failed' => $failed,
            'percentage' => $total > 0 ? round(($failed / $total) * 100, 1) : 0.0,
        ];
    }
}
