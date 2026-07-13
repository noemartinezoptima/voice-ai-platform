<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    public function start(Request $request, User $user): RedirectResponse
    {
        $current = $request->user();

        abort_if(! $current->canImpersonate(), 403);
        abort_if(! $user->canBeImpersonated(), 403);
        abort_if($user->tenant_id !== $current->tenant_id, 403);

        session(['impersonator_id' => $current->id]);
        session(['impersonator_tenant_id' => $current->tenant_id]);
        Auth::login($user);

        activity('security')->log("{$current->name} impersonated {$user->name}");

        return redirect()->route('dashboard')->with('success', "Impersonating {$user->name}");
    }

    public function stop(): RedirectResponse
    {
        $impersonatorId = session('impersonator_id');

        abort_if(! $impersonatorId, 403);

        $impersonator = User::find($impersonatorId);
        Auth::login($impersonator);
        session()->forget(['impersonator_id', 'impersonator_tenant_id']);

        return redirect()->route('dashboard')->with('success', 'Back to your account');
    }
}
