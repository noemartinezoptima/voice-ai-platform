<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\ErrorEventModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ErrorMonitoringController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('manageSettings');

        $filter = $request->query('filter', 'unresolved');

        $query = ErrorEventModel::query()->recent();

        if ($filter === 'unresolved') {
            $query->unresolved();
        } elseif ($filter === 'resolved') {
            $query->resolved();
        }

        $errors = $query->orderByDesc('occurrence_count')->paginate(20);

        return Inertia::render('Settings/Errors/Index', [
            'errors' => $errors,
            'stats' => [
                'total' => ErrorEventModel::count(),
                'unresolved' => ErrorEventModel::unresolved()->count(),
                'today' => ErrorEventModel::whereDate('last_seen_at', today())->count(),
                'this_week' => ErrorEventModel::whereDate('last_seen_at', '>=', now()->startOfWeek())->count(),
            ],
            'filter' => $filter,
        ]);
    }

    public function show(string $hash): Response
    {
        Gate::authorize('manageSettings');

        $error = ErrorEventModel::where('hash', $hash)->firstOrFail();

        return Inertia::render('Settings/Errors/Show', [
            'error' => $error,
        ]);
    }

    public function resolve(string $hash): RedirectResponse
    {
        Gate::authorize('manageSettings');

        $error = ErrorEventModel::where('hash', $hash)->firstOrFail();
        $error->update(['resolved_at' => now()]);

        activity()
            ->withProperty('error_hash', $hash)
            ->withProperty('error_class', $error->class)
            ->log('Resolved error event');

        return redirect()->route('settings.errors.index')
            ->with('success', 'Error marked as resolved.');
    }
}
