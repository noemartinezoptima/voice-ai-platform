<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeamRequest;
use App\Infrastructure\Persistence\Eloquent\Team\TenantInvitationModel;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TeamMemberController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $members = User::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first() ?? 'member',
                'joined_at' => $user->created_at->diffForHumans(),
            ]);

        $invitations = TenantInvitationModel::where('tenant_id', $tenantId)
            ->whereNull('accepted_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (TenantInvitationModel $inv) => [
                'id' => $inv->id,
                'email' => $inv->email,
                'role' => $inv->role,
                'created_at' => $inv->created_at->diffForHumans(),
            ]);

        return Inertia::render('Team/Index', [
            'members' => $members,
            'invitations' => $invitations,
            'currentUser' => [
                'id' => $request->user()->id,
                'role' => $request->user()->getRoleNames()->first() ?? 'member',
            ],
        ]);
    }

    public function invite(TeamRequest $request): RedirectResponse
    {
        $tenantId = $request->user()->tenant_id;

        $existing = User::where('tenant_id', $tenantId)
            ->where('email', $request->email)
            ->exists();

        if ($existing) {
            return back()->withErrors(['email' => 'User is already a member.']);
        }

        $pending = TenantInvitationModel::where('tenant_id', $tenantId)
            ->where('email', $request->email)
            ->whereNull('accepted_at')
            ->exists();

        if ($pending) {
            return back()->withErrors(['email' => 'Invitation already pending for this email.']);
        }

        TenantInvitationModel::create([
            'tenant_id' => $tenantId,
            'email' => $request->email,
            'role' => $request->role,
            'token' => Str::random(64),
        ]);

        activity('team')
            ->causedBy($request->user())
            ->event('invite_sent')
            ->withProperties(['email' => $request->email])
            ->log(":causer.name invitó a {$request->email}");

        return back()->with('success', 'Invitation sent to '.$request->email.'.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $current = $request->user();

        abort_if(! $current->isOwner(), 403);
        abort_if($current->id === $user->id, 403);
        abort_if($user->tenant_id !== $current->tenant_id, 403);

        $request->validate(['role' => 'required|string|in:admin,member']);

        $currentRole = $user->getRoleNames()->first() ?? 'member';
        $user->syncRoles([$request->role]);
        $user->update(['role' => $request->role]);

        activity('team')
            ->causedBy($request->user())
            ->event('role_changed')
            ->withProperties(['user' => $user->name, 'from' => $currentRole, 'to' => $request->role])
            ->log(":causer.name cambió el rol de {$user->name} de {$currentRole} a {$request->role}");

        return back()->with('success', 'Member role updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $current = $request->user();

        abort_if(! $current->isOwner(), 403);
        abort_if($current->id === $user->id, 403);
        abort_if($user->tenant_id !== $current->tenant_id, 403);

        $userName = $user->name;
        $user->syncRoles([]);
        $user->update(['tenant_id' => null]);

        activity('team')
            ->causedBy($request->user())
            ->event('member_removed')
            ->withProperties(['user' => $userName])
            ->log(":causer.name eliminó a {$userName} del equipo");

        return back()->with('success', 'Member removed from tenant.');
    }
}
