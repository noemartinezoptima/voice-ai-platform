<?php

namespace App\Console\Commands;

use App\Domain\Flow\Services\AiServiceInterface;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('elevenlabs:test')]
#[Description('Test the ElevenLabs agent connection by sending a message')]
class ElevenLabsTest extends Command
{
    public function handle(AiServiceInterface $aiService): int
    {
        $agentId = config('elevenlabs.agent_id');
        $apiKey = config('elevenlabs.api_key');

        if ($agentId === null || $agentId === '') {
            $this->error('ELEVENLABS_AGENT_ID not set in .env');

            return self::FAILURE;
        }

        if ($apiKey === null || $apiKey === '') {
            $this->error('ELEVENLABS_API_KEY not set in .env');

            return self::FAILURE;
        }

        $message = $this->ask('Message to send', 'Tell me about yourself in one sentence.');

        $this->info('Sending to ElevenLabs agent...');
        $this->line("Agent ID: {$agentId}");
        $this->line('');

        $start = microtime(true);

        try {
            $response = $aiService->chat([
                ['role' => 'user', 'content' => $message],
            ]);

            $elapsed = round((microtime(true) - $start) * 1000);
            $this->newLine();
            $this->info("Response ({$elapsed}ms):");
            $this->line($response);

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->newLine();
            $this->error('Failed: '.$e->getMessage());

            if ($e->getPrevious()) {
                $this->line('Previous: '.$e->getPrevious()->getMessage());
            }

            return self::FAILURE;
        }
    }
}
