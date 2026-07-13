<?php

namespace App\Http\Controllers\Web;

use App\Events\TeamActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\TeamRequest;
use App\Infrastructure\Persistence\Eloquent\Team\TenantInvitationModel;
use App\Infrastructure\Persistence\Eloquent\UserPermissionOverrideModel;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class TeamMemberController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $members = User::where('tenant_id', $tenantId)
            ->with('roles')
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
                'canImpersonate' => $request->user()->canImpersonate(),
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

        TeamActivity::dispatch(
            $tenantId,
            $request->user()->name,
            'invite',
            "invited {$request->email} as {$request->role}",
            null,
            'invite',
        );

        return back()->with('success', 'Invitation sent to '.$request->email.'.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $current = $request->user();

        Gate::authorize('manageTeam');
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

        TeamActivity::dispatch(
            $current->tenant_id,
            $current->name,
            'role_change',
            "changed {$user->name}'s role to {$request->role}",
            null,
            'role_change',
        );

        return back()->with('success', 'Member role updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $current = $request->user();

        Gate::authorize('manageTeam');
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

    public function permissions(Request $request, User $user): JsonResponse
    {
        abort_if(! $request->user()->isOwnerOrAdmin(), 403);
        abort_if($user->tenant_id !== $request->user()->tenant_id, 403);

        $overrides = UserPermissionOverrideModel::where('user_id', $user->id)->get();
        $allPermissions = Permission::all()->pluck('name');

        return response()->json([
            'user' => ['id' => $user->id, 'name' => $user->name],
            'overrides' => $overrides->map(fn ($o) => ['permission' => $o->permission, 'granted' => $o->granted]),
            'availablePermissions' => $allPermissions,
        ]);
    }

    public function updatePermissions(Request $request, User $user): JsonResponse
    {
        abort_if(! $request->user()->isOwnerOrAdmin(), 403);
        abort_if($user->tenant_id !== $request->user()->tenant_id, 403);

        $validated = $request->validate([
            'overrides' => ['array'],
            'overrides.*.permission' => ['string', 'exists:permissions,name'],
            'overrides.*.granted' => ['boolean'],
        ]);

        UserPermissionOverrideModel::where('user_id', $user->id)->delete();

        foreach ($validated['overrides'] ?? [] as $override) {
            UserPermissionOverrideModel::create([
                'user_id' => $user->id,
                'permission' => $override['permission'],
                'granted' => $override['granted'],
            ]);
        }

        return response()->json(['ok' => true]);
    }
}
