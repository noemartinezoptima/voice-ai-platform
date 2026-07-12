<?php

namespace App\Console\Commands;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use App\Notifications\ElevenLabsKeyInvalid;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ElevenLabsHealthCheck extends Command
{
    protected $signature = 'elevenlabs:health-check';

    protected $description = 'Check health of all connected ElevenLabs API keys';

    public function handle(): int
    {
        $tenants = TenantModel::whereNotNull('settings->elevenlabs_api_key')->get();

        foreach ($tenants as $tenant) {
            try {
                $apiKey = Crypt::decryptString($tenant->settings['elevenlabs_api_key']);

                $response = Http::withHeaders(['xi-api-key' => $apiKey])
                    ->timeout(10)
                    ->get('https://api.elevenlabs.io/v1/user');

                if ($response->status() === 401) {
                    $settings = $tenant->settings;
                    $settings['elevenlabs_health_status'] = 'invalid';
                    $tenant->settings = $settings;
                    $tenant->save();

                    $owner = User::where('tenant_id', $tenant->id)->where('role', 'owner')->first();
                    if ($owner !== null) {
                        $owner->notify(new ElevenLabsKeyInvalid($tenant->name));
                    }

                    activity()
                        ->event('elevenlabs_key_invalid')
                        ->performedOn($tenant)
                        ->log('ElevenLabs API key is invalid');

                    $this->warn("Invalid key for tenant: {$tenant->name}");
                } elseif ($response->successful()) {
                    $subResponse = Http::withHeaders(['xi-api-key' => $apiKey])
                        ->timeout(10)
                        ->get('https://api.elevenlabs.io/v1/user/subscription');

                    $subData = $subResponse->json() ?? [];
                    $settings = $tenant->settings;
                    $settings['elevenlabs_character_count'] = $subData['character_count'] ?? 0;
                    $settings['elevenlabs_character_limit'] = $subData['character_limit'] ?? 0;
                    $settings['elevenlabs_subscription_tier'] = $subData['tier'] ?? 'unknown';
                    $settings['elevenlabs_health_status'] = null;
                    $tenant->settings = $settings;
                    $tenant->save();
                }
            } catch (\Throwable $e) {
                Log::warning('ElevenLabs health check failed', [
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Checked {$tenants->count()} ElevenLabs connections.");

        return self::SUCCESS;
    }
}
