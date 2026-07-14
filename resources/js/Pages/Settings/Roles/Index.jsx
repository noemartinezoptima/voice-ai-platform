import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Checkbox } from '@/Components/catalyst/checkbox';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Shield } from 'lucide-react';

export default function Index({ roles, allPermissions }) {
    const [editingRole, setEditingRole] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    function openEditor(role) {
        setEditingRole(role);
        setSelectedPermissions([...role.permissions]);
    }

    function togglePermission(name) {
        setSelectedPermissions((prev) =>
            prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
        );
    }

    function saveRole() {
        if (!editingRole) return;
        router.patch(`/settings/roles/${editingRole.id}`, {
            permissions: selectedPermissions,
        }, {
            onSuccess: () => setEditingRole(null),
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Roles & Permissions" />

            <div>
                <Heading>Roles &amp; Permissions</Heading>
                <Text className="mt-1">Manage roles and their associated permissions.</Text>
            </div>

            <div className="mt-6 space-y-6">
                {roles.map((role) => (
                    <div key={role.id} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold capitalize text-zinc-950 dark:text-white">{role.name}</h3>
                                <Text className="text-sm">{role.users_count} user{role.users_count !== 1 ? 's' : ''}</Text>
                            </div>
                            <Button outline onClick={() => openEditor(role)}>Edit Permissions</Button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {role.permissions.map((p) => (
                                <Badge key={p} color="zinc">{p}</Badge>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {editingRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                        <h3 className="text-lg font-semibold capitalize">Edit {editingRole.name} Permissions</h3>
                        <Text className="mt-1">Select which permissions this role should have.</Text>
                        <div className="mt-4 space-y-2">
                            {allPermissions.map((perm) => (
                                <label key={perm} className="flex items-center gap-2 rounded-md p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                    <Checkbox
                                        checked={selectedPermissions.includes(perm)}
                                        onChange={() => togglePermission(perm)}
                                        disabled={editingRole.name === 'owner'}
                                    />
                                    <span className="text-sm">{perm}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <Button plain onClick={() => setEditingRole(null)}>Cancel</Button>
                            <Button onClick={saveRole} disabled={editingRole.name === 'owner'}>Save</Button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
