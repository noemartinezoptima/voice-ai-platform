<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;

class ElevenLabsConnectController extends Controller
{
    public function connect(Request $request): JsonResponse
    {
        if (! $request->user()->isOwner()) {
            abort(403);
        }

        $request->validate([
            'api_key' => 'required|string|min:20',
        ]);

        $apiKey = $request->input('api_key');

        $userResponse = Http::withHeaders(['xi-api-key' => $apiKey])
            ->timeout(10)
            ->get('https://api.elevenlabs.io/v1/user');

        if ($userResponse->status() === 401) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid API key. Please check and try again.',
            ], 422);
        }

        if (! $userResponse->successful()) {
            return response()->json([
                'success' => false,
                'error' => 'Could not connect to ElevenLabs. Please try again.',
            ], 422);
        }

        $userData = $userResponse->json();

        $subResponse = Http::withHeaders(['xi-api-key' => $apiKey])
            ->timeout(10)
            ->get('https://api.elevenlabs.io/v1/user/subscription');

        $subData = $subResponse->json() ?? [];

        $tenant = TenantModel::find($request->user()->tenant_id);
        $settings = $tenant->settings ?? [];

        $isRotation = isset($settings['elevenlabs_api_key']);

        $settings['elevenlabs_api_key'] = Crypt::encryptString($apiKey);
        $settings['elevenlabs_account_id'] = $userData['subscription']['tier'] ?? null;
        $settings['elevenlabs_subscription_tier'] = $subData['tier'] ?? 'unknown';
        $settings['elevenlabs_character_count'] = $subData['character_count'] ?? 0;
        $settings['elevenlabs_character_limit'] = $subData['character_limit'] ?? 0;
        $settings['elevenlabs_connected_at'] = now()->toIso8601String();
        $settings['elevenlabs_health_status'] = null;
        $tenant->settings = $settings;
        $tenant->save();

        activity()
            ->event($isRotation ? 'elevenlabs_key_rotated' : 'elevenlabs_connected')
            ->performedOn($tenant)
            ->withProperties(['account_id' => $userData['xi_api_key_preview'] ?? null])
            ->log($isRotation ? 'ElevenLabs API key rotated' : 'ElevenLabs account connected');

        return response()->json([
            'success' => true,
            'account' => [
                'user_id' => $userData['xi_api_key_preview'] ?? null,
                'tier' => $subData['tier'] ?? 'unknown',
                'character_count' => $subData['character_count'] ?? 0,
                'character_limit' => $subData['character_limit'] ?? 0,
            ],
        ]);
    }

    public function status(Request $request): JsonResponse
    {
        if (! $request->user()->isOwner()) {
            abort(403);
        }

        $tenant = TenantModel::find($request->user()->tenant_id);
        $settings = $tenant->settings ?? [];

        if (! isset($settings['elevenlabs_api_key'])) {
            return response()->json(['connected' => false]);
        }

        return response()->json([
            'connected' => true,
            'account' => [
                'tier' => $settings['elevenlabs_subscription_tier'] ?? 'unknown',
                'character_count' => $settings['elevenlabs_character_count'] ?? 0,
                'character_limit' => $settings['elevenlabs_character_limit'] ?? 0,
                'connected_at' => $settings['elevenlabs_connected_at'] ?? null,
                'health_status' => $settings['elevenlabs_health_status'] ?? null,
            ],
        ]);
    }
}
