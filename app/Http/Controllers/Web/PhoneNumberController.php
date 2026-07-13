<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\TwilioPhoneService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PhoneNumberController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('manageSettings');

        $tenant = TenantModel::find($request->user()->tenant_id);

        abort_if($tenant === null, 404);

        $service = TwilioPhoneService::forTenant($tenant);
        $connected = $service->hasCredentials();
        $numbers = [];
        $error = null;

        if ($connected) {
            try {
                $numbers = $service->listOwned();
            } catch (\Exception $e) {
                $error = $e->getMessage();
            }
        }

        $flows = FlowModel::where('tenant_id', $tenant->id)
            ->whereNotNull('phone_number')
            ->where('phone_number', '!=', '')
            ->get(['id', 'name', 'phone_number'])
            ->map(fn (FlowModel $flow) => [
                'id' => $flow->id,
                'name' => $flow->name,
                'phone_number' => $flow->phone_number,
            ])
            ->values();

        return Inertia::render('Settings/PhoneNumbers/Index', [
            'connected' => $connected,
            'numbers' => $numbers,
            'flows' => $flows,
            'error' => $error,
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        Gate::authorize('manageSettings');

        $validated = $request->validate([
            'country' => ['sometimes', 'string', 'in:US,MX,GB,CA,AU'],
            'area_code' => ['sometimes', 'string', 'nullable'],
            'contains' => ['sometimes', 'string', 'nullable'],
        ]);

        $tenant = TenantModel::find($request->user()->tenant_id);

        abort_if($tenant === null, 404);

        $service = TwilioPhoneService::forTenant($tenant);

        if (! $service->hasCredentials()) {
            return response()->json(['error' => 'Twilio credentials not configured.'], 422);
        }

        $options = [];

        if (! empty($validated['area_code'])) {
            $options['AreaCode'] = $validated['area_code'];
        }

        if (! empty($validated['contains'])) {
            $options['Contains'] = $validated['contains'];
        }

        $results = $service->searchAvailable($validated['country'] ?? 'US', $options);

        return response()->json(['numbers' => $results]);
    }

    public function buy(Request $request): RedirectResponse
    {
        Gate::authorize('manageSettings');

        $validated = $request->validate([
            'phone_number' => ['required', 'string'],
        ]);

        $tenant = TenantModel::find($request->user()->tenant_id);

        abort_if($tenant === null, 404);

        $service = TwilioPhoneService::forTenant($tenant);

        if (! $service->hasCredentials()) {
            return redirect()->route('settings.phone-numbers')
                ->with('error', 'Twilio credentials not configured.');
        }

        try {
            $result = $service->buy($validated['phone_number']);
        } catch (\RuntimeException $e) {
            return redirect()->route('settings.phone-numbers')
                ->with('error', $e->getMessage());
        }

        $settings = $tenant->settings;

        if (empty($settings['twilio_phone_number'])) {
            $settings['twilio_phone_number'] = $result['phone_number'];
            $tenant->settings = $settings;
            $tenant->save();
        }

        activity()
            ->event('phone_number_purchased')
            ->performedOn($tenant)
            ->withProperties(['phone_number' => $result['phone_number']])
            ->log("Phone number {$result['phone_number']} purchased");

        return redirect()->route('settings.phone-numbers')
            ->with('success', "Phone number {$result['phone_number']} purchased.");
    }

    public function release(Request $request): RedirectResponse
    {
        Gate::authorize('manageSettings');

        $validated = $request->validate([
            'sid' => ['required', 'string'],
            'phone_number' => ['sometimes', 'string', 'nullable'],
        ]);

        $tenant = TenantModel::find($request->user()->tenant_id);

        abort_if($tenant === null, 404);

        $service = TwilioPhoneService::forTenant($tenant);

        if (! $service->hasCredentials()) {
            return redirect()->route('settings.phone-numbers')
                ->with('error', 'Twilio credentials not configured.');
        }

        try {
            $service->release($validated['sid']);
        } catch (\Exception $e) {
            return redirect()->route('settings.phone-numbers')
                ->with('error', $e->getMessage());
        }

        if (! empty($validated['phone_number'])) {
            FlowModel::where('tenant_id', $tenant->id)
                ->where('phone_number', $validated['phone_number'])
                ->update(['phone_number' => null]);
        }

        $settings = $tenant->settings;

        if (($settings['twilio_phone_number'] ?? null) === ($validated['phone_number'] ?? null)) {
            $settings['twilio_phone_number'] = null;
            $tenant->settings = $settings;
            $tenant->save();
        }

        activity()
            ->event('phone_number_released')
            ->performedOn($tenant)
            ->withProperties(['phone_number' => $validated['phone_number'] ?? null, 'sid' => $validated['sid']])
            ->log("Phone number {$validated['sid']} released");

        return redirect()->route('settings.phone-numbers')
            ->with('success', 'Phone number released.');
    }
}
