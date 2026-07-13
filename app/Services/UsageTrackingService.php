<?php

namespace App\Services;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;

class UsageTrackingService
{
    public function incrementCallCount(TenantModel $tenant): void
    {
        $subscription = $tenant->subscription();

        if ($subscription && $subscription->valid()) {
            try {
                $subscription->reportUsage(1);
            } catch (\Throwable $e) {
                report($e);
            }
        }
    }
}
