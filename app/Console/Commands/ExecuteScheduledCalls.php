<?php

namespace App\Console\Commands;

use App\Infrastructure\Persistence\Eloquent\Call\ScheduledCallModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ExecuteScheduledCalls extends Command
{
    protected $signature = 'calls:execute-scheduled';

    protected $description = 'Execute due scheduled calls via Twilio';

    public function handle(): int
    {
        $due = ScheduledCallModel::due()->with('flow')->get();

        foreach ($due as $scheduled) {
            $scheduled->update(['status' => 'in_progress']);

            try {
                $callSid = $this->initiateTwilioCall($scheduled);

                if ($callSid) {
                    $scheduled->update([
                        'status' => 'completed',
                        'last_triggered_at' => now(),
                    ]);

                    $this->createNextRecurrence($scheduled);

                    $this->info("Call completed: {$scheduled->id} ({$scheduled->phone_number})");
                } else {
                    $scheduled->update(['status' => 'failed']);
                    $this->error("Twilio returned no SID for {$scheduled->phone_number}");
                }
            } catch (\Throwable $e) {
                $scheduled->update(['status' => 'failed']);
                $this->error("Failed call to {$scheduled->phone_number}: {$e->getMessage()}");
            }
        }

        return self::SUCCESS;
    }

    private function initiateTwilioCall(ScheduledCallModel $scheduled): ?string
    {
        $tenant = TenantModel::find($scheduled->tenant_id);
        $settings = $tenant ? ($tenant->settings ?? []) : [];

        $accountSid = $settings['twilio_account_sid'] ?? config('twilio.account_sid');
        $authToken = $settings['twilio_auth_token'] ?? config('twilio.auth_token');

        if (empty($accountSid) || empty($authToken)) {
            throw new \RuntimeException('Twilio credentials not configured');
        }

        $flow = $scheduled->flow;
        $fromNumber = $flow instanceof FlowModel ? $flow->phone_number : null;
        $fromNumber = $fromNumber ?? ($settings['twilio_phone_number'] ?? null);

        if (empty($fromNumber)) {
            throw new \RuntimeException('No phone number configured for flow or tenant');
        }

        $response = Http::withBasicAuth($accountSid, $authToken)
            ->asForm()
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Calls.json", [
                'To' => $scheduled->phone_number,
                'From' => $fromNumber,
                'Url' => config('app.url').'/twilio/inbound?flow_id='.$scheduled->flow_id,
            ]);

        return $response->json('sid');
    }

    private function createNextRecurrence(ScheduledCallModel $scheduled): void
    {
        if ($scheduled->frequency === 'once') {
            return;
        }

        $nextAt = match ($scheduled->frequency) {
            'daily' => now()->addDay(),
            'weekly' => now()->addWeek(),
            'monthly' => now()->addMonth(),
            default => null,
        };

        if ($nextAt === null) {
            return;
        }

        ScheduledCallModel::create([
            'tenant_id' => $scheduled->tenant_id,
            'flow_id' => $scheduled->flow_id,
            'phone_number' => $scheduled->phone_number,
            'scheduled_at' => $nextAt,
            'frequency' => $scheduled->frequency,
            'timezone' => $scheduled->timezone,
            'status' => 'pending',
        ]);
    }
}
