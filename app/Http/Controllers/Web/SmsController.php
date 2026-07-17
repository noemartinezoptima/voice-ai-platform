<?php

namespace App\Http\Controllers\Web;

use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsMessageModel;
use Illuminate\Http\JsonResponse;
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
        $tenantId = $request->user()->tenant_id;

        $query = SmsMessageModel::where('tenant_id', $tenantId)
            ->with('tenant');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('from_number', 'like', "%{$search}%")
                    ->orWhere('to_number', 'like', "%{$search}%")
                    ->orWhere('body', 'like', "%{$search}%");
            });
        }

        if ($direction = $request->get('direction')) {
            $query->where('direction', $direction);
        }

        if ($channel = $request->get('channel')) {
            $query->where('channel', $channel);
        }

        $messages = $query->orderBy('created_at', 'desc')->paginate(50);

        $tenant = $this->tenantRepository->findById($tenantId);
        $settings = $tenant?->settings() ?? [];

        $conversations = SmsMessageModel::where('tenant_id', $tenantId)
            ->selectRaw("
                CASE
                    WHEN direction = 'inbound' THEN from_number
                    ELSE to_number
                END as contact_number,
                MAX(created_at) as last_message_at,
                COUNT(*) as message_count
            ")
            ->groupBy('contact_number')
            ->orderBy('last_message_at', 'desc')
            ->limit(50)
            ->toBase()
            ->get()
            ->map(fn ($row) => [
                'contact_number' => $row->contact_number,
                'last_message_at' => $row->last_message_at,
                'message_count' => (int) $row->message_count,
            ])
            ->map(function ($conv) use ($tenantId) {
                $last = SmsMessageModel::where('tenant_id', $tenantId)
                    ->where(function ($q) use ($conv) {
                        $q->where('from_number', $conv['contact_number'])
                            ->orWhere('to_number', $conv['contact_number']);
                    })
                    ->latest()
                    ->first();

                return (object) [
                    ...$conv,
                    'last_body' => $last?->body,
                    'last_channel' => $last?->channel,
                ];
            })->values();

        return Inertia::render('Sms/Index', [
            'messages' => $messages,
            'conversations' => $conversations,
            'filters' => $request->only(['search', 'direction', 'channel']),
            'whatsapp_phone_number' => $settings['whatsapp_phone_number'] ?? null,
        ]);
    }

    public function conversation(Request $request, string $contactNumber): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $messages = SmsMessageModel::where('tenant_id', $tenantId)
            ->where(function ($q) use ($contactNumber) {
                $q->where('from_number', $contactNumber)
                    ->orWhere('to_number', $contactNumber);
            })
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($messages);
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
