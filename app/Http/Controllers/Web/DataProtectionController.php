<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DataProtectionController extends Controller
{
    public function edit(Request $request): Response
    {
        Gate::authorize('manageSettings');
        $tenantId = $request->user()->tenant_id;
        $tenantModel = TenantModel::find($tenantId);

        abort_if($tenantModel === null, 404);

        return Inertia::render('Settings/DataProtection/Index', [
            'dataProtection' => $tenantModel->data_protection,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        Gate::authorize('manageSettings');
        $tenantId = $request->user()->tenant_id;
        $tenantModel = TenantModel::find($tenantId);

        abort_if($tenantModel === null, 404);

        $validated = $request->validate([
            'consent_required' => 'boolean',
            'retention_days' => 'required|integer|in:30,60,90,180,365',
            'consent_message' => 'required_if:consent_required,true|string|max:500',
            'consent_recordings' => 'boolean',
            'consent_transcripts' => 'boolean',
        ]);

        $dp = $tenantModel->data_protection ?? [];
        $tenantModel->data_protection = array_merge($dp, $validated);
        $tenantModel->save();

        activity()
            ->performedOn($tenantModel)
            ->event('data_protection_updated')
            ->log('Data protection settings updated');

        return redirect()->route('settings.data-protection')
            ->with('success', 'Data protection settings saved.');
    }
}
