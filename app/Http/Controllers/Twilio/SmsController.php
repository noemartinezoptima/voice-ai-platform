<?php

namespace App\Http\Controllers\Twilio;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsMessageModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

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
        }

        return response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')
            ->header('Content-Type', 'text/xml');
    }
}
