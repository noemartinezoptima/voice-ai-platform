import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Badge } from '@/Components/catalyst/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Alert, AlertTitle, AlertDescription, AlertBody, AlertActions } from '@/Components/catalyst/alert';
import { store, destroy } from '@/actions/App/Http/Controllers/Web/ApiTokenController';

export default function Index({ tokens, flash }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        abilities: '*',
        expires_in: 'never',
    });
    const [showCreate, setShowCreate] = useState(false);
    const [newToken, setNewToken] = useState(flash?.token ?? null);
    const [confirmingRevoke, setConfirmingRevoke] = useState(null);

    function submit(e) {
        e.preventDefault();
        post(store().url, {
            onSuccess: (page) => {
                const t = page.props.flash?.token;
                if (t) setNewToken(t);
                reset();
                setShowCreate(false);
            },
        });
    }

    function revoke(id, name) {
        setConfirmingRevoke(null);
        router.delete(destroy({token: id}).url);
    }

    return (
        <AuthenticatedLayout>
            <Head title="API Tokens" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>API Tokens</Heading>
                    <Text className="mt-1">Manage API tokens for programmatic access.</Text>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                    New Token
                </Button>
            </div>

            <div className="mt-6 max-w-3xl space-y-6">
                <div className="rounded-xl border border-zinc-950/5 bg-white dark:border-white/10 dark:bg-zinc-900">
                    {tokens.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <p className="text-base font-semibold text-zinc-950 dark:text-white">No API tokens</p>
                            <Text className="mt-2">Generate a token to authenticate API requests.</Text>
                        </div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Abilities</TableHeader>
                                    <TableHeader>Created</TableHeader>
                                    <TableHeader>Last Used</TableHeader>
                                    <TableHeader>Expires</TableHeader>
                                    <TableHeader />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tokens.map((token) => (
                                    <TableRow key={token.id}>
                                        <TableCell className="font-medium">{token.name}</TableCell>
                                        <TableCell>
                                            {token.abilities?.length === 1 && token.abilities[0] === '*'
                                                ? <Badge color="zinc">full access</Badge>
                                                : token.abilities?.map((a, i) => (
                                                    <Badge key={i} color="zinc" className="mr-1">{a}</Badge>
                                                  ))
                                            }
                                        </TableCell>
                                    <TableCell className="text-zinc-500">{token.created_at}</TableCell>
                                    <TableCell className="text-zinc-500">{token.last_used_at || 'Never'}</TableCell>
                                    <TableCell className="text-zinc-500">{token.expires_at || 'Never'}</TableCell>
                                        <TableCell className="text-right">
                                            <button
                                                onClick={() => setConfirmingRevoke(token)}
                                                className="text-sm font-medium text-red-600 hover:text-red-800"
                                            >
                                                Revoke
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
                <DialogTitle>Create API Token</DialogTitle>
                <DialogDescription>
                    Generate a new token for programmatic API access.
                </DialogDescription>
                <DialogBody>
                    <form onSubmit={submit} id="create-token-form" className="space-y-4">
                        <Field>
                            <Label>Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Production CI"
                                invalid={errors.name ? true : undefined}
                            />
                            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>Abilities (comma-separated)</Label>
                            <Input
                                value={data.abilities}
                                onChange={(e) => setData('abilities', e.target.value)}
                                placeholder="* (full access)"
                                invalid={errors.abilities ? true : undefined}
                            />
                            <Text>Use flows:read,flows:write,calls:read or * for full access.</Text>
                            {errors.abilities && <ErrorMessage>{errors.abilities}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>Expires in</Label>
                            <Select
                                value={data.expires_in}
                                onChange={(e) => setData('expires_in', e.target.value)}
                            >
                                <option value="never">Never</option>
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                                <option value="365">1 year</option>
                            </Select>
                            {errors.expires_in && <ErrorMessage>{errors.expires_in}</ErrorMessage>}
                        </Field>
                    </form>
                </DialogBody>
                <DialogActions>
                    <Button plain onClick={() => setShowCreate(false)}>Cancel</Button>
                    <Button type="submit" form="create-token-form" disabled={processing}>
                        {processing ? 'Creating...' : 'Generate Token'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Alert open={newToken !== null} onClose={() => setNewToken(null)}>
                <AlertTitle>Token created &mdash; copy it now!</AlertTitle>
                <AlertDescription>
                    You won&rsquo;t be able to see this token again. Copy it to a secure location.
                </AlertDescription>
                <AlertBody>
                    <div className="mt-3">
                        <code className="block overflow-x-auto rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800/50 dark:bg-zinc-900 dark:text-amber-300">
                            {newToken}
                        </code>
                    </div>
                </AlertBody>
                <AlertActions>
                    <Button onClick={() => { navigator.clipboard.writeText(newToken); setNewToken(null); }}>
                        Copy &amp; Close
                    </Button>
                    <Button plain onClick={() => setNewToken(null)}>Dismiss</Button>
                </AlertActions>
            </Alert>

            <Alert open={confirmingRevoke !== null} onClose={() => setConfirmingRevoke(null)}>
                <AlertTitle>Revoke token?</AlertTitle>
                <AlertDescription>
                    This will permanently revoke &ldquo;{confirmingRevoke?.name}&rdquo;. Any services using this token will immediately lose access.
                </AlertDescription>
                <AlertActions>
                    <Button plain onClick={() => setConfirmingRevoke(null)}>Cancel</Button>
                    <Button color="red" onClick={() => revoke(confirmingRevoke?.id, confirmingRevoke?.name)}>Revoke</Button>
                </AlertActions>
            </Alert>
        </AuthenticatedLayout>
    );
}
