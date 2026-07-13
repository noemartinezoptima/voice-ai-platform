<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranscriptionService
{
    /**
     * @param  string  $audioUrl  URL or path to audio file
     * @return array<int, array{speaker: string, text: string, start: float, end: float, confidence: float}>
     *
     * @throws \RuntimeException
     */
    public function transcribe(string $audioUrl, ?string $language = null): array
    {
        if (config('transcription.deepgram.api_key')) {
            return $this->transcribeWithDeepgram($audioUrl, $language);
        }

        if (config('transcription.openai.api_key')) {
            return $this->transcribeWithWhisper($audioUrl, $language);
        }

        throw new \RuntimeException('No transcription service configured. Set DEEPGRAM_API_KEY or OPENAI_API_KEY.');
    }

    /**
     * @param  string  $audioData  Raw audio binary content
     * @return array<int, array{speaker: string, text: string, start: float, end: float, confidence: float}>
     *
     * @throws \RuntimeException
     */
    public function transcribeAudioData(string $audioData, ?string $language = null): array
    {
        if (config('transcription.deepgram.api_key')) {
            return $this->transcribeAudioWithDeepgram($audioData, $language);
        }

        if (config('transcription.openai.api_key')) {
            return $this->transcribeAudioWithWhisper($audioData, $language);
        }

        throw new \RuntimeException('No transcription service configured. Set DEEPGRAM_API_KEY or OPENAI_API_KEY.');
    }

    /**
     * Transcribe via Deepgram using an audio URL as the source.
     *
     * @return array<int, array{speaker: string, text: string, start: float, end: float, confidence: float}>
     *
     * @throws \RuntimeException
     */
    private function transcribeWithDeepgram(string $audioUrl, ?string $language = null): array
    {
        $apiKey = config('transcription.deepgram.api_key');
        $model = config('transcription.deepgram.model', 'nova-2-general');
        $defaultLang = config('transcription.deepgram.language', 'en');

        $queryParams = http_build_query([
            'model' => $model,
            'smart_format' => 'true',
            'diarize' => 'true',
            'language' => $language ?? $defaultLang,
        ]);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Token {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(120)
                ->connectTimeout(30)
                ->post("https://api.deepgram.com/v1/listen?{$queryParams}", [
                    'url' => $audioUrl,
                ]);

            if ($response->failed()) {
                Log::error('Deepgram transcription failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new \RuntimeException("Deepgram transcription failed: {$response->status()}");
            }

            return $this->parseDeepgramResponse($response->json());
        } catch (ConnectionException $e) {
            Log::error('Deepgram transcription connection error', ['error' => $e->getMessage()]);

            throw new \RuntimeException("Deepgram transcription connection error: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Transcribe via Deepgram using raw audio binary data.
     *
     * @return array<int, array{speaker: string, text: string, start: float, end: float, confidence: float}>
     *
     * @throws \RuntimeException
     */
    private function transcribeAudioWithDeepgram(string $audioData, ?string $language = null): array
    {
        $apiKey = config('transcription.deepgram.api_key');
        $model = config('transcription.deepgram.model', 'nova-2-general');
        $defaultLang = config('transcription.deepgram.language', 'en');

        $queryParams = http_build_query([
            'model' => $model,
            'smart_format' => 'true',
            'diarize' => 'true',
            'language' => $language ?? $defaultLang,
        ]);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Token {$apiKey}",
                'Content-Type' => 'audio/wav',
            ])->timeout(120)
                ->connectTimeout(30)
                ->withBody($audioData, 'audio/wav')
                ->post("https://api.deepgram.com/v1/listen?{$queryParams}");

            if ($response->failed()) {
                Log::error('Deepgram transcription failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new \RuntimeException("Deepgram transcription failed: {$response->status()}");
            }

            return $this->parseDeepgramResponse($response->json());
        } catch (ConnectionException $e) {
            Log::error('Deepgram transcription connection error', ['error' => $e->getMessage()]);

            throw new \RuntimeException("Deepgram transcription connection error: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Parse Deepgram diarized response.
     *
     * @param  array<string, mixed>  $json
     * @return array<int, array{speaker: string, text: string, start: float, end: float, confidence: float}>
     */
    private function parseDeepgramResponse(array $json): array
    {
        $paragraphs = $json['results']['channels'][0]['alternatives'][0]['paragraphs']['paragraphs'] ?? [];
        $segments = [];

        foreach ($paragraphs as $paragraph) {
            foreach ($paragraph['sentences'] as $sentence) {
                $speaker = $sentence['speaker'] ?? null;
                $speakerLabel = $speaker !== null ? "Speaker {$speaker}" : 'Speaker';

                $segments[] = [
                    'speaker' => $speakerLabel,
                    'text' => $sentence['text'],
                    'start' => (float) $sentence['start'],
                    'end' => (float) $sentence['end'],
                    'confidence' => (float) ($sentence['confidence'] ?? 0.0),
                ];
            }
        }

        return $segments;
    }

    /**
     * Transcribe via OpenAI Whisper using an audio URL.
     *
     * @return array<int, array{speaker: string, text: string, start: float, end: float, confidence: float}>
     *
     * @throws \RuntimeException
     */
    private function transcribeWithWhisper(string $audioUrl, ?string $language = null): array
    {
        $apiKey = config('transcription.openai.api_key');

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
            ])->timeout(120)
                ->connectTimeout(30)
                ->attach('file', file_get_contents($audioUrl), 'audio.wav')
                ->post('https://api.openai.com/v1/audio/transcriptions', [
                    'model' => 'whisper-1',
                    'response_format' => 'verbose_json',
                    'timestamp_granularities' => ['word'],
                    'language' => $language ?? 'en',
                ]);

            if ($response->failed()) {
                Log::error('Whisper transcription failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new \RuntimeException("Whisper transcription failed: {$response->status()}");
            }

            return $this->parseWhisperResponse($response->json());
        } catch (ConnectionException $e) {
            Log::error('Whisper transcription connection error', ['error' => $e->getMessage()]);

            throw new \RuntimeException("Whisper transcription connection error: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Transcribe via OpenAI Whisper using raw audio binary data.
     *
     * @return array<int, array{speaker: string, text: string, start: float, end: float, confidence: float}>
     *
     * @throws \RuntimeException
     */
    private function transcribeAudioWithWhisper(string $audioData, ?string $language = null): array
    {
        $apiKey = config('transcription.openai.api_key');

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
            ])->timeout(120)
                ->connectTimeout(30)
                ->attach('file', $audioData, 'audio.wav')
                ->post('https://api.openai.com/v1/audio/transcriptions', [
                    'model' => 'whisper-1',
                    'response_format' => 'verbose_json',
                    'timestamp_granularities' => ['word'],
                    'language' => $language ?? 'en',
                ]);

            if ($response->failed()) {
                Log::error('Whisper transcription failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new \RuntimeException("Whisper transcription failed: {$response->status()}");
            }

            return $this->parseWhisperResponse($response->json());
        } catch (ConnectionException $e) {
            Log::error('Whisper transcription connection error', ['error' => $e->getMessage()]);

            throw new \RuntimeException("Whisper transcription connection error: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Parse Whisper verbose_json response.
     *
     * @param  array<string, mixed>  $json
     * @return array<int, array{speaker: string, text: string, start: float, end: float, confidence: float}>
     */
    private function parseWhisperResponse(array $json): array
    {
        $segments = $json['segments'] ?? [];

        return array_map(function (array $segment): array {
            return [
                'speaker' => 'Speaker',
                'text' => $segment['text'],
                'start' => (float) $segment['start'],
                'end' => (float) $segment['end'],
                'confidence' => (float) ($segment['confidence'] ?? ($segment['avg_logprob'] ?? 0.0)),
            ];
        }, $segments);
    }
}
