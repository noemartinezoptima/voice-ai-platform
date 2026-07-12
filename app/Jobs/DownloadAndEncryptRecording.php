<?php

namespace App\Jobs;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\RecordingEncryptionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Client\Response;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DownloadAndEncryptRecording implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public CallModel $call,
        public string $recordingUrl,
    ) {}

    public function handle(): void
    {
        $tenant = TenantModel::find($this->call->tenant_id);

        if ($tenant === null) {
            throw new \RuntimeException("Tenant not found for call {$this->call->id}");
        }

        $settings = $tenant->settings ?? [];
        $oauth = $settings['twilio_oauth'] ?? null;

        $response = match (true) {
            $this->hasOAuthCredentials($oauth) => $this->downloadWithOAuth($oauth),
            ! empty($settings['twilio_account_sid']) && ! empty($settings['twilio_auth_token']) => Http::withBasicAuth(
                $settings['twilio_account_sid'],
                $settings['twilio_auth_token']
            )->get($this->recordingUrl),
            default => throw new \RuntimeException('No Twilio credentials configured for tenant '.$tenant->id),
        };

        if ($response->failed()) {
            throw new \RuntimeException(
                "Failed to download recording from Twilio: {$response->status()} {$response->body()}"
            );
        }

        $tempPath = tempnam(sys_get_temp_dir(), 'recording_');

        if ($tempPath === false) {
            throw new \RuntimeException('Failed to create temporary file for recording download.');
        }

        try {
            file_put_contents($tempPath, $response->body());

            $recordingPath = $this->call->tenant_id.'/'.$this->call->id.'.enc';
            $destinationPath = Storage::disk('recordings')->path($recordingPath);
            $directory = dirname($destinationPath);

            if (! is_dir($directory) && ! mkdir($directory, 0755, true) && ! is_dir($directory)) {
                throw new \RuntimeException("Failed to create recordings directory: {$directory}");
            }

            $service = RecordingEncryptionService::make();
            $service->encryptFile($tempPath, $destinationPath);

            $this->call->recording_path = $recordingPath;
            $this->call->save();
        } finally {
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }
        }
    }

    public function failed(?\Throwable $exception = null): void
    {
        Log::error('Download and encrypt recording job failed', [
            'call_id' => $this->call->id,
            'recording_url' => $this->recordingUrl,
            'error' => $exception?->getMessage(),
        ]);
    }

    /**
     * @param  array<string, mixed>|null  $oauth
     */
    private function hasOAuthCredentials(?array $oauth): bool
    {
        if ($oauth === null || empty($oauth['access_token'])) {
            return false;
        }

        try {
            $token = Crypt::decryptString($oauth['access_token']);

            return $token !== '';
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * @param  array<string, mixed>  $oauth
     */
    private function downloadWithOAuth(array $oauth): Response
    {
        $token = Crypt::decryptString($oauth['access_token']);

        return Http::withToken($token)->get($this->recordingUrl);
    }
}
