import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text, TextLink } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Badge } from '@/Components/catalyst/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Alert, AlertTitle, AlertDescription, AlertActions } from '@/Components/catalyst/alert';
import { index, invite, update, destroy } from '@/actions/App/Http/Controllers/Web/TeamMemberController';

export default function Index({ members, invitations, currentUser }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        role: 'member',
    });

    const [updating, setUpdating] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const [confirmingCancel, setConfirmingCancel] = useState(null);

    function handleInvite(e) {
        e.preventDefault();
        post(invite().url, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function changeRole(userId, role) {
        setUpdating(userId);
        router.patch(update({user: userId}).url, { role }, {
            preserveScroll: true,
            onFinish: () => setUpdating(null),
        });
    }

    function remove(userId) {
        setConfirmingDelete(null);
        router.delete(destroy({user: userId}).url, { preserveScroll: true });
    }

    function cancelInvite(id) {
        setConfirmingCancel(null);
        router.delete(destroy({user: id}).url, { preserveScroll: true });
    }

    const isOwner = currentUser.role === 'owner';
    const canManage = currentUser.role === 'owner' || currentUser.role === 'admin';

    return (
        <AuthenticatedLayout>
            <Head title="Team" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Team</Heading>
                    <Text className="mt-1">Manage your team members and permissions.</Text>
                </div>
            </div>

            <div className="mt-8 max-w-4xl space-y-8">
                {canManage && (
                    <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Invite Team Member</Subheading>
                        <form onSubmit={handleInvite} className="mt-4 flex flex-wrap items-end gap-3">
                            <div className="min-w-0 flex-1">
                                <Field>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="colleague@company.com"
                                        invalid={errors.email ? true : undefined}
                                    />
                                    {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                                </Field>
                            </div>
                            <div>
                                <Field>
                                    <Label>Role</Label>
                                    <Select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </Select>
                                    {errors.role && <ErrorMessage>{errors.role}</ErrorMessage>}
                                </Field>
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Sending...' : 'Send Invite'}
                            </Button>
                        </form>
                    </div>
                )}

                <div className="rounded-xl border border-zinc-950/5 bg-white dark:border-white/10 dark:bg-zinc-900">
                    <div className="border-b border-zinc-950/5 px-6 py-4 dark:border-white/10">
                        <Subheading>Members ({members.length})</Subheading>
                    </div>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Email</TableHeader>
                                <TableHeader>Role</TableHeader>
                                <TableHeader>Joined</TableHeader>
                                {isOwner && <TableHeader />}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        {isOwner && member.id !== currentUser.id ? (
                                            <Select
                                                value={member.role}
                                                onChange={(e) => changeRole(member.id, e.target.value)}
                                                disabled={updating === member.id}
                                            >
                                                <option value="member">Member</option>
                                                <option value="admin">Admin</option>
                                            </Select>
                                        ) : (
                                            <Badge color={
                                                member.role === 'owner' ? 'yellow' :
                                                member.role === 'admin' ? 'blue' : 'zinc'
                                            }>
                                                {member.role}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-zinc-500">{member.joined_at}</TableCell>
                                    {isOwner && (
                                        <TableCell className="text-right">
                                            {member.id !== currentUser.id && (
                                                <button
                                                    onClick={() => setConfirmingDelete(member.id)}
                                                    className="text-sm font-medium text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {invitations.length > 0 && (
                    <div className="rounded-xl border border-zinc-950/5 bg-white dark:border-white/10 dark:bg-zinc-900">
                        <div className="border-b border-zinc-950/5 px-6 py-4 dark:border-white/10">
                            <Subheading>Pending Invitations ({invitations.length})</Subheading>
                        </div>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Email</TableHeader>
                                    <TableHeader>Role</TableHeader>
                                    <TableHeader>Sent</TableHeader>
                                    {canManage && <TableHeader />}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {invitations.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell>{inv.email}</TableCell>
                                        <TableCell>
                                            <Badge color={inv.role === 'admin' ? 'blue' : 'zinc'}>
                                                {inv.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-500">{inv.created_at}</TableCell>
                                        {canManage && (
                                            <TableCell className="text-right">
                                                <button
                                                    onClick={() => setConfirmingCancel(inv.id)}
                                                    className="text-sm font-medium text-zinc-500 hover:text-red-600"
                                                >
                                                    Cancel
                                                </button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            <Alert open={confirmingDelete !== null} onClose={() => setConfirmingDelete(null)}>
                <AlertTitle>Remove team member?</AlertTitle>
                <AlertDescription>
                    This will remove them from your team immediately. Their access to shared resources will be revoked.
                </AlertDescription>
                <AlertActions>
                    <Button plain onClick={() => setConfirmingDelete(null)}>Cancel</Button>
                    <Button color="red" onClick={() => remove(confirmingDelete)}>Remove</Button>
                </AlertActions>
            </Alert>

            <Alert open={confirmingCancel !== null} onClose={() => setConfirmingCancel(null)}>
                <AlertTitle>Cancel invitation?</AlertTitle>
                <AlertDescription>
                    This will revoke the pending invitation. The person will no longer be able to join your team.
                </AlertDescription>
                <AlertActions>
                    <Button plain onClick={() => setConfirmingCancel(null)}>Keep</Button>
                    <Button color="red" onClick={() => cancelInvite(confirmingCancel)}>Cancel Invitation</Button>
                </AlertActions>
            </Alert>
        </AuthenticatedLayout>
    );
}
