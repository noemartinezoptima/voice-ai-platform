<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Laravel\Cashier\Checkout;

class StripeController extends Controller
{
    public function checkout(Request $request): Checkout|RedirectResponse
    {
        Gate::authorize('manageBilling');

        $validated = $request->validate([
            'plan' => ['required', 'string', Rule::in(['pro', 'enterprise'])],
        ]);

        $priceId = config("stripe.prices.{$validated['plan']}_monthly");

        if (! $priceId) {
            return redirect()->route('billing.index')
                ->with('error', 'Stripe price not configured for this plan.');
        }

        /** @var TenantModel $tenant */
        $tenant = TenantModel::findOrFail($request->user()->tenant_id);

        return $tenant->newSubscription('default', $priceId)
            ->allowPromotionCodes()
            ->checkout([
                'success_url' => route('billing.index').'?checkout=success',
                'cancel_url' => route('billing.index').'?checkout=cancelled',
            ]);
    }

    public function portal(Request $request): RedirectResponse
    {
        Gate::authorize('manageBilling');

        /** @var TenantModel $tenant */
        $tenant = TenantModel::findOrFail($request->user()->tenant_id);

        return $tenant->redirectToBillingPortal(route('billing.index'));
    }
}
