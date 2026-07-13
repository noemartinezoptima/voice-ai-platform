<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use Database\Factories\TranscriptModelFactory;
use Illuminate\Database\Seeder;

class TranscriptSeeder extends Seeder
{
    public function run(): void
    {
        $calls = CallModel::where('tenant_id', '00000000-0000-0000-0000-000000000001')->get();

        $this->command?->info('Creating transcripts for '.$calls->count().' calls...');

        foreach ($calls as $call) {
            $transcriptCount = rand(5, 12);

            for ($i = 0; $i < $transcriptCount; $i++) {
                $role = $this->randomWeightedRole();
                $sentiment = $this->randomWeightedSentiment();

                TranscriptModelFactory::new()
                    ->withCallId($call->id)
                    ->withRole($role)
                    ->withText($this->generateText($sentiment, $role))
                    ->create([
                        'confidence' => fake()->randomFloat(2, 0.6, 1.0),
                        'start_offset_ms' => $i * rand(2000, 8000),
                        'end_offset_ms' => ($i * rand(2000, 8000)) + rand(1000, 5000),
                    ]);
            }
        }
    }

    private function randomWeightedRole(): string
    {
        $roll = rand(1, 100);

        if ($roll <= 60) {
            return 'user';
        }
        if ($roll <= 90) {
            return 'assistant';
        }

        return 'system';
    }

    private function randomWeightedSentiment(): string
    {
        $roll = rand(1, 100);

        if ($roll <= 40) {
            return 'positive';
        }
        if ($roll <= 75) {
            return 'neutral';
        }

        return 'negative';
    }

    private function generateText(string $sentiment, string $role): string
    {
        $positivePhrases = [
            'thank you so much for your help',
            'that was great, I really appreciate it',
            'excellent service, very helpful',
            'perfect, that solves my problem',
            'wonderful, thank you for the quick response',
            'I really appreciate your patience with this',
            'so happy with the solution you provided',
            'thanks, this has been very helpful',
        ];

        $negativePhrases = [
            'this is not working at all',
            'I am getting frustrated with this issue',
            'that is a terrible experience',
            'this is awful, nothing works',
            'I am very disappointed with the service',
            'you gave me the wrong information',
            'there seems to be an error in the system',
            'I have been having this problem for weeks',
        ];

        $neutralPhrases = [
            'can you tell me about your business hours',
            'I need to update my account information',
            'what is the status of my order',
            'how do I reset my password',
            'I would like to schedule an appointment',
            'please transfer me to billing department',
            'what plans do you offer',
            'I need help with my invoice',
        ];

        if ($sentiment === 'positive') {
            return fake()->randomElement($positivePhrases);
        }

        if ($sentiment === 'negative') {
            return fake()->randomElement($negativePhrases);
        }

        if ($role === 'system') {
            $systemPhrases = [
                'transferring call to support team',
                'call recording started',
                'language set to english',
                'gathering caller input',
                'connecting to knowledge base',
            ];

            return fake()->randomElement($systemPhrases);
        }

        if ($role === 'assistant') {
            $assistantPhrases = [
                'Hello, how can I help you today',
                'I understand, let me look into that for you',
                'One moment please while I check your account',
                'Is there anything else I can assist you with',
                'I have found the information you need',
            ];

            return fake()->randomElement($assistantPhrases);
        }

        return fake()->randomElement($neutralPhrases);
    }
}
