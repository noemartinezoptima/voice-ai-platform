<?php

namespace App\Http\Controllers\Web;

use App\Domain\Tenant\Entities\Tenant;
use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\TenantSettingsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TenantSettingsController extends Controller
{
    public function __construct(
        private readonly TenantRepositoryInterface $tenantRepository,
    ) {}

    private const MASK = '********';

    public function edit(Request $request): Response
    {
        Gate::authorize('manageSettings');
        $tenant = $this->tenantRepository->findById($request->user()->tenant_id);

        abort_if($tenant === null, 404);

        $settings = $tenant->settings();

        $state = Crypt::encryptString(json_encode([
            'tenant_id' => $request->user()->tenant_id,
            'user_id' => $request->user()->id,
            'created_at' => now()->timestamp,
        ]));

        $connectUrl = config('twilio-oauth.authorize_url').'?'.http_build_query([
            'client_id' => config('twilio-oauth.client_id'),
            'response_type' => 'code',
            'scope' => implode(' ', config('twilio-oauth.scopes')),
            'redirect_uri' => config('twilio-oauth.redirect_url'),
            'state' => $state,
        ]);

        return Inertia::render('Settings/Tenant', [
            'tenant' => [
                'id' => $tenant->id(),
                'name' => $tenant->name(),
                'slug' => $tenant->slug(),
                'timezone' => $settings['timezone'] ?? null,
                'default_language' => $settings['default_language'] ?? null,
                'is_active' => $tenant->isActive(),
                'twilio_account_sid' => $settings['twilio_account_sid'] ?? '',
                'twilio_auth_token' => isset($settings['twilio_auth_token']) ? self::MASK : '',
                'twilio_phone_number' => $settings['twilio_phone_number'] ?? '',
                'twilio_oauth_enabled' => $settings['twilio_oauth_enabled'] ?? false,
                'twilio_account_sid_oauth' => $settings['twilio_oauth']['account_sid'] ?? null,
                'twilio_connected_at' => $settings['twilio_oauth']['connected_at'] ?? null,
                'elevenlabs_api_key' => isset($settings['elevenlabs_api_key']) ? self::MASK : '',
                'elevenlabs_default_voice_id' => $settings['elevenlabs_default_voice_id'] ?? '',
                'elevenlabs_connected_at' => $settings['elevenlabs_connected_at'] ?? null,
                'elevenlabs_subscription_tier' => $settings['elevenlabs_subscription_tier'] ?? null,
                'elevenlabs_character_count' => $settings['elevenlabs_character_count'] ?? 0,
                'elevenlabs_character_limit' => $settings['elevenlabs_character_limit'] ?? 0,
                'connectUrl' => $connectUrl,
            ],
        ]);
    }

    public function update(TenantSettingsRequest $request): RedirectResponse
    {
        Gate::authorize('manageSettings');
        $existing = $this->tenantRepository->findById($request->user()->tenant_id);

        abort_if($existing === null, 404);

        $settings = $existing->settings();
        $settings['timezone'] = $request->timezone;
        $settings['default_language'] = $request->default_language;
        $settings['twilio_account_sid'] = $request->twilio_account_sid;
        $settings['twilio_phone_number'] = $request->twilio_phone_number;
        $settings['elevenlabs_default_voice_id'] = $request->elevenlabs_default_voice_id;

        if ($request->twilio_auth_token !== self::MASK) {
            $settings['twilio_auth_token'] = $request->twilio_auth_token;
        }

        if ($request->elevenlabs_api_key !== self::MASK) {
            $settings['elevenlabs_api_key'] = $request->elevenlabs_api_key;
        }

        $updated = new Tenant(
            id: $existing->id(),
            name: $request->name,
            slug: $request->slug,
            settings: $settings,
            isActive: $existing->isActive(),
        );

        $this->tenantRepository->save($updated);

        return redirect()->route('settings.tenant')
            ->with('success', 'Settings saved.');
    }
}
