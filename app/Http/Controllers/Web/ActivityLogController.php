<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAuditLog');

        $query = Activity::query()
            ->with('causer')
            ->latest();

        if ($request->filled('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        if ($request->filled('search')) {
            $query->where('description', 'like', '%'.$request->search.'%');
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $activities = $query->paginate(15)->through(function (Activity $item) {
            /** @var User|null $causer */
            $causer = $item->causer;

            return [
                'id' => $item->id,
                'log_name' => $item->log_name,
                'event' => $item->event,
                'description' => $item->description,
                'causer' => $causer ? ['name' => $causer->name, 'email' => $causer->email] : null,
                'properties' => $item->properties?->toArray() ?? [],
                'created_at' => $item->created_at->diffForHumans(),
                'created_at_exact' => $item->created_at->toDateTimeString(),
            ];
        });

        return Inertia::render('Settings/Activity/Index', [
            'activities' => $activities,
            'filters' => $request->only(['log_name', 'search', 'from', 'to']),
        ]);
    }
}
