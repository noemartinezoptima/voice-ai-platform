<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Team\TenantInvitationModel;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AcceptInviteController extends Controller
{
    public function __invoke(Request $request, string $token): RedirectResponse
    {
        $invitation = TenantInvitationModel::where('token', $token)
            ->whereNull('accepted_at')
            ->firstOrFail();

        if ($request->user()) {
            $user = $request->user();
            $user->update([
                'tenant_id' => $invitation->tenant_id,
                'role' => $invitation->role,
            ]);
            $invitation->update(['accepted_at' => now()]);

            return redirect()->route('dashboard')
                ->with('success', 'You joined the team!');
        }

        $existing = User::where('email', $invitation->email)->first();

        if ($existing) {
            $existing->update([
                'tenant_id' => $invitation->tenant_id,
                'role' => $invitation->role,
            ]);
            $invitation->update(['accepted_at' => now()]);

            return redirect()->route('dashboard')
                ->with('success', 'You joined the team!');
        }

        return redirect()->route('register', ['email' => $invitation->email, 'token' => $token]);
    }
}
