<?php

namespace App\Infrastructure\Services;

use App\Domain\Flow\Services\AiServiceInterface;
use Illuminate\Support\Facades\Http;
use Psr\Log\LoggerInterface;
use WebSocket\Client;
use WebSocket\TimeoutException;

class ElevenLabsAgentService implements AiServiceInterface
{
    private const CONVERSATION_TIMEOUT = 30;

    public function __construct(
        private readonly string $apiKey,
        private readonly string $agentId,
        private readonly ?LoggerInterface $logger = null,
    ) {}

    public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string
    {
        $signedUrl = $this->getSignedUrl();
        $text = $this->buildPrompt($messages);

        return $this->sendViaWebSocket($signedUrl, $text);
    }

    private function getSignedUrl(): string
    {
        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])->get(
            'https://api.elevenlabs.io/v1/convai/conversation/get-signed-url',
            ['agent_id' => $this->agentId],
        )->throw()->json();

        return $response['signed_url'] ?? throw new \RuntimeException('Failed to get signed URL from ElevenLabs');
    }

    /** @param array<int, array{role: string, content: string}> $messages */
    private function buildPrompt(array $messages): string
    {
        $text = '';

        foreach ($messages as $msg) {
            $role = $msg['role'];
            $content = $msg['content'];

            if ($role === 'system') {
                $text = "[System: {$content}]\n".$text;
            } elseif ($role === 'user') {
                $text .= "User: {$content}\n";
            } elseif ($role === 'assistant') {
                $text .= "Assistant: {$content}\n";
            }
        }

        return trim($text);
    }

    private function sendViaWebSocket(string $url, string $text): string
    {
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
            ],
        ]);

        $client = new Client($url, [
            'timeout' => self::CONVERSATION_TIMEOUT,
            'context' => $context,
        ]);

        try {
            $this->receiveMetadata($client);
            $this->sendInitData($client);
            $this->sendTextMessage($client, $text);

            return $this->readResponse($client);
        } finally {
            $this->safeClose($client);
        }
    }

    private function receiveMetadata(Client $client): void
    {
        $raw = $client->receive();

        if ($raw === null) {
            throw new \RuntimeException('ElevenLabs WebSocket closed before initiation metadata');
        }

        $event = json_decode($raw, true);

        if (($event['type'] ?? '') !== 'conversation_initiation_metadata') {
            $this->processEvents($client, function (array $e) {
                return ($e['type'] ?? '') === 'conversation_initiation_metadata';
            });
        }
    }

    private function sendInitData(Client $client): void
    {
        $client->send(json_encode([
            'type' => 'conversation_initiation_client_data',
            'dynamic_variables' => [
                'technician_name' => 'Assistant',
            ],
        ]));
    }

    private function sendTextMessage(Client $client, string $text): void
    {
        $client->send(json_encode([
            'type' => 'user_message',
            'user_message_event' => [
                'text' => $text,
            ],
        ]));
    }

    private function readResponse(Client $client): string
    {
        $response = '';

        $this->processEvents($client, function (array $event) use (&$response) {
            $type = $event['type'] ?? '';

            if ($type === 'agent_response') {
                $text = $event['agent_response_event']['agent_response'] ?? '';

                if ($text !== '') {
                    $response = $text;

                    return true;
                }
            }

            if ($type === 'agent_response_correction') {
                $text = $event['agent_response_correction_event']['corrected_agent_response'] ?? '';

                if ($text !== '') {
                    $response = $text;

                    return true;
                }
            }

            return false;
        });

        return $response ?: 'I am sorry, I am having trouble processing your request right now.';
    }

    private function processEvents(Client $client, callable $stopCondition): void
    {
        $maxIterations = 200;
        $iteration = 0;

        while ($iteration < $maxIterations) {
            $iteration++;

            try {
                $raw = $client->receive();
            } catch (TimeoutException) {
                break;
            }

            if ($raw === null || $raw === '') {
                break;
            }

            $event = json_decode($raw, true);

            if (! is_array($event) || ! isset($event['type'])) {
                continue;
            }

            if ($event['type'] === 'ping') {
                $this->sendPong($client, $event['ping_event']['event_id'] ?? 0);

                continue;
            }

            if ($stopCondition($event)) {
                break;
            }
        }
    }

    private function sendPong(Client $client, int $eventId): void
    {
        $client->send(json_encode([
            'type' => 'pong',
            'event_id' => $eventId,
        ]));
    }

    private function safeClose(Client $client): void
    {
        try {
            $client->close();
        } catch (\Throwable $e) {
            $this->logger?->warning('ElevenLabs WebSocket close error', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
