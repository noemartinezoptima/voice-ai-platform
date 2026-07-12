<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class PrivacyController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('manageSettings');
        $tenantId = $request->user()->tenant_id;

        $totalCalls = \DB::table('calls')->where('tenant_id', $tenantId)->count();
        $totalUsers = \DB::table('users')->where('tenant_id', $tenantId)->count();
        $totalFlows = \DB::table('flows')->where('tenant_id', $tenantId)->count();
        $oldestCall = \DB::table('calls')
            ->where('tenant_id', $tenantId)
            ->orderBy('created_at')
            ->first();

        $tenant = TenantModel::find($tenantId);

        $consentLogs = Activity::where('event', 'like', 'consent_%')
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Settings/Privacy/Index', [
            'summary' => [
                'total_calls' => $totalCalls,
                'total_users' => $totalUsers,
                'total_flows' => $totalFlows,
                'oldest_data' => $oldestCall?->created_at,
            ],
            'dataProtection' => $tenant->data_protection,
            'consentLogs' => $consentLogs,
        ]);
    }
}
