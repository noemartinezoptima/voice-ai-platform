<?php

namespace App\Http\Controllers\Web;

use App\Domain\Billing\PlanDefinitions;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewBilling');
        /** @var TenantModel $tenant */
        $tenant = TenantModel::findOrFail($request->user()->tenant_id);

        $currentPlan = PlanDefinitions::find($tenant->plan) ?? PlanDefinitions::find('free');
        $allPlans = PlanDefinitions::all();

        return Inertia::render('Billing/Index', [
            'tenant' => $tenant,
            'currentPlan' => $currentPlan,
            'plans' => $allPlans,
            'checkout' => $request->query('checkout'),
        ]);
    }

    public function updatePlan(Request $request): RedirectResponse
    {
        Gate::authorize('manageBilling');
        $validated = $request->validate([
            'plan' => ['required', 'string', 'in:free,pro,enterprise'],
        ]);

        /** @var TenantModel $tenant */
        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $previousPlan = $tenant->plan;
        $tenant->update(['plan' => $validated['plan']]);

        activity('billing')
            ->causedBy($request->user())
            ->event('plan_changed')
            ->withProperties(['from' => $previousPlan, 'to' => $validated['plan']])
            ->log(":causer.name cambió el plan de {$previousPlan} a {$validated['plan']}");

        return redirect()->route('billing.index')
            ->with('success', 'Plan updated to '.ucfirst($validated['plan']).'.');
    }
}
