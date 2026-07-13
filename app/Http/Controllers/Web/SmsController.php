<?php

namespace App\Http\Controllers\Web;

use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsMessageModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SmsController extends Controller
{
    public function __construct(
        private readonly TenantRepositoryInterface $tenantRepository,
    ) {}

    public function index(Request $request): Response
    {
        $messages = SmsMessageModel::where('tenant_id', $request->user()->tenant_id)
            ->with('tenant')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $tenant = $this->tenantRepository->findById($request->user()->tenant_id);
        $settings = $tenant?->settings() ?? [];

        return Inertia::render('Sms/Index', [
            'messages' => $messages,
            'whatsapp_phone_number' => $settings['whatsapp_phone_number'] ?? null,
        ]);
    }

    public function send(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'to' => ['required', 'string', 'max:20'],
            'body' => ['required', 'string', 'max:1600'],
            'channel' => ['required', 'string', Rule::in(['sms', 'whatsapp'])],
        ]);

        $tenant = $this->tenantRepository->findById($request->user()->tenant_id);
        abort_if($tenant === null, 404);

        $settings = $tenant->settings();
        $accountSid = $settings['twilio_account_sid'] ?? null;
        $authToken = $settings['twilio_auth_token'] ?? null;

        if (empty($accountSid) || empty($authToken)) {
            return redirect()->back()->with('error', 'Twilio credentials not configured.');
        }

        $isWhatsApp = $validated['channel'] === 'whatsapp';

        $fromNumber = $isWhatsApp
            ? ($settings['whatsapp_phone_number'] ?? null)
            : ($settings['twilio_phone_number'] ?? null);

        if (empty($fromNumber)) {
            return redirect()->back()->with('error', 'No phone number configured for this channel.');
        }

        $from = $isWhatsApp ? 'whatsapp:'.$fromNumber : $fromNumber;
        $to = $isWhatsApp ? 'whatsapp:'.$validated['to'] : $validated['to'];

        $response = Http::withBasicAuth($accountSid, $authToken)
            ->asForm()
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json", [
                'From' => $from,
                'To' => $to,
                'Body' => $validated['body'],
            ]);

        $messageSid = $response->json('sid');

        SmsMessageModel::create([
            'tenant_id' => $request->user()->tenant_id,
            'from_number' => $fromNumber,
            'to_number' => $validated['to'],
            'body' => $validated['body'],
            'channel' => $validated['channel'],
            'direction' => 'outbound',
            'status' => $messageSid ? 'sent' : 'failed',
            'message_sid' => $messageSid,
        ]);

        return redirect()->route('sms.index')
            ->with('success', $messageSid ? 'Message sent.' : 'Message failed to send.');
    }
}
