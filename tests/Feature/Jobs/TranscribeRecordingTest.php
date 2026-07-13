<?php

namespace Tests\Feature\Jobs;

use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use App\Jobs\TranscribeRecording;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TranscribeRecordingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();
    }

    public function test_job_creates_transcript_entries_from_deepgram(): void
    {
        Config::set('transcription.deepgram.api_key', 'dg-test-key');
        Config::set('transcription.openai.api_key', null);

        $tenant = TenantFactory::new()->create([
            'settings' => [
                'twilio_account_sid' => 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'twilio_auth_token' => 'auth_token',
            ],
        ]);
        $call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'recording_url' => 'https://api.twilio.com/2010-04-01/Accounts/ACxxx/Recordings/RE123.wav',
        ]);

        $deepgramResponse = [
            'results' => [
                'channels' => [
                    [
                        'alternatives' => [
                            [
                                'paragraphs' => [
                                    'paragraphs' => [
                                        [
                                            'sentences' => [
                                                [
                                                    'text' => 'Hello, how can I help?',
                                                    'start' => 0.5,
                                                    'end' => 2.3,
                                                    'confidence' => 0.98,
                                                    'speaker' => 0,
                                                ],
                                                [
                                                    'text' => 'I have a question.',
                                                    'start' => 2.5,
                                                    'end' => 4.1,
                                                    'confidence' => 0.95,
                                                    'speaker' => 1,
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        Http::fake([
            'api.twilio.com/*' => Http::response('fake-audio-data', 200),
            'api.deepgram.com/*' => Http::response($deepgramResponse, 200),
        ]);

        $job = new TranscribeRecording($call);
        $job->handle();

        $call->refresh();

        $this->assertCount(2, TranscriptModel::where('call_id', $call->id)->get());
        $this->assertTrue($call->context['transcription_completed'] ?? false);

        $first = TranscriptModel::where('call_id', $call->id)->orderBy('start_offset_ms')->first();
        $this->assertNotNull($first);
        $this->assertSame('Speaker 0', $first->role);
        $this->assertSame('Hello, how can I help?', $first->text);
        $this->assertSame(500, $first->start_offset_ms);
    }

    public function test_job_handles_whisper_response(): void
    {
        Config::set('transcription.deepgram.api_key', null);
        Config::set('transcription.openai.api_key', 'oai-test-key');

        $tenant = TenantFactory::new()->create([
            'settings' => [
                'twilio_account_sid' => 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'twilio_auth_token' => 'auth_token',
            ],
        ]);
        $call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'recording_url' => 'https://api.twilio.com/2010-04-01/Accounts/ACxxx/Recordings/RE456.wav',
        ]);

        $whisperResponse = [
            'segments' => [
                [
                    'text' => 'Hello, how can I help?',
                    'start' => 0.5,
                    'end' => 2.3,
                    'confidence' => 0.92,
                    'avg_logprob' => -0.3,
                ],
                [
                    'text' => 'I have a question.',
                    'start' => 2.5,
                    'end' => 4.1,
                    'confidence' => 0.88,
                    'avg_logprob' => -0.5,
                ],
            ],
        ];

        Http::fake([
            'api.twilio.com/*' => Http::response('fake-audio-data', 200),
            'api.openai.com/*' => Http::response($whisperResponse, 200),
        ]);

        $job = new TranscribeRecording($call);
        $job->handle();

        $call->refresh();

        $this->assertCount(2, TranscriptModel::where('call_id', $call->id)->get());
        $this->assertTrue($call->context['transcription_completed'] ?? false);

        $first = TranscriptModel::where('call_id', $call->id)->orderBy('start_offset_ms')->first();
        $this->assertNotNull($first);
        $this->assertSame('Speaker', $first->role);
    }

    public function test_job_skips_if_no_audio_url_or_path(): void
    {
        Config::set('transcription.deepgram.api_key', 'dg-test-key');

        $tenant = TenantFactory::new()->create();
        $call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'recording_url' => null,
            'recording_path' => null,
        ]);

        Http::fake();

        $job = new TranscribeRecording($call);
        $job->handle();

        $this->assertCount(0, TranscriptModel::where('call_id', $call->id)->get());
    }

    public function test_job_skips_if_no_api_keys_configured(): void
    {
        Config::set('transcription.deepgram.api_key', null);
        Config::set('transcription.openai.api_key', null);

        $tenant = TenantFactory::new()->create([
            'settings' => [
                'twilio_account_sid' => 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'twilio_auth_token' => 'auth_token',
            ],
        ]);
        $call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'recording_url' => 'https://api.twilio.com/2010-04-01/Accounts/ACxxx/Recordings/RE789.wav',
        ]);

        Http::fake();

        $job = new TranscribeRecording($call);
        $job->handle();

        $this->assertCount(0, TranscriptModel::where('call_id', $call->id)->get());
    }

    public function test_job_downloads_from_twilio_when_only_url_available(): void
    {
        Config::set('transcription.deepgram.api_key', 'dg-test-key');
        Config::set('transcription.openai.api_key', null);

        $tenant = TenantFactory::new()->create([
            'settings' => [
                'twilio_account_sid' => 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'twilio_auth_token' => 'auth_token',
            ],
        ]);
        $call = CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'recording_url' => 'https://api.twilio.com/2010-04-01/Accounts/ACxxx/Recordings/RE000.wav',
            'recording_path' => null,
        ]);

        $deepgramResponse = [
            'results' => [
                'channels' => [
                    [
                        'alternatives' => [
                            [
                                'paragraphs' => [
                                    'paragraphs' => [
                                        [
                                            'sentences' => [
                                                [
                                                    'text' => 'Test message',
                                                    'start' => 1.0,
                                                    'end' => 2.0,
                                                    'confidence' => 0.99,
                                                    'speaker' => 0,
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        Http::fake([
            'api.twilio.com/*' => Http::response('fake-audio-from-twilio', 200),
            'api.deepgram.com/*' => Http::response($deepgramResponse, 200),
        ]);

        $job = new TranscribeRecording($call);
        $job->handle();

        $call->refresh();
        $this->assertCount(1, TranscriptModel::where('call_id', $call->id)->get());
        $this->assertTrue($call->context['transcription_completed'] ?? false);
    }
}
