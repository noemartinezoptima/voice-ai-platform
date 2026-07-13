<?php

namespace App\Jobs;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\RecordingEncryptionService;
use App\Services\TranscriptionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Client\Response;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranscribeRecording implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public CallModel $call,
    ) {}

    public function handle(): void
    {
        if (! config('transcription.deepgram.api_key') && ! config('transcription.openai.api_key')) {
            Log::info('Transcription skipped — no API keys configured', [
                'call_id' => $this->call->id,
            ]);

            return;
        }

        $audioData = $this->getAudioData();

        if ($audioData === null) {
            Log::warning('No audio data available for transcription', [
                'call_id' => $this->call->id,
            ]);

            return;
        }

        $service = new TranscriptionService;
        $segments = $service->transcribeAudioData($audioData);

        foreach ($segments as $segment) {
            TranscriptModel::create([
                'call_id' => $this->call->id,
                'role' => $segment['speaker'],
                'text' => $segment['text'],
                'start_offset_ms' => (int) ($segment['start'] * 1000),
                'end_offset_ms' => (int) ($segment['end'] * 1000),
                'confidence' => $segment['confidence'],
            ]);
        }

        $context = $this->call->context ?? [];
        $context['transcription_completed'] = true;
        $this->call->context = $context;
        $this->call->save();

        Log::info('Transcription completed', [
            'call_id' => $this->call->id,
            'segments' => count($segments),
        ]);
    }

    public function failed(?\Throwable $exception = null): void
    {
        Log::error('Transcribe recording job failed', [
            'call_id' => $this->call->id,
            'error' => $exception?->getMessage(),
        ]);
    }

    private function getAudioData(): ?string
    {
        if ($this->call->recording_path) {
            return $this->getLocalAudioData();
        }

        if ($this->call->recording_url) {
            return $this->downloadFromTwilio();
        }

        return null;
    }

    private function getLocalAudioData(): string
    {
        $path = storage_path("app/recordings/{$this->call->recording_path}");

        if (! file_exists($path)) {
            throw new \RuntimeException("Recording file not found: {$path}");
        }

        $service = RecordingEncryptionService::make();
        $stream = $service->decryptStream($path);
        $data = stream_get_contents($stream);
        fclose($stream);

        if ($data === false) {
            throw new \RuntimeException("Failed to read decrypted recording: {$path}");
        }

        return $data;
    }

    private function downloadFromTwilio(): ?string
    {
        $tenant = TenantModel::find($this->call->tenant_id);

        if ($tenant === null) {
            Log::warning('Tenant not found for call', ['call_id' => $this->call->id]);

            return null;
        }

        $settings = $tenant->settings ?? [];
        $oauth = $settings['twilio_oauth'] ?? null;

        $response = match (true) {
            $this->hasOAuthCredentials($oauth) => $this->downloadWithOAuth($oauth),
            ! empty($settings['twilio_account_sid']) && ! empty($settings['twilio_auth_token']) => Http::withBasicAuth(
                $settings['twilio_account_sid'],
                $settings['twilio_auth_token']
            )->get($this->call->recording_url),
            default => null,
        };

        if ($response === null) {
            Log::warning('No Twilio credentials configured for transcription', [
                'call_id' => $this->call->id,
                'tenant_id' => $this->call->tenant_id,
            ]);

            return null;
        }

        if ($response->failed()) {
            Log::warning('Failed to download recording for transcription', [
                'call_id' => $this->call->id,
                'status' => $response->status(),
            ]);

            return null;
        }

        return $response->body();
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

        return Http::withToken($token)->get($this->call->recording_url);
    }
}
