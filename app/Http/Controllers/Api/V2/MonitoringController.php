<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsMessageModel;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDeliveryModel;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class MonitoringController extends Controller
{
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'cache' => $this->checkCache(),
                'database' => $this->checkDatabase(),
                'queue' => $this->checkQueue(),
            ],
        ]);
    }

    public function system(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $callStats = CallModel::where('tenant_id', $tenantId)
            ->selectRaw("
                COUNT(*) as total_calls,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN created_at >= NOW() - INTERVAL 24 HOUR THEN 1 ELSE 0 END) as last_24h,
                ROUND(AVG(duration_seconds)) as avg_duration_seconds
            ")->first();

        $smsStats = SmsMessageModel::where('tenant_id', $tenantId)
            ->selectRaw("
                COUNT(*) as total_messages,
                SUM(CASE WHEN direction = 'inbound' THEN 1 ELSE 0 END) as inbound,
                SUM(CASE WHEN direction = 'outbound' THEN 1 ELSE 0 END) as outbound,
                SUM(CASE WHEN created_at >= NOW() - INTERVAL 24 HOUR THEN 1 ELSE 0 END) as last_24h
            ")->first();

        $webhookStats = WebhookDeliveryModel::whereHas(
            'webhookDestination',
            fn ($q) => $q->where('tenant_id', $tenantId)
        )->selectRaw("
            COUNT(*) as total_deliveries,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
        ")->first();

        return response()->json([
            'calls' => $callStats,
            'sms' => $smsStats,
            'webhooks' => $webhookStats,
            'active_webhooks' => WebhookDestinationModel::where('tenant_id', $tenantId)
                ->where('is_active', true)
                ->count(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    private function checkCache(): string
    {
        try {
            cache()->store()->set('health_check', true);

            return cache()->store()->get('health_check') === true ? 'ok' : 'degraded';
        } catch (\Exception) {
            return 'down';
        }
    }

    private function checkDatabase(): string
    {
        try {
            \DB::select('SELECT 1');

            return 'ok';
        } catch (\Exception) {
            return 'down';
        }
    }

    private function checkQueue(): string
    {
        try {
            $queue = config('queue.default');
            $connected = ! in_array($queue, ['redis', 'database']) || Redis::connection()->ping();

            return $connected ? 'ok' : 'degraded';
        } catch (\Exception) {
            return 'down';
        }
    }
}
