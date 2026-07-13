<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use App\Jobs\DispatchWebhookJob;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WebhookDestinationController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('manageWebhooks');
        $webhooks = WebhookDestinationModel::where('tenant_id', $request->user()->tenant_id)
            ->with(['deliveries' => function ($query) {
                $query->latest()->limit(10);
            }])
            ->withCount('deliveries')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Settings/Webhooks/Index', [
            'webhooks' => $webhooks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('manageWebhooks');
        $validated = $request->validate([
            'url' => ['required', 'url', 'max:2048'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['required', 'string', 'in:call.initiated,call.in_progress,call.completed,call.failed,call.transferred'],
            'description' => ['nullable', 'string', 'max:255'],
            'sign_secret' => ['nullable', 'string', 'max:255'],
        ]);

        $settings = [];
        if (! empty($validated['sign_secret'] ?? null)) {
            $settings['signing_secret'] = $validated['sign_secret'];
        }

        WebhookDestinationModel::create([
            'tenant_id' => $request->user()->tenant_id,
            'url' => $validated['url'],
            'events' => $validated['events'],
            'description' => $validated['description'] ?? null,
            'settings' => $settings,
        ]);

        return redirect()->route('settings.webhooks.index')
            ->with('success', 'Webhook destination added.');
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        Gate::authorize('manageWebhooks');
        $webhook = WebhookDestinationModel::where('tenant_id', $request->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'url' => ['required', 'url', 'max:2048'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['required', 'string', 'in:call.initiated,call.in_progress,call.completed,call.failed,call.transferred'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $webhook->update($validated);

        return redirect()->route('settings.webhooks.index')
            ->with('success', 'Webhook destination updated.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        Gate::authorize('manageWebhooks');
        WebhookDestinationModel::where('tenant_id', $request->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail()
            ->delete();

        return redirect()->route('settings.webhooks.index')
            ->with('success', 'Webhook destination removed.');
    }

    public function test(Request $request, WebhookDestinationModel $webhook): RedirectResponse
    {
        abort_if($webhook->tenant_id !== $request->user()->tenant_id, 404);

        DispatchWebhookJob::dispatch($webhook, [
            'event' => 'test.ping',
            'timestamp' => now()->toIso8601String(),
            'data' => ['message' => 'Webhook test from Voice AI Platform'],
        ], 'test.ping');

        return redirect()->route('settings.webhooks.index')
            ->with('success', 'Test webhook dispatched.');
    }
}
