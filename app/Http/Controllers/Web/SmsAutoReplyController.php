<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsAutoReplyModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SmsAutoReplyController extends Controller
{
    public function index(Request $request): Response
    {
        $rules = SmsAutoReplyModel::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Sms/AutoReplies/Index', [
            'autoReplies' => $rules,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'keyword' => ['required', 'string', 'max:255'],
            'reply_text' => ['required', 'string', 'max:1600'],
            'match_type' => ['required', 'string', 'in:exact,contains,starts_with'],
        ]);

        SmsAutoReplyModel::create([
            'tenant_id' => $request->user()->tenant_id,
            'keyword' => $validated['keyword'],
            'reply_text' => $validated['reply_text'],
            'match_type' => $validated['match_type'],
        ]);

        return redirect()->route('sms.auto-replies.index')
            ->with('success', 'Auto-reply rule created.');
    }

    public function update(Request $request, SmsAutoReplyModel $smsAutoReply): RedirectResponse
    {
        if ($smsAutoReply->tenant_id !== $request->user()->tenant_id) {
            abort(404);
        }

        $validated = $request->validate([
            'keyword' => ['sometimes', 'string', 'max:255'],
            'reply_text' => ['sometimes', 'string', 'max:1600'],
            'match_type' => ['sometimes', 'string', 'in:exact,contains,starts_with'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $smsAutoReply->update($validated);

        return redirect()->route('sms.auto-replies.index')
            ->with('success', 'Auto-reply rule updated.');
    }

    public function destroy(Request $request, SmsAutoReplyModel $smsAutoReply): RedirectResponse
    {
        if ($smsAutoReply->tenant_id !== $request->user()->tenant_id) {
            abort(404);
        }

        $smsAutoReply->delete();

        return redirect()->route('sms.auto-replies.index')
            ->with('success', 'Auto-reply rule deleted.');
    }
}
