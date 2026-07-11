<?php

namespace App\Infrastructure\Services\ElevenLabs;

use Illuminate\Support\Facades\Http;

class ElevenLabsAgentApiService
{
    private const BASE_URL = 'https://api.elevenlabs.io/v1';

    public function __construct(
        private readonly string $apiKey,
    ) {}

    /** @return list<array{agent_id: string, name?: string, conversation_config?: array<string, mixed>, platform_settings?: array<string, mixed>, metadata?: array<string, mixed>, workflow?: array<string, mixed>, tags?: string[]}> */
    public function list(): array
    {
        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])->get(self::BASE_URL.'/convai/agents');

        if ($response->failed()) {
            throw new \RuntimeException('Failed to fetch agents: '.$response->body());
        }

        return $response->json()['agents'] ?? [];
    }

    /** @return array<string, mixed> */
    public function get(string $agentId): array
    {
        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])->get(self::BASE_URL."/convai/agents/{$agentId}");

        if ($response->failed()) {
            throw new \RuntimeException("Failed to fetch agent {$agentId}: ".$response->body());
        }

        return $response->json();
    }

    /**
     * @param  array{name: string, system_prompt?: string, first_message?: string, language?: string}  $data
     * @return array{agent_id: string}
     */
    public function create(array $data): array
    {
        $payload = [
            'name' => $data['name'],
            'conversation_config' => [
                'agent' => [
                    'prompt' => [
                        'prompt' => $data['system_prompt'] ?? 'You are a helpful assistant.',
                    ],
                    'first_message' => $data['first_message'] ?? 'Hello! How can I help you?',
                ],
            ],
        ];

        if (isset($data['language'])) {
            $payload['conversation_config']['agent']['language'] = $data['language'];
        }

        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])->post(self::BASE_URL.'/convai/agents/create', $payload);

        if ($response->failed()) {
            throw new \RuntimeException('Failed to create agent: '.$response->body());
        }

        return $response->json();
    }

    /**
     * @param  array{name?: string, system_prompt?: string, first_message?: string}  $data
     * @return array<string, mixed>
     */
    public function update(string $agentId, array $data): array
    {
        $payload = [];

        if (isset($data['name'])) {
            $payload['name'] = $data['name'];
        }

        if (isset($data['system_prompt']) || isset($data['first_message'])) {
            $payload['conversation_config'] = [
                'agent' => [],
            ];

            if (isset($data['system_prompt'])) {
                $payload['conversation_config']['agent']['prompt'] = [
                    'prompt' => $data['system_prompt'],
                ];
            }

            if (isset($data['first_message'])) {
                $payload['conversation_config']['agent']['first_message'] = $data['first_message'];
            }
        }

        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])->patch(self::BASE_URL."/convai/agents/{$agentId}", $payload);

        if ($response->failed()) {
            throw new \RuntimeException("Failed to update agent {$agentId}: ".$response->body());
        }

        return $response->json();
    }

    public function delete(string $agentId): void
    {
        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])->delete(self::BASE_URL."/convai/agents/{$agentId}");

        if ($response->failed()) {
            throw new \RuntimeException("Failed to delete agent {$agentId}: ".$response->body());
        }
    }
}
