<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDeliveryModel;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WebhookDeliveryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = WebhookDeliveryModel::query()
            ->whereHas('webhookDestination', fn ($q) => $q->where('tenant_id', $request->user()->tenant_id))
            ->with('webhookDestination')
            ->orderBy('created_at', 'desc');

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        if ($event = $request->get('event')) {
            $query->where('event', $event);
        }

        $stats = (clone $query)->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
        ")->first();

        return Inertia::render('WebhookDeliveries/Index', [
            'deliveries' => $query->paginate(20),
            'stats' => $stats,
            'filters' => $request->only(['status', 'event']),
            'destinations' => WebhookDestinationModel::where('tenant_id', $request->user()->tenant_id)
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
}
