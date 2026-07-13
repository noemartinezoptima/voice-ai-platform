<?php

namespace App\Http\Controllers\Web;

use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsCampaignModel;
use App\Jobs\SendSmsCampaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SmsCampaignController extends Controller
{
    public function __construct(
        private readonly TenantRepositoryInterface $tenantRepository,
    ) {}

    public function index(Request $request): Response
    {
        $campaigns = SmsCampaignModel::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Sms/Campaigns/Index', [
            'campaigns' => $campaigns,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:1600'],
            'recipients' => ['required', 'string'],
        ]);

        $recipients = array_map('trim', preg_split('/[\n,]+/', $validated['recipients']));
        $recipients = array_values(array_filter($recipients));

        if (empty($recipients)) {
            return redirect()->back()->with('error', 'At least one recipient is required.');
        }

        SmsCampaignModel::create([
            'tenant_id' => $request->user()->tenant_id,
            'name' => $validated['name'],
            'message' => $validated['message'],
            'recipients' => $recipients,
            'total_count' => count($recipients),
            'status' => 'draft',
        ]);

        return redirect()->route('sms.campaigns.index')
            ->with('success', 'Campaign created.');
    }

    public function send(Request $request, SmsCampaignModel $smsCampaign): RedirectResponse
    {
        if ($smsCampaign->tenant_id !== $request->user()->tenant_id) {
            abort(404);
        }

        if (! in_array($smsCampaign->status, ['draft', 'failed'], true)) {
            return redirect()->back()->with('error', 'Campaign cannot be sent in its current state.');
        }

        $tenant = $this->tenantRepository->findById($request->user()->tenant_id);
        abort_if($tenant === null, 404);

        $settings = $tenant->settings();
        $accountSid = $settings['twilio_account_sid'] ?? null;
        $authToken = $settings['twilio_auth_token'] ?? null;

        if (empty($accountSid) || empty($authToken)) {
            return redirect()->back()->with('error', 'Twilio credentials not configured.');
        }

        $smsCampaign->update(['status' => 'sending']);

        SendSmsCampaign::dispatch($smsCampaign);

        return redirect()->route('sms.campaigns.index')
            ->with('success', 'Campaign sending started.');
    }

    public function destroy(Request $request, SmsCampaignModel $smsCampaign): RedirectResponse
    {
        if ($smsCampaign->tenant_id !== $request->user()->tenant_id) {
            abort(404);
        }

        if ($smsCampaign->status !== 'draft') {
            return redirect()->back()->with('error', 'Only draft campaigns can be deleted.');
        }

        $smsCampaign->delete();

        return redirect()->route('sms.campaigns.index')
            ->with('success', 'Campaign deleted.');
    }
}
