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
        $from = $request->input('From');
        $to = $request->input('To');
        $body = $request->input('Body');
        $messageSid = $request->input('MessageSid');

        $tenant = TenantModel::where('twilio_phone_number', $to)->first();

        if ($tenant !== null) {
            SmsMessageModel::create([
                'tenant_id' => $tenant->id,
                'from_number' => $from,
                'to_number' => $to,
                'body' => $body,
                'direction' => 'inbound',
                'status' => 'received',
                'message_sid' => $messageSid,
            ]);
        }

        return response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')
            ->header('Content-Type', 'text/xml');
    }
}
