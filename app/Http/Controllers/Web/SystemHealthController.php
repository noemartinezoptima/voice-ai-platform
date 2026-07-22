<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;
use Inertia\Response;

class SystemHealthController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('manageSettings');
        $tenantId = $request->user()->tenant_id;

        return Inertia::render('Settings/System/Index', [
            'health' => $this->buildHealth(),
            'failedJobs' => $this->getFailedJobs(),
            'queueDepth' => $this->getQueueDepth(),
            'errorRate' => $this->getErrorRate($tenantId),
            'lastChecked' => now()->toIso8601String(),
        ]);
    }

    public function poll(Request $request): JsonResponse
    {
        Gate::authorize('manageSettings');
        $tenantId = $request->user()->tenant_id;

        return response()->json([
            'health' => $this->buildHealth(),
            'failedJobs' => $this->getFailedJobs(),
            'queueDepth' => $this->getQueueDepth(),
            'errorRate' => $this->getErrorRate($tenantId),
            'lastChecked' => now()->toIso8601String(),
        ]);
    }

    /**
     * @return array{score: int<0, 100>, database: array<string, mixed>, redis: array<string, mixed>, cache: array<string, mixed>, twilio: array<string, mixed>}
     */
    private function buildHealth(): array
    {
        $db = $this->checkDatabase();
        $redis = $this->checkRedis();
        $cache = $this->checkCache();
        $twilio = $this->checkTwilio();

        $services = [$db, $redis, $cache, $twilio];
        $ok = count(array_filter($services, fn ($s) => $s['status'] === 'ok'));
        $total = count($services);

        return [
            'score' => (int) round(($ok / $total) * 100),
            'database' => $db,
            'redis' => $redis,
            'cache' => $cache,
            'twilio' => $twilio,
        ];
    }

    /**
     * @return array{status: string, label: string, latency?: ?int, message?: string}
     */
    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();

            return ['status' => 'ok', 'label' => 'Database', 'latency' => $this->measure(fn () => DB::select('SELECT 1'))];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'label' => 'Database', 'message' => $e->getMessage()];
        }
    }

    /**
     * @return array{status: string, label: string, message?: string}
     */
    private function checkRedis(): array
    {
        try {
            Redis::connection()->ping();

            return ['status' => 'ok', 'label' => 'Redis'];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'label' => 'Redis', 'message' => $e->getMessage()];
        }
    }

    /**
     * @return array{status: string, label: string, message?: string}
     */
    private function checkCache(): array
    {
        try {
            $key = 'health:'.now()->timestamp;
            Cache::put($key, true, 1);
            $retrieved = Cache::get($key);
            Cache::forget($key);

            return ['status' => $retrieved ? 'ok' : 'error', 'label' => 'Cache'];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'label' => 'Cache', 'message' => $e->getMessage()];
        }
    }

    /**
     * @return array{status: string, label: string, latency?: ?int, message?: string}
     */
    private function checkTwilio(): array
    {
        try {
            $accountSid = config('twilio.account_sid');
            if (empty($accountSid)) {
                return ['status' => 'warning', 'label' => 'Twilio', 'message' => 'Not configured'];
            }

            $response = Http::withBasicAuth($accountSid, config('twilio.auth_token'))
                ->timeout(5)
                ->get("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}.json");

            $latency = null;
            if ($response->successful()) {
                $stats = $response->handlerStats();
                $latency = $stats['total_time_us'] ?? null;
            }

            return [
                'status' => $response->successful() ? 'ok' : 'error',
                'label' => 'Twilio',
                'latency' => $latency,
            ];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'label' => 'Twilio', 'message' => $e->getMessage()];
        }
    }

    private function measure(callable $fn): ?int
    {
        $start = hrtime(true);
        try {
            $fn();

            return (int) ((hrtime(true) - $start) / 1000);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @return list<array{id: string, connection: string, queue: string, exception: string, failed_at: string}>
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
     * @return list<array{queue: string, size: int}>
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
