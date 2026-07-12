<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
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
        ]);

        WebhookDestinationModel::create([
            'tenant_id' => $request->user()->tenant_id,
            'url' => $validated['url'],
            'events' => $validated['events'],
            'description' => $validated['description'] ?? null,
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
}
