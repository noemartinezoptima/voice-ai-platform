<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDeliveryModel;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use App\Jobs\DispatchWebhookJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WebhookDeliveryController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $query = WebhookDeliveryModel::query()
            ->whereHas('webhookDestination', fn ($q) => $q->where('tenant_id', $tenantId))
            ->with('webhookDestination')
            ->orderBy('created_at', 'desc');

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        if ($event = $request->get('event')) {
            $query->where('event', $event);
        }
        if ($destinationId = $request->get('destination_id')) {
            $query->where('webhook_destination_id', $destinationId);
        }
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('event', 'like', "%{$search}%")
                    ->orWhereHas('webhookDestination', fn ($sq) => $sq->where('url', 'like', "%{$search}%"));
            });
        }

        $stats = WebhookDeliveryModel::whereHas('webhookDestination', fn ($q) => $q->where('tenant_id', $tenantId))
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            ")->first();

        $successRate = $stats && $stats->total > 0
            ? round(($stats->successful / $stats->total) * 100, 1)
            : null;

        return Inertia::render('WebhookDeliveries/Index', [
            'deliveries' => $query->paginate(20),
            'stats' => $stats,
            'successRate' => $successRate,
            'filters' => $request->only(['status', 'event', 'destination_id', 'search']),
            'destinations' => WebhookDestinationModel::where('tenant_id', $tenantId)
                ->select('id', 'url', 'events')
                ->get(),
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $delivery = WebhookDeliveryModel::whereHas(
            'webhookDestination',
            fn ($q) => $q->where('tenant_id', $request->user()->tenant_id)
        )->with('webhookDestination')->findOrFail($id);

        return response()->json($delivery);
    }

    public function retry(Request $request, string $id): RedirectResponse
    {
        $delivery = WebhookDeliveryModel::whereHas(
            'webhookDestination',
            fn ($q) => $q->where('tenant_id', $request->user()->tenant_id)
        )->with('webhookDestination')->findOrFail($id);

        if ($delivery->status !== 'failed') {
            return redirect()->back()->with('error', 'Only failed deliveries can be retried.');
        }

        DispatchWebhookJob::dispatch(
            $delivery->webhookDestination,
            $delivery->payload,
            $delivery->event,
        );

        return redirect()->back()->with('success', 'Webhook retry dispatched.');
    }
}
