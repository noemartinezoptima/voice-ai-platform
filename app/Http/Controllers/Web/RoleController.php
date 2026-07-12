<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('manageSettings');
        $roles = Role::with('permissions')->get()->map(fn (Role $role) => [
            'id' => $role->id,
            'name' => $role->name,
            'permissions' => $role->permissions->pluck('name'),
            'users_count' => User::role($role->name)->count(),
        ]);

        $allPermissions = Permission::all()->pluck('name');

        return Inertia::render('Settings/Roles/Index', [
            'roles' => $roles,
            'allPermissions' => $allPermissions,
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        Gate::authorize('manageSettings');
        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->syncPermissions($validated['permissions']);

        activity()
            ->event('role_updated')
            ->withProperties(['role' => $role->name, 'permissions' => $validated['permissions']])
            ->log("Role '{$role->name}' permissions updated");

        return redirect()->route('settings.roles')
            ->with('success', "Permissions for '{$role->name}' updated.");
    }
}
