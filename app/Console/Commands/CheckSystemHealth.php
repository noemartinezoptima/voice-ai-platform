<?php

namespace App\Console\Commands;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use App\Notifications\SystemAlert;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

class CheckSystemHealth extends Command
{
    protected $signature = 'system:health-check';

    protected $description = 'Check system health and alert on queue backlog or high failure rates';

    public function handle(): int
    {
        $tenants = TenantModel::where('is_active', true)->get();

        foreach ($tenants as $tenant) {
            $this->checkQueueBacklog($tenant);
            $this->checkFailureRate($tenant);
        }

        return self::SUCCESS;
    }

    private function checkQueueBacklog(object $tenant): void
    {
        $cacheKey = "system_alert_queue_{$tenant->id}";
        $rateLimitMinutes = config('alerting.rate_limit_minutes', 60);

        if (Cache::has($cacheKey)) {
            return;
        }

        $queueSize = Queue::size();

        if ($queueSize > config('alerting.queue_threshold', 50)) {
            $owner = User::where('tenant_id', $tenant->id)->where('role', 'owner')->first();

            if ($owner !== null) {
                $owner->notify(new SystemAlert(
                    'warning',
                    'Queue backlog detected',
                    "The queue has {$queueSize} pending jobs, exceeding the threshold of {$queueSize}.",
                ));

                Cache::put($cacheKey, true, now()->addMinutes($rateLimitMinutes));

                $this->warn("Queue alert sent for tenant: {$tenant->name}");
            }
        }
    }

    private function checkFailureRate(object $tenant): void
    {
        $cacheKey = "system_alert_failure_{$tenant->id}";
        $rateLimitMinutes = config('alerting.rate_limit_minutes', 60);

        if (Cache::has($cacheKey)) {
            return;
        }

        $total = DB::table('calls')
            ->where('tenant_id', $tenant->id)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->count();

        if ($total === 0) {
            return;
        }

        $failed = DB::table('calls')
            ->where('tenant_id', $tenant->id)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->where('status', 'failed')
            ->count();

        $failureRate = ($failed / $total) * 100;

        if ($failureRate > config('alerting.failure_rate_threshold', 10)) {
            $owner = User::where('tenant_id', $tenant->id)->where('role', 'owner')->first();

            if ($owner !== null) {
                $owner->notify(new SystemAlert(
                    'critical',
                    'High call failure rate',
                    "{$failed} of {$total} calls failed in the last 5 minutes ({$failureRate}% failure rate).",
                ));

                Cache::put($cacheKey, true, now()->addMinutes($rateLimitMinutes));

                $this->warn("Failure rate alert sent for tenant: {$tenant->name}");
            }
        }
    }
}
