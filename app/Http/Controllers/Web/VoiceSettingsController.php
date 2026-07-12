<?php

namespace App\Http\Controllers\Web;

use App\Domain\Tenant\Entities\Tenant;
use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\VoiceSettingsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VoiceSettingsController extends Controller
{
    public function __construct(
        private readonly TenantRepositoryInterface $tenantRepository,
    ) {}

    public function edit(Request $request): Response
    {
        Gate::authorize('manageSettings');
        $tenant = $this->tenantRepository->findById($request->user()->tenant_id);

        abort_if($tenant === null, 404);

        $settings = $tenant->settings();

        return Inertia::render('Settings/Voice', [
            'settings' => [
                'default_tts_provider' => $settings['default_tts_provider'] ?? 'elevenlabs',
                'default_language' => $settings['default_language'] ?? 'en',
                'elevenlabs_voice_id' => $settings['elevenlabs_default_voice_id'] ?? '',
                'tts_speed' => (float) ($settings['tts_speed'] ?? 1.0),
                'voice_stability' => (float) ($settings['voice_stability'] ?? 0.5),
                'voice_similarity_boost' => (float) ($settings['voice_similarity_boost'] ?? 0.75),
            ],
        ]);
    }

    public function update(VoiceSettingsRequest $request): RedirectResponse
    {
        Gate::authorize('manageSettings');
        $existing = $this->tenantRepository->findById($request->user()->tenant_id);

        abort_if($existing === null, 404);

        $settings = $existing->settings();
        $settings['default_tts_provider'] = $request->default_tts_provider;
        $settings['default_language'] = $request->default_language;
        $settings['elevenlabs_default_voice_id'] = $request->elevenlabs_voice_id;
        $settings['tts_speed'] = (float) $request->tts_speed;
        $settings['voice_stability'] = (float) $request->voice_stability;
        $settings['voice_similarity_boost'] = (float) $request->voice_similarity_boost;

        $updated = new Tenant(
            id: $existing->id(),
            name: $existing->name(),
            slug: $existing->slug(),
            settings: $settings,
            isActive: $existing->isActive(),
        );

        $this->tenantRepository->save($updated);

        return redirect()->route('settings.voice')
            ->with('success', 'Voice settings saved.');
    }
}
