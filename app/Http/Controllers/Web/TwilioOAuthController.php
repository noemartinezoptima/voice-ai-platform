<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TwilioOAuthController extends Controller
{
    public function callback(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'state' => 'required|string',
        ]);

        try {
            $state = json_decode(Crypt::decryptString($request->input('state')), true);
        } catch (\Throwable) {
            return redirect()->route('settings.tenant')
                ->with('error', 'Authorization expired. Please try again.');
        }

        if (($state['tenant_id'] ?? null) !== $request->user()->tenant_id
            || ($state['user_id'] ?? null) !== $request->user()->id) {
            return redirect()->route('settings.tenant')
                ->with('error', 'Invalid authorization request.');
        }

        if (! $request->user()->isOwner()) {
            abort(403);
        }

        $tokenResponse = Http::asForm()->post(config('twilio-oauth.token_url'), [
            'client_id' => config('twilio-oauth.client_id'),
            'client_secret' => config('twilio-oauth.client_secret'),
            'grant_type' => 'authorization_code',
            'code' => $request->input('code'),
            'redirect_uri' => config('twilio-oauth.redirect_url'),
        ]);

        if (! $tokenResponse->successful()) {
            Log::warning('Twilio OAuth token exchange failed', [
                'status' => $tokenResponse->status(),
                'body' => $tokenResponse->body(),
            ]);

            return redirect()->route('settings.tenant')
                ->with('error', 'Twilio authorization failed. Please try again.');
        }

        $tokenData = $tokenResponse->json();

        $accountResponse = Http::withToken($tokenData['access_token'])
            ->get('https://api.twilio.com/2010-04-01/Accounts/me.json');

        $accountSid = $accountResponse->json('sid') ?? null;

        $tenant = TenantModel::find($request->user()->tenant_id);
        $settings = $tenant->settings ?? [];
        $settings['twilio_oauth'] = [
            'access_token' => Crypt::encryptString($tokenData['access_token']),
            'refresh_token' => Crypt::encryptString($tokenData['refresh_token']),
            'expires_at' => now()->addSeconds($tokenData['expires_in'])->timestamp,
            'account_sid' => $accountSid,
            'connected_at' => now()->toIso8601String(),
        ];
        $settings['twilio_oauth_enabled'] = true;
        $tenant->settings = $settings;
        $tenant->save();

        activity()
            ->event('twilio_oauth_connected')
            ->performedOn($tenant)
            ->withProperties(['account_sid' => $accountSid])
            ->log('Twilio OAuth account connected');

        return redirect()->route('settings.tenant')
            ->with('success', 'Twilio account connected successfully.');
    }

    public function disconnect(Request $request)
    {
        $tenant = TenantModel::find($request->user()->tenant_id);
        $settings = $tenant->settings ?? [];
        $oauth = $settings['twilio_oauth'] ?? null;

        if ($oauth !== null) {
            try {
                $accessToken = Crypt::decryptString($oauth['access_token']);
                Http::asForm()->post(config('twilio-oauth.revoke_url'), [
                    'token' => $accessToken,
                ]);
            } catch (\Throwable) {
                // Best-effort revocation
            }
        }

        unset($settings['twilio_oauth']);
        $settings['twilio_oauth_enabled'] = false;
        $tenant->settings = $settings;
        $tenant->save();

        activity()
            ->event('twilio_oauth_disconnected')
            ->performedOn($tenant)
            ->log('Twilio OAuth account disconnected');

        return redirect()->route('settings.tenant')
            ->with('success', 'Twilio account disconnected.');
    }
}
