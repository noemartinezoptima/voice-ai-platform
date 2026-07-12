<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    private const PERMISSIONS = [
        'flows.create',
        'flows.delete',
        'flows.manage',
        'team.manage',
        'billing.view',
        'billing.manage',
        'calls.export',
        'webhooks.manage',
        'agents.manage',
        'settings.manage',
        'audit.view',
    ];

    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $owner = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $owner->syncPermissions(Permission::all());

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions([
            'flows.create',
            'flows.manage',
            'calls.export',
            'webhooks.manage',
            'agents.manage',
            'settings.manage',
        ]);

        $member = Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
        $member->syncPermissions([
            'flows.create',
            'billing.view',
        ]);
    }
}
