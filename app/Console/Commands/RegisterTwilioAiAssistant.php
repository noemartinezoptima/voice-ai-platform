<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

#[Signature('twilio:register-ai-assistant')]
#[Description('Create a Twilio AI Assistant for voice flows')]
class RegisterTwilioAiAssistant extends Command
{
    public function handle(): int
    {
        $accountSid = config('twilio.account_sid');
        $authToken = config('twilio.auth_token');

        if ($accountSid === null || $authToken === null) {
            $this->error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');

            return self::FAILURE;
        }

        $name = $this->ask('Assistant name', 'Voice Flow AI');
        $prompt = $this->ask('System prompt (personality)', 'You are a helpful voice assistant for an IVR phone system. Respond conversationally and keep responses brief and natural for spoken dialogue.');

        $this->info('Creating Twilio AI Assistant...');

        $response = Http::withBasicAuth($accountSid, $authToken)
            ->timeout(30)
            ->post('https://assistants.twilio.com/v1/Assistants', [
                'name' => $name,
                'personalityPrompt' => $prompt,
                'model' => 'gpt-4o',
            ])
            ->json();

        $assistantSid = $response['id'] ?? null;

        if ($assistantSid === null) {
            $this->error('Failed to create assistant: '.($response['error'] ?? 'Unknown error'));

            return self::FAILURE;
        }

        $this->info('Assistant created successfully!');
        $this->warn("Assistant SID: {$assistantSid}");
        $this->warn("Add to .env: TWILIO_AI_ASSISTANT_SID={$assistantSid}");

        return self::SUCCESS;
    }
}
