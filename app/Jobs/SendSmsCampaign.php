<?php

namespace App\Jobs;

use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsCampaignModel;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsMessageModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class SendSmsCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;

    public function __construct(
        private readonly SmsCampaignModel $campaign,
    ) {}

    public function handle(TenantRepositoryInterface $tenantRepository): void
    {
        $tenant = $tenantRepository->findById($this->campaign->tenant_id);
        if ($tenant === null) {
            $this->campaign->update(['status' => 'failed']);

            return;
        }

        $settings = $tenant->settings();
        $accountSid = $settings['twilio_account_sid'] ?? null;
        $authToken = $settings['twilio_auth_token'] ?? null;
        $fromNumber = $settings['twilio_phone_number'] ?? null;

        if (empty($accountSid) || empty($authToken) || empty($fromNumber)) {
            $this->campaign->update(['status' => 'failed']);

            return;
        }

        $sent = 0;
        $recipients = $this->campaign->recipients;

        foreach ($recipients as $recipient) {
            $response = Http::withBasicAuth($accountSid, $authToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json", [
                    'From' => $fromNumber,
                    'To' => $recipient,
                    'Body' => $this->campaign->message,
                ]);

            $messageSid = $response->json('sid');

            SmsMessageModel::create([
                'tenant_id' => $this->campaign->tenant_id,
                'from_number' => $fromNumber,
                'to_number' => $recipient,
                'body' => $this->campaign->message,
                'channel' => 'sms',
                'direction' => 'outbound',
                'status' => $messageSid ? 'sent' : 'failed',
                'message_sid' => $messageSid,
            ]);

            if ($messageSid) {
                $sent++;
            }
        }

        $this->campaign->update([
            'status' => 'completed',
            'sent_count' => $sent,
        ]);
    }
}
