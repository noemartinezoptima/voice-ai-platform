import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Input } from '@/Components/catalyst/input';
import { Badge } from '@/Components/catalyst/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { index, store, update, destroy, test } from '@/actions/App/Http/Controllers/Web/WebhookDestinationController';

const EVENT_OPTIONS = [
    { value: 'call.initiated', label: 'Call Initiated' },
    { value: 'call.in_progress', label: 'Call In Progress' },
    { value: 'call.completed', label: 'Call Completed' },
    { value: 'call.failed', label: 'Call Failed' },
    { value: 'call.transferred', label: 'Call Transferred' },
];

const STATUS_COLORS = {
    success: 'emerald',
    failed: 'red',
    pending: 'amber',
    dead: 'zinc',
};

function DeliveryRow({ delivery }) {
    const [showBody, setShowBody] = useState(false);

    return (
        <>
            <TableRow key={delivery.id}>
                <TableCell>
                    <Badge color={STATUS_COLORS[delivery.status] || 'zinc'}>{delivery.status}</Badge>
                </TableCell>
                <TableCell>{delivery.event}</TableCell>
                <TableCell>{delivery.response_code}</TableCell>
                <TableCell>#{delivery.attempt}</TableCell>
                <TableCell className="text-xs text-zinc-500">{new Date(delivery.created_at).toLocaleString()}</TableCell>
                <TableCell>
                    {delivery.response_body && (
                        <button
                            type="button"
                            onClick={() => setShowBody(!showBody)}
                            className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                            {showBody ? 'Hide' : 'View'} body
                        </button>
                    )}
                </TableCell>
            </TableRow>
            {showBody && delivery.response_body && (
                <TableRow>
                    <TableCell colSpan={6} className="bg-zinc-50 dark:bg-zinc-800/50">
                        <pre className="max-h-48 overflow-auto text-xs whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                            {delivery.response_body}
                        </pre>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

export default function Index({ webhooks }) {
    const [showForm, setShowForm] = useState(false);
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [events, setEvents] = useState(['call.completed']);
    const [urlError, setUrlError] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    function validateUrl(value) {
        setUrl(value);
        if (value && !value.startsWith('https://') && !value.startsWith('http://')) {
            setUrlError('URL must start with http:// or https://');
        } else if (value && !/^https?:\/\/.+\..+/.test(value)) {
            setUrlError('Enter a valid URL');
        } else {
            setUrlError('');
        }
    }

    function toggleEvent(event) {
        setEvents((prev) =>
            prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
        );
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (urlError) return;
        router.post(store().url, { url, description, events }, {
            onSuccess: () => { setShowForm(false); setUrl(''); setDescription(''); setEvents(['call.completed']); setUrlError(''); },
        });
    }

    function handleDelete(id) {
        if (confirm('Remove this webhook?')) {
            router.delete(destroy({webhook: id}).url);
        }
    }

    function toggleActive(webhook) {
        router.patch(update({webhook: webhook.id}).url, {
            url: webhook.url,
            events: webhook.events,
            description: webhook.description,
            is_active: !webhook.is_active,
        });
    }

    function handleTest(webhook) {
        router.post(test({webhook: webhook.id}).url);
    }

    return (
        <AuthenticatedLayout>
            <Head title="Webhook Destinations" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Webhook Destinations</Heading>
                    <Text className="mt-1">Send call events to external URLs.</Text>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Add Webhook'}
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-zinc-950/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">URL</label>
                            <Input
                                value={url}
                                onChange={(e) => validateUrl(e.target.value)}
                                placeholder="https://example.com/webhook"
                                required
                                invalid={urlError ? true : undefined}
                            />
                            {urlError && <p className="mt-1 text-xs text-red-600">{urlError}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Events</label>
                            <div className="flex flex-wrap gap-2">
                                {EVENT_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => toggleEvent(opt.value)}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                            events.includes(opt.value)
                                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" disabled={events.length === 0 || !url}>
                            Save Webhook
                        </Button>
                    </div>
                </form>
            )}

            {webhooks.length === 0 && !showForm ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No webhooks</p>
                    <Text className="mt-2">Add webhook destinations to receive call events in real time.</Text>
                </div>
            ) : webhooks.length > 0 && (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>URL</TableHeader>
                                <TableHeader>Events</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Deliveries</TableHeader>
                                <TableHeader className="text-right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {webhooks.map((wh) => (
                                <>
                                    <TableRow key={wh.id} className={expandedId === wh.id ? 'border-b-0' : ''}>
                                        <TableCell className="max-w-xs truncate font-medium">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedId(expandedId === wh.id ? null : wh.id)}
                                                className="hover:underline text-left"
                                            >
                                                {wh.url}
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {wh.events.map((e) => (
                                                    <Badge key={e} color="zinc">{e}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge color={wh.is_active ? 'emerald' : 'zinc'}>
                                                {wh.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge color="zinc">{wh.deliveries_count ?? 0}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button outline onClick={() => handleTest(wh)}>
                                                    Test
                                                </Button>
                                                <Button outline onClick={() => toggleActive(wh)}>
                                                    {wh.is_active ? 'Deactivate' : 'Activate'}
                                                </Button>
                                                <Button outline onClick={() => handleDelete(wh.id)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {expandedId === wh.id && wh.deliveries && wh.deliveries.length > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="bg-zinc-50 dark:bg-zinc-800/30 p-0">
                                                <div className="p-3">
                                                    <Text className="mb-2 text-xs font-semibold uppercase tracking-wider">Recent Deliveries</Text>
                                                    <Table dense>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableHeader>Status</TableHeader>
                                                                <TableHeader>Event</TableHeader>
                                                                <TableHeader>Code</TableHeader>
                                                                <TableHeader>Attempt</TableHeader>
                                                                <TableHeader>Time</TableHeader>
                                                                <TableHeader>Body</TableHeader>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {wh.deliveries.map((d) => (
                                                                <DeliveryRow key={d.id} delivery={d} />
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {expandedId === wh.id && (!wh.deliveries || wh.deliveries.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="bg-zinc-50 dark:bg-zinc-800/30">
                                                <Text className="py-3 text-center text-xs text-zinc-500">No deliveries yet.</Text>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
