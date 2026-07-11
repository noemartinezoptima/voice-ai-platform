<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DataExportController extends Controller
{
    public function export(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        if (! $request->user()->isOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $tenant = TenantModel::find($tenantId);

        $calls = DB::table('calls')
            ->where('tenant_id', $tenantId)
            ->get(['call_sid', 'from_number', 'to_number', 'duration_seconds', 'status', 'created_at']);

        $flows = DB::table('flows')
            ->where('tenant_id', $tenantId)
            ->get(['name', 'status', 'created_at']);

        $users = DB::table('users')
            ->where('tenant_id', $tenantId)
            ->get(['id', 'name', 'email', 'role']);

        activity()
            ->event('data_exported')
            ->withProperties([
                'calls_count' => $calls->count(),
                'requested_by' => $request->user()->id,
            ])
            ->log('Tenant data exported');

        return response()->json([
            'exported_at' => now()->toIso8601String(),
            'tenant' => [
                'name' => $tenant->name,
                'plan' => $tenant->plan ?? 'free',
                'created_at' => $tenant->created_at,
            ],
            'calls' => $calls,
            'flows' => $flows,
            'users' => $users,
        ]);
    }
}
