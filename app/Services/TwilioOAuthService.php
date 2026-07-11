<?php

namespace App\Services;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TwilioOAuthService
{
    public function getValidAccessToken(TenantModel $tenant): ?string
    {
        $oauth = $tenant->settings['twilio_oauth'] ?? null;
        if ($oauth === null) {
            return null;
        }

        if (($oauth['expires_at'] ?? 0) - 300 > now()->timestamp) {
            return Crypt::decryptString($oauth['access_token']);
        }

        $response = Http::asForm()->post(config('twilio-oauth.token_url'), [
            'client_id' => config('twilio-oauth.client_id'),
            'client_secret' => config('twilio-oauth.client_secret'),
            'grant_type' => 'refresh_token',
            'refresh_token' => Crypt::decryptString($oauth['refresh_token']),
        ]);

        if (! $response->successful()) {
            Log::warning('Twilio OAuth refresh failed', [
                'tenant_id' => $tenant->id,
                'status' => $response->status(),
            ]);

            $settings = $tenant->settings;
            unset($settings['twilio_oauth']);
            $settings['twilio_oauth_enabled'] = false;
            $tenant->settings = $settings;
            $tenant->save();

            return null;
        }

        $data = $response->json();
        $oauth['access_token'] = Crypt::encryptString($data['access_token']);
        $oauth['expires_at'] = now()->addSeconds($data['expires_in'])->timestamp;
        if (isset($data['refresh_token'])) {
            $oauth['refresh_token'] = Crypt::encryptString($data['refresh_token']);
        }

        $settings = $tenant->settings;
        $settings['twilio_oauth'] = $oauth;
        $tenant->settings = $settings;
        $tenant->save();

        return $data['access_token'];
    }
}
