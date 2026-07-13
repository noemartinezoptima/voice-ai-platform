<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\ScheduledCallModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ScheduledCallController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $calls = ScheduledCallModel::where('tenant_id', $tenantId)
            ->with('flow')
            ->orderBy('scheduled_at', 'desc')
            ->paginate(20);

        $flows = FlowModel::where('tenant_id', $tenantId)
            ->orderBy('name')
            ->get(['id', 'name', 'phone_number']);

        return Inertia::render('Calls/Scheduled/Index', [
            'calls' => $calls,
            'flows' => $flows,
            'stats' => [
                'pending' => ScheduledCallModel::where('tenant_id', $tenantId)->where('status', 'pending')->count(),
                'dueToday' => ScheduledCallModel::where('tenant_id', $tenantId)->where('status', 'pending')->whereDate('scheduled_at', today())->count(),
                'completedToday' => ScheduledCallModel::where('tenant_id', $tenantId)->where('status', 'completed')->whereDate('last_triggered_at', today())->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'flow_id' => ['required', 'uuid', 'exists:flows,id'],
            'phone_number' => ['required', 'string', 'max:20'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'frequency' => ['required', 'in:once,daily,weekly,monthly'],
            'timezone' => ['required', 'string', 'max:50'],
        ]);

        ScheduledCallModel::create([
            'tenant_id' => $request->user()->tenant_id,
            'flow_id' => $validated['flow_id'],
            'phone_number' => $validated['phone_number'],
            'scheduled_at' => Carbon::parse($validated['scheduled_at']),
            'frequency' => $validated['frequency'],
            'timezone' => $validated['timezone'],
            'status' => 'pending',
        ]);

        activity()
            ->event('call_scheduled')
            ->withProperties(['phone' => $validated['phone_number'], 'at' => $validated['scheduled_at']])
            ->log("Scheduled call to {$validated['phone_number']} at {$validated['scheduled_at']}");

        return redirect()->route('calls.scheduled')
            ->with('success', 'Call scheduled successfully.');
    }

    public function cancel(ScheduledCallModel $scheduled_call): RedirectResponse
    {
        abort_if($scheduled_call->tenant_id !== request()->user()->tenant_id, 404);
        abort_if($scheduled_call->status !== 'pending', 422);

        $scheduled_call->update(['status' => 'cancelled']);

        activity()
            ->event('call_unscheduled')
            ->log("Cancelled scheduled call to {$scheduled_call->phone_number}");

        return redirect()->route('calls.scheduled')
            ->with('success', 'Call cancelled.');
    }

    public function destroy(ScheduledCallModel $scheduled_call): RedirectResponse
    {
        abort_if($scheduled_call->tenant_id !== request()->user()->tenant_id, 404);
        abort_if($scheduled_call->status === 'in_progress', 422);

        $scheduled_call->delete();

        return redirect()->route('calls.scheduled')
            ->with('success', 'Scheduled call deleted.');
    }
}
