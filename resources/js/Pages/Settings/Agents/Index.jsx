import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Input } from '@/Components/catalyst/input';
import { Textarea } from '@/Components/catalyst/textarea';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { index, store, update, destroy, syncFromApi } from '@/actions/App/Http/Controllers/Web/ElevenLabsAgentController';

export default function Index({ agents }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editAgent, setEditAgent] = useState(null);
    const [deleteAgent, setDeleteAgent] = useState(null);

    const { data, setData, processing, errors, reset } = useForm({
        name: '',
        system_prompt: '',
        first_message: '',
    });

    function openCreate() {
        reset();
        setCreateOpen(true);
    }

    function openEdit(agent) {
        setData({
            name: agent.name,
            system_prompt: agent.config?.system_prompt ?? '',
            first_message: agent.config?.first_message ?? '',
        });
        setEditAgent(agent);
    }

    function handleCreate(e) {
        e.preventDefault();
        router.post(store().url, data, {
            onSuccess: () => { setCreateOpen(false); reset(); },
        });
    }

    function handleUpdate(e) {
        e.preventDefault();
        router.patch(update({ agent: editAgent.id }).url, data, {
            onSuccess: () => { setEditAgent(null); reset(); },
        });
    }

    function handleDelete() {
        if (!deleteAgent) return;
        router.delete(destroy({ agent: deleteAgent.id }).url, {
            onSuccess: () => setDeleteAgent(null),
        });
    }

    function handleSync() {
        if (confirm('Sync agents from ElevenLabs? This will import agents created in the ElevenLabs dashboard.')) {
            router.post(syncFromApi().url);
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="AI Agents" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>AI Agents</Heading>
                    <Text className="mt-1">Manage your ElevenLabs conversational AI agents.</Text>
                </div>
                <div className="flex gap-2">
                    <Button outline onClick={handleSync}>Sync from ElevenLabs</Button>
                    <Button onClick={openCreate}>Create Agent</Button>
                </div>
            </div>

            {agents.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No agents</p>
                    <Text className="mt-2">Create an AI agent or sync from ElevenLabs to get started.</Text>
                    <Button onClick={handleSync} className="mt-4">Sync from ElevenLabs</Button>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>ElevenLabs ID</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader className="text-right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {agents.map((agent) => (
                                <TableRow key={agent.id}>
                                    <TableCell className="font-medium">{agent.name}</TableCell>
                                    <TableCell className="font-mono text-xs text-zinc-500">{agent.elevenlabs_agent_id}</TableCell>
                                    <TableCell>
                                        <Badge color={agent.is_active ? 'emerald' : 'zinc'}>
                                            {agent.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button outline onClick={() => openEdit(agent)}>Edit</Button>
                                            <Button outline onClick={() => setDeleteAgent(agent)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
                <DialogTitle>Create AI Agent</DialogTitle>
                <DialogDescription>
                    This will create a new conversational AI agent in your ElevenLabs account.
                </DialogDescription>
                <form onSubmit={handleCreate}>
                    <DialogBody className="space-y-4">
                        <Field>
                            <Label>Name</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required invalid={errors.name ? true : undefined} />
                            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>System Prompt</Label>
                            <Textarea value={data.system_prompt} onChange={(e) => setData('system_prompt', e.target.value)} rows={4} placeholder="You are a helpful assistant..." invalid={errors.system_prompt ? true : undefined} />
                            {errors.system_prompt && <ErrorMessage>{errors.system_prompt}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>First Message</Label>
                            <Input value={data.first_message} onChange={(e) => setData('first_message', e.target.value)} placeholder="Hello! How can I help you?" invalid={errors.first_message ? true : undefined} />
                            {errors.first_message && <ErrorMessage>{errors.first_message}</ErrorMessage>}
                        </Field>
                    </DialogBody>
                    <DialogActions>
                        <Button plain onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Creating...' : 'Create Agent'}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={editAgent !== null} onClose={() => setEditAgent(null)}>
                <DialogTitle>Edit Agent</DialogTitle>
                <DialogDescription>Update the agent configuration.</DialogDescription>
                <form onSubmit={handleUpdate}>
                    <DialogBody className="space-y-4">
                        <Field>
                            <Label>Name</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required invalid={errors.name ? true : undefined} />
                            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>System Prompt</Label>
                            <Textarea value={data.system_prompt} onChange={(e) => setData('system_prompt', e.target.value)} rows={4} placeholder="You are a helpful assistant..." invalid={errors.system_prompt ? true : undefined} />
                            {errors.system_prompt && <ErrorMessage>{errors.system_prompt}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>First Message</Label>
                            <Input value={data.first_message} onChange={(e) => setData('first_message', e.target.value)} placeholder="Hello! How can I help you?" invalid={errors.first_message ? true : undefined} />
                            {errors.first_message && <ErrorMessage>{errors.first_message}</ErrorMessage>}
                        </Field>
                    </DialogBody>
                    <DialogActions>
                        <Button plain onClick={() => setEditAgent(null)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={deleteAgent !== null} onClose={() => setDeleteAgent(null)}>
                <DialogTitle>Delete Agent</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete "{deleteAgent?.name}"? This will also remove it from ElevenLabs.
                </DialogDescription>
                <DialogActions>
                    <Button plain onClick={() => setDeleteAgent(null)}>Cancel</Button>
                    <Button color="red" onClick={handleDelete} disabled={processing}>
                        {processing ? 'Deleting...' : 'Delete Agent'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
