<?php

namespace App\Http\Controllers\Twilio;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsAutoReplyModel;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsMessageModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

class SmsController extends Controller
{
    public function inbound(Request $request): Response
    {
        $rawFrom = $request->input('From');
        $rawTo = $request->input('To');
        $body = $request->input('Body');
        $messageSid = $request->input('MessageSid');
        $waId = $request->input('WaId');

        $isWhatsApp = str_starts_with($rawFrom, 'whatsapp:') || str_starts_with($rawTo, 'whatsapp:');
        $channel = $isWhatsApp ? 'whatsapp' : 'sms';

        if ($isWhatsApp) {
            $fromNumber = $waId ?: str_replace('whatsapp:', '', $rawFrom);
            $toNumber = str_replace('whatsapp:', '', $rawTo);

            $tenant = TenantModel::where('settings->whatsapp_phone_number', $toNumber)->first();
        } else {
            $fromNumber = $rawFrom;
            $toNumber = $rawTo;

            $tenant = TenantModel::where('settings->twilio_phone_number', $rawTo)->first();
        }

        if ($tenant !== null) {
            SmsMessageModel::create([
                'tenant_id' => $tenant->id,
                'from_number' => $fromNumber,
                'to_number' => $toNumber,
                'body' => $body,
                'channel' => $channel,
                'direction' => 'inbound',
                'status' => 'received',
                'message_sid' => $messageSid,
            ]);

            $this->processAutoReplies($tenant, $fromNumber, $toNumber, $body, $channel);
        }

        return response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')
            ->header('Content-Type', 'text/xml');
    }

    private function processAutoReplies(TenantModel $tenant, string $fromNumber, string $toNumber, string $body, string $channel): void
    {
        $rules = SmsAutoReplyModel::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->get();

        if ($rules->isEmpty()) {
            return;
        }

        $settings = $tenant->settings;
        $accountSid = $settings['twilio_account_sid'] ?? null;
        $authToken = $settings['twilio_auth_token'] ?? null;

        if (empty($accountSid) || empty($authToken)) {
            return;
        }

        $isWhatsApp = $channel === 'whatsapp';
        $fromPhone = $isWhatsApp
            ? ($settings['whatsapp_phone_number'] ?? null)
            : ($settings['twilio_phone_number'] ?? null);

        if (empty($fromPhone)) {
            return;
        }

        foreach ($rules as $rule) {
            if (! $this->matchesKeyword($body, $rule->keyword, $rule->match_type)) {
                continue;
            }

            $twilioFrom = $isWhatsApp ? 'whatsapp:'.$fromPhone : $fromPhone;
            $twilioTo = $isWhatsApp ? ('whatsapp:'.$fromNumber) : $fromNumber;

            $response = Http::withBasicAuth($accountSid, $authToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json", [
                    'From' => $twilioFrom,
                    'To' => $twilioTo,
                    'Body' => $rule->reply_text,
                ]);

            $replySid = $response->json('sid');

            SmsMessageModel::create([
                'tenant_id' => $tenant->id,
                'from_number' => $fromPhone,
                'to_number' => $fromNumber,
                'body' => $rule->reply_text,
                'channel' => $channel,
                'direction' => 'outbound',
                'status' => $replySid ? 'sent' : 'failed',
                'message_sid' => $replySid,
            ]);

            break;
        }
    }

    private function matchesKeyword(string $body, string $keyword, string $matchType): bool
    {
        $bodyLower = mb_strtolower($body);
        $keywordLower = mb_strtolower($keyword);

        return match ($matchType) {
            'exact' => $bodyLower === $keywordLower,
            'starts_with' => str_starts_with($bodyLower, $keywordLower),
            default => str_contains($bodyLower, $keywordLower),
        };
    }
}
