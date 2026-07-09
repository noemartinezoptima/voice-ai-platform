<?php

namespace App\Http\Controllers\Web;

use App\Domain\Billing\PlanDefinitions;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var TenantModel $tenant */
        $tenant = TenantModel::findOrFail($request->user()->tenant_id);

        $currentPlan = PlanDefinitions::find($tenant->plan) ?? PlanDefinitions::find('free');
        $allPlans = PlanDefinitions::all();

        return Inertia::render('Billing/Index', [
            'tenant' => $tenant,
            'currentPlan' => $currentPlan,
            'plans' => $allPlans,
        ]);
    }

    public function updatePlan(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'string', 'in:free,pro,enterprise'],
        ]);

        /** @var TenantModel $tenant */
        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $tenant->update(['plan' => $validated['plan']]);

        return redirect()->route('billing.index')
            ->with('success', 'Plan updated to '.ucfirst($validated['plan']).'.');
    }
}
