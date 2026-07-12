<?php

namespace App\Http\Controllers\Twilio;

use App\Application\Call\DTOs\InboundCallData;
use App\Application\Call\UseCases\HandleInboundCall;
use App\Application\Flow\Services\FlowExecutor;
use App\Application\Webhook\Services\WebhookDispatcher;
use App\Domain\Call\Repositories\CallRepositoryInterface;
use App\Domain\Flow\Repositories\FlowRepositoryInterface;
use App\Events\CallUpdated;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Jobs\DownloadAndEncryptRecording;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Twilio\TwiML\VoiceResponse;

class WebhookController extends Controller
{
    public function __construct(
        private readonly HandleInboundCall $handleInboundCall,
        private readonly FlowRepositoryInterface $flowRepository,
        private readonly CallRepositoryInterface $callRepository,
        private readonly FlowExecutor $flowExecutor,
        private readonly WebhookDispatcher $webhookDispatcher,
    ) {}

    public function inbound(Request $request): Response
    {
        try {
            $toNumber = $request->input('To');
            $tenantModel = TenantModel::where('settings->twilio_phone_number', $toNumber)->first();

            if ($tenantModel !== null) {
                $dp = $tenantModel->data_protection;
                if (($dp['consent_required'] ?? false)) {
                    $response = new VoiceResponse;
                    $gather = $response->gather([
                        'action' => '/twilio/consent-callback',
                        'numDigits' => 1,
                        'timeout' => 5,
                    ]);
                    $gather->say($dp['consent_message'] ?? 'This call may be recorded.');
                    $gather->say('Press 1 to accept, or any other key to decline.');
                    $response->say('You did not provide consent. Goodbye.');
                    $response->hangup();

                    return response((string) $response)->header('Content-Type', 'text/xml');
                }
            }

            $data = InboundCallData::fromTwilio($request->all());
            $call = $this->handleInboundCall->execute($data);

            $flow = $this->flowRepository->findById($call->getFlowId() ?? '');

            if ($flow === null || ! $flow->isActive()) {
                return $this->notConfigured();
            }

            $startStep = $flow->config()->startStep();

            return $this->toResponse($this->flowExecutor->executeStep($startStep, $flow, $call));
        } catch (\Throwable $e) {
            Log::warning('Inbound call failed', [
                'error' => $e->getMessage(),
                'callSid' => $request->input('CallSid'),
            ]);

            return $this->notConfigured();
        }
    }

    public function step(Request $request): Response
    {
        try {
            $callSid = $request->input('CallSid');

            if ($callSid === null) {
                return $this->notConfigured();
            }

            $call = $this->callRepository->findBySid($callSid);

            if ($call === null) {
                return $this->notConfigured();
            }

            $flowId = $call->getFlowId();

            if ($flowId === null) {
                return $this->notConfigured();
            }

            $flow = $this->flowRepository->findById($flowId);

            if ($flow === null) {
                return $this->notConfigured();
            }

            $currentStepId = $call->currentStep();

            if ($currentStepId === null) {
                return $this->notConfigured();
            }

            $currentStep = $flow->config()->getStep($currentStepId);

            if ($currentStep === null) {
                return $this->notConfigured();
            }

            $digits = $request->input('Digits');
            $nextStepId = $this->flowExecutor->determineNextStep($currentStep, $digits);

            if ($nextStepId === null) {
                $call->markCompleted();
                $this->callRepository->save($call);

                $response = new VoiceResponse;
                $response->hangup();

                return $this->toResponse($response);
            }

            $call->setCurrentStep($nextStepId);
            $this->callRepository->save($call);

            return $this->toResponse($this->flowExecutor->executeStep($nextStepId, $flow, $call));
        } catch (\Throwable $e) {
            Log::warning('Step processing failed', [
                'error' => $e->getMessage(),
                'callSid' => $request->input('CallSid'),
            ]);

            return $this->notConfigured();
        }
    }

    public function status(Request $request): void
    {
        $callSid = $request->input('CallSid');
        $callStatus = $request->input('CallStatus');

        if ($callSid !== null) {
            $call = $this->callRepository->findBySid($callSid);

            if ($call !== null) {
                if (in_array($callStatus, ['completed', 'failed', 'busy', 'no-answer'], true)) {
                    $call->markCompleted();
                    $this->callRepository->save($call);
                }

                $mapped = $this->mapStatusToEvent($callStatus);

                if ($mapped !== null) {
                    $this->webhookDispatcher->dispatch($mapped, [
                        'call_sid' => (string) $call->getCallSid(),
                        'status' => $call->getStatus(),
                        'from' => (string) $call->getFromNumber(),
                        'to' => (string) $call->getToNumber(),
                        'duration_seconds' => $call->getDurationSeconds(),
                    ]);
                }

                $callModel = CallModel::find($call->id());

                if ($callModel !== null) {
                    CallUpdated::dispatch($callModel);
                }
            }
        }

        Log::info('Twilio status callback', $request->all());
    }

    private function mapStatusToEvent(?string $twilioStatus): ?string
    {
        return match ($twilioStatus) {
            'initiated' => 'call.initiated',
            'ringing' => 'call.in_progress',
            'in-progress' => 'call.in_progress',
            'completed' => 'call.completed',
            'failed', 'busy', 'no-answer' => 'call.failed',
            default => null,
        };
    }

    public function recording(Request $request): void
    {
        $callSid = $request->input('CallSid');
        $recordingSid = $request->input('RecordingSid');
        $recordingUrl = $request->input('RecordingUrl');
        $recordingStatus = $request->input('RecordingStatus');

        if ($callSid !== null && $recordingSid !== null && $recordingStatus === 'completed') {
            $call = $this->callRepository->findBySid($callSid);

            if ($call !== null) {
                $call->setRecordingSid($recordingSid);
                $call->setRecordingUrl($recordingUrl);
                $this->callRepository->save($call);

                $callModel = CallModel::find($call->id());

                if ($callModel !== null && $recordingUrl !== null) {
                    DownloadAndEncryptRecording::dispatch($callModel, $recordingUrl);
                }

                Log::info('Recording stored', [
                    'callSid' => $callSid,
                    'recordingSid' => $recordingSid,
                ]);
            }
        }
    }

    public function gather(Request $request): Response
    {
        return $this->step($request);
    }

    public function consentCallback(Request $request): Response
    {
        $digits = $request->input('Digits');

        if ($digits === '1') {
            activity()
                ->event('consent_granted')
                ->withProperties([
                    'caller' => $request->input('From'),
                    'call_sid' => $request->input('CallSid'),
                ])
                ->log('Call recording consent granted');

            $data = InboundCallData::fromTwilio($request->all());
            $call = $this->handleInboundCall->execute($data);

            $flow = $this->flowRepository->findById($call->getFlowId() ?? '');

            if ($flow === null || ! $flow->isActive()) {
                return $this->notConfigured();
            }

            $startStep = $flow->config()->startStep();

            return $this->toResponse($this->flowExecutor->executeStep($startStep, $flow, $call));
        }

        activity()
            ->event('consent_declined')
            ->withProperties([
                'caller' => $request->input('From'),
                'call_sid' => $request->input('CallSid'),
            ])
            ->log('Call recording consent declined');

        $response = new VoiceResponse;
        $response->say('Goodbye.');
        $response->hangup();

        return $this->toResponse($response);
    }

    private function notConfigured(): Response
    {
        $response = new VoiceResponse;
        $response->say('Sorry, this number is not configured. Goodbye.');
        $response->hangup();

        return $this->toResponse($response);
    }

    private function toResponse(VoiceResponse $response): Response
    {
        return response((string) $response)->header('Content-Type', 'text/xml');
    }
}
